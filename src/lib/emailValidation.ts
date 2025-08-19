// Email validation utility for LogiScore
// Prevents registration with free email services to maintain platform integrity

// List of prohibited free email providers
export const PROHIBITED_EMAIL_DOMAINS = [
  // Chinese free email services
  '126.com',      // NetEase Mail
  '139.com',      // China Mobile Mail
  '163.com',      // NetEase Mail
  '189.cn',       // China Telecom Mail
  '21cn.com',
  'aliyun.com',   // Alibaba Cloud Mail
  'aliyun.cn',    // Alibaba Cloud Mail
  'eyou.com',     // Netease Mail
  'qq.com',       // Tencent QQ Mail
  'sina.com',     // Sina Mail
  'sina.cn',      // Sina Mail
  'sohu.com',     // Sohu Mail
  'tom.com',      // TOM Mail
  'wo.cn',        // China Unicom Mail
  'wo.com.cn',    // China Unicom Mail
  'yeah.net',     // NetEase free email service
  
  // German free email services
  'arcor.de',     // Vodafone
  'emailn.de',
  'freenet.de',
  'gmx.com',      // 1&1 Mail & Media
  'gmx.de',       // 1&1 Mail & Media
  'gmx.net',      // 1&1 Mail & Media
  'mail.de',
  'online.de',
  't-online.de',  // Deutsche Telekom
  'web.de',       // 1&1 Mail & Media
  
  // International free email services
  'gmail.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'mail.com',
  'outlook.com',
  'protonmail.com',
  'yahoo.com',
  'yandex.com',
  'zoho.com'
];

/**
 * Validates if an email address is from a prohibited free email provider
 * @param email - The email address to validate
 * @returns Object with validation result and details
 */
export function validateBusinessEmail(email: string): {
  isValid: boolean;
  domain: string;
  isProhibited: boolean;
  reason?: string;
} {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      domain: '',
      isProhibited: false,
      reason: 'Invalid email format'
    };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      domain: '',
      isProhibited: false,
      reason: 'Invalid email format'
    };
  }

  // Extract domain from email
  const domain = email.toLowerCase().split('@')[1];
  
  if (!domain) {
    return {
      isValid: false,
      domain: '',
      isProhibited: false,
      reason: 'Invalid email domain'
    };
  }

  // Check if domain is in prohibited list
  const isProhibited = PROHIBITED_EMAIL_DOMAINS.includes(domain);
  
  if (isProhibited) {
    return {
      isValid: false,
      domain,
      isProhibited: true,
      reason: `Free email providers are not allowed. Please use a corporate or business email address.`
    };
  }

  return {
    isValid: true,
    domain,
    isProhibited: false
  };
}

/**
 * Gets a user-friendly error message for prohibited email domains
 * @param domain - The prohibited domain
 * @returns Error message string
 */
export function getProhibitedEmailMessage(domain: string): string {
  return `Registration with ${domain} is not allowed. Please use a corporate or business email address instead.`;
}

/**
 * Checks if a domain is in the prohibited list
 * @param domain - The domain to check
 * @returns Boolean indicating if domain is prohibited
 */
export function isProhibitedDomain(domain: string): boolean {
  return PROHIBITED_EMAIL_DOMAINS.includes(domain.toLowerCase());
}
