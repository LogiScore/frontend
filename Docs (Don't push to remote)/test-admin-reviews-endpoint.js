// Test script to verify the current /admin/reviews endpoint response
// Run this in browser console on the admin page to see what data is being returned

async function testAdminReviewsEndpoint() {
  try {
    // Get the auth token from localStorage or current session
    const token = localStorage.getItem('auth_token') || 'your-token-here';
    
    console.log('🔍 Testing /admin/reviews endpoint...');
    console.log('Token:', token.substring(0, 20) + '...');
    
    const response = await fetch('https://logiscorebe.onrender.com/admin/reviews', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response received:');
    console.log('Total reviews:', data.length);
    
    if (data.length > 0) {
      console.log('📋 Sample review data structure:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('🔍 Available fields:');
      console.log(Object.keys(data[0]));
      
      console.log('🚨 Issues found:');
      
      // Check for company name issues
      if (data[0].freight_forwarder_name && data[0].freight_forwarder_name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('❌ freight_forwarder_name is a UUID instead of company name');
      } else {
        console.log('✅ freight_forwarder_name looks like a proper name');
      }
      
      // Check for shipment reference
      if (data[0].shipment_reference === undefined) {
        console.log('❌ shipment_reference field is missing from response');
      } else if (data[0].shipment_reference === null || data[0].shipment_reference === '') {
        console.log('⚠️ shipment_reference is null/empty (this might be expected)');
      } else {
        console.log('✅ shipment_reference field is present');
      }
      
      // Check for branch name
      if (!data[0].branch_name || data[0].branch_name === 'N/A') {
        console.log('⚠️ branch_name is missing or N/A');
      } else {
        console.log('✅ branch_name is present');
      }
    } else {
      console.log('📭 No reviews found in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
    console.log('💡 Make sure you are logged in as an admin user');
  }
}

// Instructions for use:
console.log(`
🚀 To test the admin reviews endpoint:

1. Open the admin dashboard (8x7k9m2p page)
2. Make sure you're logged in as an admin
3. Open browser console (F12)
4. Copy and paste this entire script
5. Run: testAdminReviewsEndpoint()

This will show you exactly what data the backend is returning.
`);

// Export for use
window.testAdminReviewsEndpoint = testAdminReviewsEndpoint;
