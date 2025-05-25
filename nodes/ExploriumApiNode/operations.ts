import { IHttpRequestMethods } from 'n8n-workflow';

export const operations = {
	'match-business': {
		endpoint: '/v1/businesses/match',
		docs: 'https://developers.explorium.ai/reference/match_businesses',
		description:
			'Match businesses by name and/or domain to get their Explorium IDs. At least one of name or domain is required',
		input: {
			body: {
				example: JSON.stringify(
					{
						businesses_to_match: [
							{
								name: 'Microsoft',
								domain: 'microsoft.com',
							},
						],
					},
					null,
					2,
				),
			},
		},
	},
	autocomplete: {
		endpoint: '/v1/businesses/autocomplete',
		method: 'GET',
		docs: 'https://developers.explorium.ai/reference/businesses_autocomplete',
		description: 'Get autocomplete suggestions for various fields',
		input: {
			search: {
				example: JSON.stringify(
					{
						field: 'google_category',
						query: 'software',
					},
					null,
					2,
				),
			},
		},
	},
	'fetch-businesses': {
		endpoint: '/v1/businesses',
		docs: 'https://developers.explorium.ai/reference/fetch_businesses',
		description: 'Search for businesses using various filter criteria',
		input: {
			body: {
				example: JSON.stringify(
					{
						mode: 'preview',
						filters: {
							country_code: { values: ['US'] },
							company_size: { values: ['1-10'] },
						},
						size: 1000,
						page_size: 5,
						page: 1,
					},
					null,
					2,
				),
			},
		},
	},
	'fetch-businesses-statistics': {
		endpoint: '/v1/businesses/stats',
		docs: 'https://developers.explorium.ai/reference/fetch_businesses_statistics',
		description: 'Get aggregated statistics about businesses',
		input: {
			body: {
				example: JSON.stringify(
					{
						filters: {
							country_code: { values: ['US'] },
							company_size: { values: ['1-10'] },
						},
					},
					null,
					2,
				),
			},
		},
	},
	'fetch-businesses-events': {
		endpoint: '/v1/businesses/events',
		docs: 'https://developers.explorium.ai/reference/fetch_businesses_events',
		description: 'Get business-related events',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
						event_types: ['ipo_announcement', 'new_funding_round'],
						timestamp_from: '2024-01-01',
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-firmographics': {
		endpoint: '/v1/businesses/firmographics/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/firmographics',
		description: 'Get firmographics data for businesses',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-technographics': {
		endpoint: '/v1/businesses/technographics/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/technographics',
		description: 'Get technology stack data for businesses',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-company-ratings': {
		endpoint: '/v1/businesses/company_ratings_by_employees/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/company_ratings',
		description: 'Get company ratings from employees',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-financial-metrics': {
		endpoint: '/v1/businesses/financial_indicators/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/financial_metrics_for_public_companies',
		description: 'Get financial metrics for public companies',
		input: {
			body: {
				example: JSON.stringify({ business_ids: ['a34bacf839b923770b2c360eefa26748'] }, null, 2),
			},
		},
	},
	'enrich-businesses-funding-and-acquisitions': {
		endpoint: '/v1/businesses/funding_and_acquisition/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/funding_and_acquisitions',
		description: 'Get funding and acquisition history for businesses',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-challenges': {
		endpoint: '/v1/businesses/pc_business_challenges_10k/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/business_challenges',
		description: 'Get business challenges from SEC filings',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-competitive-landscape': {
		endpoint: '/v1/businesses/pc_competitive_landscape_10k/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/competitive_landscape',
		description: 'Get competitive landscape data from SEC filings',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-strategic-insights': {
		endpoint: '/v1/businesses/pc_strategy_10k/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/strategic_insights',
		description: 'Get strategic insights from SEC filings',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-workforce-trends': {
		endpoint: '/v1/businesses/workforce_trends/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/workforce_trends',
		description: 'Get workforce trends and department composition',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-linkedin-posts': {
		endpoint: '/v1/businesses/linkedin_posts/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/company_social_media',
		description: 'Get LinkedIn posts from company pages',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-website-changes': {
		endpoint: '/v1/businesses/website_changes/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/company_website_content_changes',
		description: 'Get website content changes',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-businesses-website-keywords': {
		endpoint: '/v1/businesses/company_website_keywords/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/keyword_search_on_websites',
		description: 'Search for keywords on company websites',
		input: {
			body: {
				example: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
						parameters: {
							keywords: ['software', 'cloud'],
						},
					},
					null,
					2,
				),
			},
		},
	},
	'match-prospects': {
		endpoint: '/v1/prospects/match',
		docs: 'https://developers.explorium.ai/reference/match_prospects-1',
		description: 'Match prospects to get their Explorium IDs',
		input: {
			body: {
				example: JSON.stringify(
					{
						prospects_to_match: [
							{
								email: 'john@example.com',
								phone_number: '+1234567890',
								full_name: 'John Doe',
								company_name: 'Example Corp',
								linkedin: 'linkedin.com/in/johndoe',
								business_id: 'a34bacf839b923770b2c360eefa26748',
							},
						],
					},
					null,
					2,
				),
			},
		},
	},
	'fetch-prospects': {
		endpoint: '/v1/prospects',
		docs: 'https://developers.explorium.ai/reference/fetch_prospects',
		description: 'Search for prospects using various filter criteria',
		input: {
			body: {
				example: JSON.stringify(
					{
						mode: 'preview',
						filters: {
							has_email: { value: true },
							job_level: { values: ['cxo'] },
							business_id: { values: ['a34bacf839b923770b2c360eefa26748'] },
						},
						size: 1000,
						page_size: 5,
						page: 1,
					},
					null,
					2,
				),
			},
		},
	},
	'fetch-prospects-events': {
		endpoint: '/v1/prospects/events',
		docs: 'https://developers.explorium.ai/reference/fetch_prospects_events-1',
		description: 'Get prospect-related events',
		input: {
			body: {
				example: JSON.stringify(
					{
						event_types: ['prospect_changed_role', 'prospect_changed_company'],
						prospect_ids: [
							'20ae6cbf564ee683e66685e429844a5ff8ffc30f',
							'4c485f009d59e319dc039cdf3e935b85014e6a33',
							'fd4c46716295a2e4731417eee802a883280e4d57',
							'a7bbe0674c63338e62ae4c10751ae19da5723e5a',
						],
						timestamp_from: '2024-01-01',
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-prospects-contacts': {
		endpoint: '/v1/prospects/contacts_information/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/contacts_information',
		description: 'Get contact information for prospects',
		input: {
			body: {
				example: JSON.stringify(
					{
						prospect_ids: [
							'20ae6cbf564ee683e66685e429844a5ff8ffc30f',
							'4c485f009d59e319dc039cdf3e935b85014e6a33',
							'fd4c46716295a2e4731417eee802a883280e4d57',
							'a7bbe0674c63338e62ae4c10751ae19da5723e5a',
						],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-prospects-linkedin-posts': {
		endpoint: '/v1/prospects/linkedin_posts/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/individual_social_media_presence',
		description: 'Get LinkedIn posts from prospects',
		input: {
			body: {
				example: JSON.stringify(
					{
						prospect_ids: [
							'20ae6cbf564ee683e66685e429844a5ff8ffc30f',
							'4c485f009d59e319dc039cdf3e935b85014e6a33',
							'fd4c46716295a2e4731417eee802a883280e4d57',
							'a7bbe0674c63338e62ae4c10751ae19da5723e5a',
						],
					},
					null,
					2,
				),
			},
		},
	},
	'enrich-prospects-profiles': {
		endpoint: '/v1/prospects/profiles/bulk_enrich',
		docs: 'https://developers.explorium.ai/reference/professional_profile_contact_and_workplace',
		description: 'Get detailed profile information for prospects',
		input: {
			body: {
				example: JSON.stringify(
					{
						prospect_ids: [
							'20ae6cbf564ee683e66685e429844a5ff8ffc30f',
							'4c485f009d59e319dc039cdf3e935b85014e6a33',
							'fd4c46716295a2e4731417eee802a883280e4d57',
							'a7bbe0674c63338e62ae4c10751ae19da5723e5a',
						],
					},
					null,
					2,
				),
			},
		},
	},
} satisfies Record<string, OperationConfig>;

export type OperationKey = keyof typeof operations;

export type OperationConfig = {
	endpoint: string;
	method?: IHttpRequestMethods;
	description: string;
	docs: string;
	input: {
		body?: { example: string };
		search?: { example: string };
	};
};
