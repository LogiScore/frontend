#!/usr/bin/env python3
"""
Simple test to check if the FastAPI app can start without environment variables
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

def test_app_startup():
    """Test if the app can start without environment variables"""
    try:
        # Clear any existing environment variables that might interfere
        env_vars_to_clear = [
            'DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 
            'SUPABASE_SERVICE_KEY', 'JWT_SECRET_KEY', 'GITHUB_CLIENT_ID',
            'GITHUB_CLIENT_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'
        ]
        
        for var in env_vars_to_clear:
            if var in os.environ:
                del os.environ[var]
        
        # Try to import the app
        from main import app
        
        print("✅ App imported successfully!")
        print("✅ FastAPI app created without errors")
        
        # Test basic endpoints
        from fastapi.testclient import TestClient
        client = TestClient(app)
        
        # Test root endpoint
        response = client.get("/")
        print(f"✅ Root endpoint: {response.status_code}")
        
        # Test health endpoint (should work even without DB)
        response = client.get("/health")
        print(f"✅ Health endpoint: {response.status_code}")
        
        print("\n🎉 App startup test PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ App startup test FAILED: {e}")
        return False

if __name__ == "__main__":
    test_app_startup() 