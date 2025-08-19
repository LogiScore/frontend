// Test file for email validation functionality
// Run with: node test-email-validation.js

// Mock the email validation module for testing
const { validateBusinessEmail, isProhibitedDomain } = require('./src/lib/emailValidation.ts');

// Test cases
const testEmails = [
  // Valid business emails
  'john.doe@company.com',
  'sales@logisticscorp.com',
  'info@freightforwarder.net',
  'admin@business.org',
  
  // Invalid free email services
  'user@gmail.com',
  'test@yahoo.com',
  'demo@hotmail.com',
  'sample@outlook.com',
  'user@icloud.com',
  'test@protonmail.com',
  'demo@zoho.com',
  
  // Chinese free email services
  'user@qq.com',
  'test@163.com',
  'demo@sina.com',
  
  // German free email services
  'user@gmx.de',
  'test@web.de',
  'demo@t-online.de',
  
  // Edge cases
  '',
  'invalid-email',
  'test@',
  '@domain.com',
  'test@domain',
  'test@.com'
];

console.log('🧪 Testing Email Validation\n');

testEmails.forEach(email => {
  try {
    const result = validateBusinessEmail(email);
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    const reason = result.reason ? ` - ${result.reason}` : '';
    
    console.log(`${status}: ${email}${reason}`);
    
    if (result.domain) {
      const isProhibited = isProhibitedDomain(result.domain);
      if (isProhibited) {
        console.log(`   🚫 Domain "${result.domain}" is in prohibited list`);
      }
    }
  } catch (error) {
    console.log(`❌ ERROR: ${email} - ${error.message}`);
  }
});

console.log('\n📋 Summary:');
console.log('- Email validation should reject free email services');
console.log('- Email validation should accept business/corporate domains');
console.log('- Email validation should handle edge cases gracefully');
