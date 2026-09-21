"""
Backend Automated Test Suite

Tests all REST API endpoints, database operations, error handling, and statistics calculations.
Run with: python test_backend.py
"""
import sys
from pathlib import Path

# Ensure backend directory is in path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

def run_tests():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.database import init_db
    
    print("==================================================")
    print(" Running Backend Verification Test Suite")
    print("==================================================")

    init_db()
    client = TestClient(app)

    # 1. Health API Test
    print("\n[1/7] Testing GET /api/health ...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"  Status: {health_data['status']}, Service: {health_data['service']}")

    # 2. Clear Database Before Test
    print("\n[2/7] Testing DELETE /api/history (Clear DB) ...")
    res = client.delete("/api/history")
    assert res.status_code == 200, f"Delete history failed: {res.text}"
    print(f"  Response: {res.json()['message']}")

    # 3. Test Empty DB Stats & History
    print("\n[3/7] Testing empty database behavior ...")
    res = client.get("/api/history")
    assert res.status_code == 200 and res.json() == [], "History on empty DB should be empty list []"
    
    res = client.get("/api/stats")
    assert res.status_code == 200, f"Stats on empty DB failed: {res.text}"
    stats_empty = res.json()
    assert stats_empty["total_analyses"] == 0, "Total analyses should be 0"
    print("  Empty DB history and stats verified successfully.")

    # 4. Error Handling Verification
    print("\n[4/7] Testing input validation & error handling ...")
    # Empty text
    res = client.post("/api/analyze", json={"text": "   "})
    assert res.status_code == 422, "Empty text should return 422"
    print(f"  Empty text error message: {res.json()['detail']}")

    # Text > 1000 characters
    long_text = "a" * 1001
    res = client.post("/api/analyze", json={"text": long_text})
    assert res.status_code == 422, "Long text > 1000 chars should return 422"
    print(f"  Text > 1000 chars error message: {res.json()['detail']}")

    # Non-existent ID
    res = client.get("/api/history/99999")
    assert res.status_code == 404, "Non-existent ID should return 404"
    print(f"  Invalid ID error message: {res.json()['detail']}")

    # 5. Analysis API Verification (with 3 required test sentences)
    print("\n[5/7] Testing POST /api/analyze with real text inputs ...")
    test_inputs = [
        "I am very happy with this product!",
        "I am angry about this problem.",
        "The meeting is tomorrow."
    ]

    created_ids = []
    for text_input in test_inputs:
        res = client.post("/api/analyze", json={"text": text_input})
        assert res.status_code == 201, f"Analyze failed for '{text_input}': {res.text}"
        data = res.json()
        created_ids.append(data["id"])
        print(f"  Analyzed ID #{data['id']}: '{text_input[:30]}...'")
        print(f"    Sentiment: {data['sentiment']} ({data['sentiment_confidence']:.4f})")
        print(f"    Emotion:   {data['emotion']} ({data['emotion_confidence']:.4f})")
        print(f"    Keywords:  {data['keywords']}")

    # 6. History API Verification
    print("\n[6/7] Testing GET /api/history & GET /api/history/{id} ...")
    res = client.get("/api/history")
    assert res.status_code == 200, f"Get history failed: {res.text}"
    history_items = res.json()
    assert len(history_items) == len(test_inputs), f"Expected {len(test_inputs)} history records, got {len(history_items)}"
    assert history_items[0]["id"] == created_ids[-1], "Newest record should appear first"
    print(f"  Retrieved {len(history_items)} history records cleanly in reverse chronological order.")

    # Single Record GET
    single_id = created_ids[0]
    res = client.get(f"/api/history/{single_id}")
    assert res.status_code == 200, f"Get single record #{single_id} failed: {res.text}"
    print(f"  Single record GET #{single_id} verified successfully.")

    # 7. Dynamic Stats API Verification
    print("\n[7/7] Testing GET /api/stats calculation ...")
    res = client.get("/api/stats")
    assert res.status_code == 200, f"Get stats failed: {res.text}"
    stats = res.json()
    print(f"  Total Analyses: {stats['total_analyses']}")
    print(f"  Sentiment Counts: {stats['sentiment_counts']}")
    print(f"  Emotion Counts:   {stats['emotion_counts']}")
    print(f"  Avg Sentiment Confidence: {stats['average_sentiment_confidence']}")
    print(f"  Avg Emotion Confidence:   {stats['average_emotion_confidence']}")
    assert stats["total_analyses"] == len(test_inputs), "Total analyses count mismatch"

    print("\n==================================================")
    print(" ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    run_tests()
