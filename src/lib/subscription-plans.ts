// Subscription plans data and utilities

export interface Plan {
	id: number;
	name: string;
	price: number;
	description: string;
	features: string[];
	popular?: boolean;
}

export interface UserPlans {
	userPlans: Plan[];
	forwarderPlans: Plan[];
}

const userPlans: Plan[] = [
	{
		id: 1,
		name: 'Basic',
		price: 9.99,
		description: 'Essential freight forwarder reviews',
		features: [
			'Access to basic reviews',
			'Search functionality',
			'Email support'
		]
	},
	{
		id: 2,
		name: 'Pro',
		price: 19.99,
		description: 'Advanced features for serious users',
		features: [
			'All Basic features',
			'Advanced search filters',
			'Priority support',
			'Export data'
		],
		popular: true
	},
	{
		id: 3,
		name: 'Enterprise',
		price: 49.99,
		description: 'Complete solution for businesses',
		features: [
			'All Pro features',
			'API access',
			'Custom integrations',
			'Dedicated support'
		]
	}
];

const forwarderPlans: Plan[] = [
	{
		id: 4,
		name: 'Starter',
		price: 29.99,
		description: 'Basic listing for freight forwarders',
		features: [
			'Company profile',
			'Basic listing',
			'Review notifications'
		]
	},
	{
		id: 5,
		name: 'Professional',
		price: 79.99,
		description: 'Enhanced visibility and features',
		features: [
			'All Starter features',
			'Enhanced profile',
			'Analytics dashboard',
			'Priority placement'
		],
		popular: true
	},
	{
		id: 6,
		name: 'Premium',
		price: 199.99,
		description: 'Maximum visibility and control',
		features: [
			'All Professional features',
			'Custom branding',
			'Advanced analytics',
			'Dedicated account manager'
		]
	}
];

export function getPlansForUserType(userType: 'user' | 'forwarder' = 'user'): Plan[] {
	return userType === 'user' ? userPlans : forwarderPlans;
}

export function getAllPlans(): UserPlans {
	return {
		userPlans,
		forwarderPlans
	};
}
