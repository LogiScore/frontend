// Subscription plans data and utilities

export interface Plan {
	id: number;
	name: string;
	price: number;
	description: string;
	features: string[];
	popular?: boolean;
	billingCycle: string;
	annualPrice?: number;
}

export interface UserPlans {
	userPlans: Plan[];
	forwarderPlans: Plan[];
}

const userPlans: Plan[] = [
	{
		id: 1,
		name: 'Free',
		price: 0,
		description: 'Basic access to freight forwarder reviews',
		features: [
			'Browse forwarders and company reviews',
			'Submit reviews (registered users only)',
			'Anonymous review submissions',
			'Visual star ratings only',
			'Basic company profiles',
			'Email support'
		],
		billingCycle: 'month'
	},
	{
		id: 2,
		name: 'Subscription',
		price: 38,
		annualPrice: 418,
		description: 'Full access to detailed reviews and analytics',
		features: [
			'Everything in Free',
			'Full numerical score display',
			'Company/country/branch level reviews',
			'Category-based reviews',
			'Search reviews by company/country/branch',
			'Email notifications for new reviews',
			'Score drop alerts',
			'Trend analysis (12-24 months)',
			'Compare multiple forwarders',
			'Export reports',
			'Priority support'
		],
		popular: true,
		billingCycle: 'month'
	}
];

const forwarderPlans: Plan[] = [
	{
		id: 3,
		name: 'Free',
		price: 0,
		description: 'Basic listing for freight forwarders',
		features: [
			'Browse forwarders and company reviews',
			'Visual star ratings only',
			'Basic company profiles'
		],
		billingCycle: 'month'
	},
	{
		id: 4,
		name: 'Subscription',
		price: 76,
		annualPrice: 836,
		description: 'Enhanced visibility and review management',
		features: [
			'Everything in Free',
			'Full numerical score display',
			'Company/country/branch level reviews',
			'Category-based reviews',
			'Analytics dashboard',
			'Trend analysis (12-24 months)',
			'Review notifications'
		],
		billingCycle: 'month'
	},
	{
		id: 5,
		name: 'Subscription Plus',
		price: 3450,
		description: 'Maximum visibility and control for businesses',
		features: [
			'Everything in Subscription',
			'Up to 3 concurrent users',
			'Manage forwarder profile description',
			'Branded ads on company page',
			'View aggregated scores by region/country',
			'Comment on reviews',
			'Shipper contact via LogiScore',
			'Best in category per country badge',
			'Advanced analytics',
			'Dedicated account manager'
		],
		popular: true,
		billingCycle: 'year'
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
