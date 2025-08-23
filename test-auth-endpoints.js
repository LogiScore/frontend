// Test script to verify backend authentication endpoints
// Run this in your browser console or as a Node.js script

const BASE_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

async function testSigninEndpoint(email) {
  console.log('🧪 Testing sign-in endpoint for:', email);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/send-signin-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success response:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return { error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('💥 Network error:', error);
    return { error: error.message };
  }
}

async function testSignupEndpoint(email, userType, companyName) {
  console.log('🧪 Testing sign-up endpoint for:', email, userType, companyName);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/send-signup-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        user_type: userType, 
        company_name: companyName 
      }),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success response:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return { error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('💥 Network error:', error);
    return { error: error.message };
  }
}

// Test functions
async function runTests() {
  console.log('🚀 Starting authentication endpoint tests...');
  
  // Test 1: Try to sign in with a non-existent email
  console.log('\n📋 Test 1: Sign-in with non-existent email');
  const testEmail1 = 'nonexistent@example.com';
  const result1 = await testSigninEndpoint(testEmail1);
  
  // Test 2: Try to sign up with a new email
  console.log('\n📋 Test 2: Sign-up with new email');
  const testEmail2 = 'newuser@example.com';
  const result2 = await testSignupEndpoint(testEmail2, 'shipper', 'Test Company');
  
  // Test 3: Try to sign up with the same email again (should fail)
  console.log('\n📋 Test 3: Sign-up with duplicate email');
  const result3 = await testSignupEndpoint(testEmail2, 'shipper', 'Test Company');
  
  console.log('\n📊 Test Results Summary:');
  console.log('Test 1 (Sign-in non-existent):', result1);
  console.log('Test 2 (Sign-up new):', result2);
  console.log('Test 3 (Sign-up duplicate):', result3);
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAuthEndpoints = {
    testSigninEndpoint,
    testSignupEndpoint,
    runTests
  };
  console.log('🧪 Test functions available as window.testAuthEndpoints');
}

// Run tests if this is a Node.js script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testSigninEndpoint, testSignupEndpoint, runTests };
}
