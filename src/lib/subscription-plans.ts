// Subscription plans data and utilities

export interface Plan {
	id: number;
	name: string;
	price: number;
	description: string;
	features: string[];
	popular?: boolean;
	billingCycle: string;
	planType: 'monthly' | 'annual';
}

export interface UserPlans {
	userPlans: Plan[];
	forwarderPlans: Plan[];
}

const userPlans: Plan[] = [
	{
		id: 1,
		name: '',
		price: 0,
		description: 'Basic access to freight forwarder reviews',
		features: [
			'Browse forwarders and aggregated company level reviews',
			'Submit reviews (registered users only)',
			'Anonymous review submissions',
			'Visual star ratings'
		],
		billingCycle: 'month',
		planType: 'monthly'
	},
	{
		id: 2,
		name: 'Subscription Monthly',
		price: 38,
		description: 'Full access to detailed reviews and analytics',
		features: [
			'Single user subscription',
			'Browse forwarders and view aggregated company, country, branch level reviews and by category',
			'Search reviews by company, country and branch',
			'Compare multiple forwarders side-by-side by score, category, country, or branch',
			'Full numerical score display (e.g., 4.2/5.0)'
		],
		billingCycle: 'month',
		planType: 'monthly'
	},
	{
		id: 3,
		name: 'Subscription Annual',
		price: 418,
		description: 'Full access to detailed reviews and analytics (annual billing)',
		features: [
			'Same as monthly subscription plus:',
			'Receive email notifications when new reviews are posted about specific forwarders',
			'Get notified if a forwarder\'s score drops by X% or below a threshold',
			'Access trends of forwarder scores over time',
			'Full numerical score',
			'Save $38/year compared to monthly billing'
		],
		popular: true,
		billingCycle: 'year',
		planType: 'annual'
	}
];

const forwarderPlans: Plan[] = [
	{
		id: 4,
		name: '',
		price: 0,
		description: 'Basic listing for freight forwarders',
		features: [
			'Browse forwarders and aggregated company level reviews',
			'View star ratings'
		],
		billingCycle: 'month',
		planType: 'monthly'
	},
	{
		id: 5,
		name: 'Subscription Monthly',
		price: 76,
		description: 'Enhanced visibility and review management',
		features: [
			'Browse forwarders and view aggregated company, country, branch level reviews and by category'
		],
		billingCycle: 'month',
		planType: 'monthly'
	},
	{
		id: 6,
		name: 'Subscription Annual',
		price: 836,
		description: 'Enhanced visibility and review management (annual billing)',
		features: [
			'Browse forwarders and view aggregated company, country and branch level reviews and by category',
			'Save $76/year compared to monthly billing'
		],
		billingCycle: 'year',
		planType: 'annual'
	},
	{
		id: 7,
		name: 'Subscription Annual Plus',
		price: 3450,
		description: 'Maximum visibility and control for businesses',
		features: [
			'Up to three concurrent users',
			'Manage forwarder profile description',
			'Freight Forwarder Branded ads on their page',
			'View aggregated scores by region and country',
			'Comment on reviews',
			'Receive email notification when a new review is posted',
			'Shipper able to contact Freight Forwarder via LogiScore',
			'Best in category per country badge',
			'Analytics',
			'Access trend of scores over time (past 12-24 months, category-by-category)'
		],
		popular: true,
		billingCycle: 'year',
		planType: 'annual'
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
