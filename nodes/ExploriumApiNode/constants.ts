// Business enrichment options
export const businessEnrichmentOptions = [
	{
		name: 'Firmographics',
		value: 'firmographics',
		description: 'Company size, industry, location',
	},
	{ name: 'Technographics', value: 'technographics', description: 'Technology stack and tools' },
	{
		name: 'Company Ratings',
		value: 'company_ratings',
		description: 'Employee ratings and reviews',
	},
	{
		name: 'Financial Metrics',
		value: 'financial_metrics',
		description: 'Financial indicators for public companies',
	},
	{
		name: 'Funding & Acquisitions',
		value: 'funding_and_acquisitions',
		description: 'Investment and acquisition history',
	},
	{ name: 'Business Challenges', value: 'challenges', description: 'Challenges from SEC filings' },
	{
		name: 'Competitive Landscape',
		value: 'competitive_landscape',
		description: 'Competitive insights from SEC filings',
	},
	{
		name: 'Strategic Insights',
		value: 'strategic_insights',
		description: 'Strategic insights from SEC filings',
	},
	{
		name: 'Workforce Trends',
		value: 'workforce_trends',
		description: 'Department composition and trends',
	},
	{ name: 'LinkedIn Posts', value: 'linkedin_posts', description: 'Company LinkedIn activity' },
	{ name: 'Website Changes', value: 'website_changes', description: 'Website content changes' },
	{
		name: 'Website Keywords',
		value: 'website_keywords',
		description: 'Keyword search on websites',
	},
];

// Prospect enrichment options
export const prospectEnrichmentOptions = [
	{
		name: 'Contact Information',
		value: 'contacts',
		description: 'Email, phone, and contact details',
	},
	{ name: 'LinkedIn Posts', value: 'linkedin_posts', description: 'Individual LinkedIn activity' },
	{
		name: 'Professional Profile',
		value: 'profiles',
		description: 'Detailed professional information',
	},
];

// Business event types
export const businessEventTypes = [
	{ name: 'IPO Announcement', value: 'ipo_announcement' },
	{ name: 'New Funding Round', value: 'new_funding_round' },
	{ name: 'New Investment', value: 'new_investment' },
	{ name: 'Merger & Acquisitions', value: 'merger_and_acquisitions' },
	{ name: 'New Product Launch', value: 'new_product' },
	{ name: 'New Office Opening', value: 'new_office' },
	{ name: 'Office Closure', value: 'closing_office' },
	{ name: 'New Partnership', value: 'new_partnership' },
	{ name: 'Employee Joined Company', value: 'employee_joined_company' },
	{ name: 'Company Award', value: 'company_award' },
	{ name: 'Outages & Security Breaches', value: 'outages_and_security_breaches' },
	{ name: 'Cost Cutting', value: 'cost_cutting' },
	{ name: 'Lawsuits & Legal Issues', value: 'lawsuits_and_legal_issues' },
	{ name: 'Hiring in Engineering', value: 'hiring_in_engineering_department' },
	{ name: 'Hiring in Sales', value: 'hiring_in_sales_department' },
	{ name: 'Hiring in Marketing', value: 'hiring_in_marketing_department' },
	{ name: 'Engineering Team Growth', value: 'increase_in_engineering_department' },
	{ name: 'Sales Team Growth', value: 'increase_in_sales_department' },
	{ name: 'Marketing Team Growth', value: 'increase_in_marketing_department' },
	{ name: 'Overall Team Growth', value: 'increase_in_all_departments' },
	{ name: 'Engineering Team Reduction', value: 'decrease_in_engineering_department' },
	{ name: 'Sales Team Reduction', value: 'decrease_in_sales_department' },
	{ name: 'Overall Team Reduction', value: 'decrease_in_all_departments' },
	{ name: 'Operations Team Growth', value: 'increase_in_operations_department' },
];

// Prospect event types
export const prospectEventTypes = [
	{ name: 'Role Change', value: 'prospect_changed_role' },
	{ name: 'Company Change', value: 'prospect_changed_company' },
	{ name: 'New Position', value: 'prospect_job_start_anniversary' },
];

// Autocomplete field options
export const autocompleteFields = [
	{ name: 'Country', value: 'country' },
	{ name: 'Country Code', value: 'country_code' },
	{ name: 'Region Country Code', value: 'region_country_code' },
	{ name: 'Google Category', value: 'google_category' },
	{ name: 'NAICS Category', value: 'naics_category' },
	{ name: 'LinkedIn Category', value: 'linkedin_category' },
	{ name: 'Company Tech Stack Technology', value: 'company_tech_stack_tech' },
	{ name: 'Company Tech Stack Categories', value: 'company_tech_stack_categories' },
	{ name: 'Job Title', value: 'job_title' },
	{ name: 'Company Size', value: 'company_size' },
	{ name: 'Company Revenue', value: 'company_revenue' },
	{ name: 'Number of Locations', value: 'number_of_locations' },
	{ name: 'Company Age', value: 'company_age' },
	{ name: 'Job Department', value: 'job_department' },
	{ name: 'Job Level', value: 'job_level' },
	{ name: 'City Region Country', value: 'city_region_country' },
	{ name: 'Company Name', value: 'company_name' },
];

// Mapping enrichment types to endpoints
export const enrichmentEndpoints = {
	businesses: {
		firmographics: '/v1/businesses/firmographics/bulk_enrich',
		technographics: '/v1/businesses/technographics/bulk_enrich',
		company_ratings: '/v1/businesses/company_ratings_by_employees/bulk_enrich',
		financial_metrics: '/v1/businesses/financial_indicators/bulk_enrich',
		funding_and_acquisitions: '/v1/businesses/funding_and_acquisition/bulk_enrich',
		challenges: '/v1/businesses/pc_business_challenges_10k/bulk_enrich',
		competitive_landscape: '/v1/businesses/pc_competitive_landscape_10k/bulk_enrich',
		strategic_insights: '/v1/businesses/pc_strategy_10k/bulk_enrich',
		workforce_trends: '/v1/businesses/workforce_trends/bulk_enrich',
		linkedin_posts: '/v1/businesses/linkedin_posts/bulk_enrich',
		website_changes: '/v1/businesses/website_changes/bulk_enrich',
		website_keywords: '/v1/businesses/company_website_keywords/bulk_enrich',
	},
	prospects: {
		contacts: '/v1/prospects/contacts_information/bulk_enrich',
		linkedin_posts: '/v1/prospects/linkedin_posts/bulk_enrich',
		profiles: '/v1/prospects/profiles/bulk_enrich',
	},
};
