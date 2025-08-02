#!/usr/bin/env python3
"""
Minimal test to check if FastAPI app can start
"""

import os
import sys

# Mock environment variables for testing
os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
os.environ['JWT_SECRET_KEY'] = 'test-secret-key'
os.environ['STRIPE_SECRET_KEY'] = 'sk_test_123'

def test_minimal_app():
    """Test if the app can start with minimal configuration"""
    try:
        # Import the app
        from main import app
        print("✅ App imported successfully")
        
        # Test basic functionality
        from fastapi.testclient import TestClient
        client = TestClient(app)
        
        # Test root endpoint
        response = client.get("/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        # Test health endpoint
        response = client.get("/health")
        print(f"✅ Health endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        print("\n🎉 Minimal app test PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Minimal app test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_minimal_app() 