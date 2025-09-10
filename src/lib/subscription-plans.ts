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
	stripe_price_id?: string;
	stripe_product_id?: string;
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
			'Search for Forwarders and view aggregated scores by company, country and branch locations',
			'Search for locations and view aggregated scores of Forwarders by service category side-by-side',
			'Full numerical score display (e.g., 4.2/5.0)'
		],
		billingCycle: 'month',
		planType: 'monthly',
		stripe_price_id: 'price_1Rxlqv2OLXWq2oiietu8CyKM',
		stripe_product_id: 'prod_StYy4QPzGhoMQU'
	},
	{
		id: 3,
		name: 'Subscription Annual',
		price: 418,
		description: 'Full access to detailed reviews and analytics (annual billing)',
		features: [
			'Same as monthly subscription plus:',
			'Receive email notifications when new reviews are posted about specific forwarders',
			'Get notified if a forwarder\'s score drops below a threshold',
			'Access trends of forwarder scores over time',
			'Full numerical score',
			'Save $38/year compared to monthly billing'
		],
		popular: true,
		billingCycle: 'year',
		planType: 'annual',
		stripe_price_id: 'price_1Rxls62OLXWq2oiiIdJoqCCI',
		stripe_product_id: 'prod_annual_shipper'
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
			'Search for Forwarders and view aggregated scores by company, country and branch locations'
		],
		billingCycle: 'month',
		planType: 'monthly',
		stripe_price_id: 'price_1RxltP2OLXWq2oii2DWmg31v',
		stripe_product_id: 'prod_forwarder_monthly'
	},
	{
		id: 6,
		name: 'Subscription Annual',
		price: 836,
		description: 'Enhanced visibility and review management (annual billing)',
		features: [
			'Search for Forwarders and view aggregated scores by company, country and branch locations',
			'Save $76/year compared to monthly billing'
		],
		popular: true,
		billingCycle: 'year',
		planType: 'annual',
		stripe_price_id: 'price_1Rxlu52OLXWq2oiiFPxI4mVK',
		stripe_product_id: 'prod_forwarder_annual'
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
			'Best in location badge',
			'Analytics',
			'Access trend of scores over time (past 12-24 months, category-by-category)'
		],
		billingCycle: 'year',
		planType: 'annual',
		stripe_price_id: 'price_1Rxlux2OLXWq2oiix7Mc8aG5',
		stripe_product_id: 'prod_forwarder_annual_plus'
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
