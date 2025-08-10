// Subscription plans data and utilities

export interface Plan {
	id: number;
	name: string;
	price: number;
	description: string;
	features: string[];
	popular?: boolean;
	billingCycle: string;
}

export interface UserPlans {
	userPlans: Plan[];
	forwarderPlans: Plan[];
}

const userPlans: Plan[] = [
	{
		id: 1,
		name: 'Basic',
		price: 29,
		description: 'Essential freight forwarder reviews',
		features: [
			'Search freight forwarders',
			'Read basic reviews',
			'Submit reviews',
			'Basic company profiles',
			'Email support'
		],
		billingCycle: 'month'
	},
	{
		id: 2,
		name: 'Pro',
		price: 79,
		description: 'Advanced features for serious users',
		features: [
			'Everything in Basic',
			'Detailed analytics',
			'Branch-level reviews',
			'Advanced search filters',
			'Export reports',
			'Priority support',
			'Custom alerts'
		],
		popular: true,
		billingCycle: 'month'
	},
	{
		id: 3,
		name: 'Enterprise',
		price: 199,
		description: 'Complete solution for businesses',
		features: [
			'Everything in Pro',
			'API access',
			'Custom integrations',
			'Dedicated account manager',
			'White-label reports',
			'Advanced analytics',
			'24/7 phone support'
		],
		billingCycle: 'month'
	}
];

const forwarderPlans: Plan[] = [
	{
		id: 4,
		name: 'Starter',
		price: 29,
		description: 'Basic listing for freight forwarders',
		features: [
			'Company profile',
			'Basic listing',
			'Review notifications',
			'Basic analytics'
		],
		billingCycle: 'month'
	},
	{
		id: 5,
		name: 'Professional',
		price: 79,
		description: 'Enhanced visibility and features',
		features: [
			'All Starter features',
			'Enhanced profile',
			'Analytics dashboard',
			'Priority placement',
			'Review management'
		],
		popular: true,
		billingCycle: 'month'
	},
	{
		id: 6,
		name: 'Premium',
		price: 199,
		description: 'Maximum visibility and control',
		features: [
			'All Professional features',
			'Custom branding',
			'Advanced analytics',
			'Dedicated account manager',
			'API access'
		],
		billingCycle: 'month'
	}
];

export function getPlansForUserType(userType: 'shipper' | 'forwarder' = 'shipper'): Plan[] {
	return userType === 'shipper' ? userPlans : forwarderPlans;
}

export function getAllPlans(): UserPlans {
	return {
		userPlans,
		forwarderPlans
	};
}
