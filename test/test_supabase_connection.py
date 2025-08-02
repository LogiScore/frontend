#!/usr/bin/env python3
"""
Test script for Supabase database connection
Run with: python3 test_supabase_connection.py
"""

import os
import sys

# Set environment variables with Supavisor connection string
os.environ["DATABASE_URL"] = "postgres://postgres.rzhjbmumlayrwdbfgmrk:kktsdE6KJ2ZlKbO1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
os.environ["SUPABASE_URL"] = "https://rzhjbmumlayrwdbfgmrk.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aGpibXVtbGF5cndkYmZnbXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NzM4NzEsImV4cCI6MjA2OTM0OTg3MX0.CDhOHun9QR0glcUB3U5lo2LoH_hbijFXuVdfJQkuw3k"

def test_supabase_connection():
    print("🚀 Starting Supabase connection test...")
    print("=" * 50)
    
    try:
        # Check if we have the required packages
        try:
            import psycopg2
            print("✅ psycopg2 imported successfully")
        except ImportError:
            print("❌ psycopg2 not found. Install with: pip install psycopg2-binary")
            return False
        
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            print("❌ DATABASE_URL not found in environment variables")
            return False
        
        print("🔗 Attempting to connect to Supabase...")
        print(f"🔐 Connection string: {database_url[:60]}...")
        
        # Connect to database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Test basic connection
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Connected successfully!")
        print(f"🐘 PostgreSQL version: {version[0]}")
        
        # Test if our tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"📋 Found {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Test freight_forwarders table
        try:
            cursor.execute("SELECT COUNT(*) FROM freight_forwarders;")
            ff_count = cursor.fetchone()[0]
            print(f"🚛 Freight forwarders table has {ff_count} records")
        except Exception as e:
            print(f"⚠️  Freight forwarders table test failed: {e}")
        
        conn.close()
        print("✅ Connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check if your Supabase project allows direct connections")
        print("2. Verify the database password is correct")
        print("3. Make sure you've run the SQL schema in Supabase")
        print("4. Try using the Supabase client instead of direct connection")
        return False

if __name__ == "__main__":
    print("🧪 LogiScore Supabase Connection Test")
    print("=" * 50)
    
    success = test_supabase_connection()
    
    if success:
        print("\n🎉 All tests passed! Your Supabase connection is working.")
    else:
        print("\n💥 Tests failed. Check the errors above.")
        sys.exit(1) 