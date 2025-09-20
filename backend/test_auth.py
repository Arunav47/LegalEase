#!/usr/bin/env python3
"""Test authentication for the model service."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_auth():
    """Test Google Cloud authentication."""
    try:
        from backend.services.model.model_service import generate_with_prompt
        
        print("Testing authentication...")
        
        # Check environment variables
        project_id = os.environ.get("PROJECT_ID")
        credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        
        print(f"Project ID: {project_id}")
        print(f"Credentials Path: {credentials_path}")
        
        if not project_id:
            print("❌ PROJECT_ID not set in environment")
            return False
            
        if not credentials_path:
            print("❌ GOOGLE_APPLICATION_CREDENTIALS not set in environment")
            return False
            
        if not os.path.exists(credentials_path):
            print(f"❌ Credentials file not found: {credentials_path}")
            return False
        
        # Test the model service
        result = generate_with_prompt("Hello, can you help me analyze legal documents?")
        print("✅ Model service working!")
        print(f"Response: {result[:100]}...")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_auth()