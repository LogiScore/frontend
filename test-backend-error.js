// Test script to debug the backend 500 error
// Run this in your browser console

const BACKEND_URL = 'https://logiscorebe.onrender.com';

async function debugBackendError() {
  console.log('🔍 Debugging backend 500 error...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/send-signin-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response status text:', response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get the response body regardless of status
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('📡 Response body:', responseText);
    } catch (parseError) {
      console.log('❌ Could not read response body:', parseError);
    }
    
    if (response.ok) {
      console.log('✅ Request successful');
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Parsed response data:', data);
      } catch (parseError) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else {
      console.log('❌ Request failed with status:', response.status);
      
      // Try to parse error response
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          console.log('❌ Error response data:', errorData);
        } catch (parseError) {
          console.log('⚠️ Error response is not valid JSON');
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Network error:', error);
  }
}

async function testAllAuthEndpoints() {
  console.log('🧪 Testing all authentication endpoints...');
  
  const endpoints = [
    '/api/auth/send-signin-code',
    '/api/auth/send-signup-code',
    '/api/auth/verify-signin-code',
    '/api/auth/verify-signup-code'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📋 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error');
        console.log(`  Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`  Network Error: ${error.message}`);
    }
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.debugBackend = {
    debugBackendError,
    testAllAuthEndpoints
  };
  console.log('🧪 Debug functions available as window.debugBackend');
  console.log('  - window.debugBackend.debugBackendError()');
  console.log('  - window.debugBackend.testAllAuthEndpoints()');
}
