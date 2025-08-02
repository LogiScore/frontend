// Subscription plans configuration
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  userType: 'shipper' | 'forwarder';
  isPopular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  // Shipper Plans
  {
    id: 'shipper-basic',
    name: 'Shipper Basic',
    description: 'Essential features for small to medium shippers',
    price: 29,
    currency: 'USD',
    billingCycle: 'monthly',
    userType: 'shipper',
    features: [
      'Access to freight forwarder reviews',
      'Basic search and filtering',
      'Contact information for forwarders',
      'Email support'
    ]
  },
  {
    id: 'shipper-premium',
    name: 'Shipper Premium',
    description: 'Advanced features for growing businesses',
    price: 79,
    currency: 'USD',
    billingCycle: 'monthly',
    userType: 'shipper',
    isPopular: true,
    features: [
      'All Basic features',
      'Priority customer support',
      'Advanced analytics and reporting',
      'Custom alerts and notifications',
      'API access for integrations',
      'Dedicated account manager'
    ]
  },
  {
    id: 'shipper-enterprise',
    name: 'Shipper Enterprise',
    description: 'Full-featured solution for large enterprises',
    price: 199,
    currency: 'USD',
    billingCycle: 'monthly',
    userType: 'shipper',
    features: [
      'All Premium features',
      'White-label solutions',
      'Custom integrations',
      '24/7 phone support',
      'Advanced security features',
      'Multi-user management'
    ]
  },

  // Freight Forwarder Plans
  {
    id: 'forwarder-basic',
    name: 'Forwarder Basic',
    description: 'Essential features for freight forwarders',
    price: 49,
    currency: 'USD',
    billingCycle: 'monthly',
    userType: 'forwarder',
    features: [
      'Company profile listing',
      'Basic review management',
      'Customer inquiry responses',
      'Email support'
    ]
  },
  {
    id: 'forwarder-premium',
    name: 'Forwarder Premium',
    description: 'Advanced features for established forwarders',
    price: 99,
    currency: 'USD',
    billingCycle: 'monthly',
    userType: 'forwarder',
    isPopular: true,
    features: [
      'All Basic features',
      'Advanced analytics dashboard',
      'Review response automation',
      'Priority listing placement',
      'Marketing tools and insights',
      'Dedicated account manager'
    ]
  },
  {
    id: 'forwarder-enterprise',
    name: 'Forwarder Enterprise',
    description: 'Complete solution for large forwarders',
    price: 299,
    currency: 'USD',
    billingCycle: 'monthly',
    userType: 'forwarder',
    features: [
      'All Premium features',
      'Custom branding options',
      'Advanced API access',
      '24/7 phone support',
      'Multi-location management',
      'Advanced dispute resolution tools'
    ]
  }
];

// Helper functions
export function getPlansForUserType(userType: 'shipper' | 'forwarder'): SubscriptionPlan[] {
  return subscriptionPlans.filter(plan => plan.userType === userType);
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === planId);
}

export function getPopularPlanForUserType(userType: 'shipper' | 'forwarder'): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.userType === userType && plan.isPopular);
} 