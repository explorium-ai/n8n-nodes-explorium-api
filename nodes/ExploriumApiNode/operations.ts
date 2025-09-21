import { INodeProperties } from 'n8n-workflow';

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
	{ name: 'Acquisition', value: 'acquisition' },
	{ name: 'Executive Changes', value: 'executive_changes' },
];

// Prospect event types
export const prospectEventTypes = [
	{ name: 'Role Change', value: 'prospect_changed_role' },
	{ name: 'Company Change', value: 'prospect_changed_company' },
	{ name: 'New Position', value: 'new_position' },
];

// Autocomplete field options
export const autocompleteFields = [
	{ name: 'Google Category', value: 'google_category' },
	{ name: 'Industry', value: 'industry' },
	{ name: 'Technology', value: 'technology' },
	{ name: 'Location', value: 'location' },
	{ name: 'Company Size', value: 'company_size' },
];

// New flexible example structure
export interface JsonExample {
	/** Description shown in tooltip/hover to inform users about the structure */
	description: string;
	/** Default JSON value for this example */
	default: string;
	/** Display conditions - when this example should be shown */
	displayOptions: { show?: Record<string, any>; hide?: Record<string, any> };
}

export const operations = {
	match: {
		displayName: 'Match',
		description: 'Find and match businesses or prospects to get their Explorium IDs',
		examples: [
			{
				description: 'Match businesses by name and domain to get their Explorium business IDs',
				default: JSON.stringify(
					{
						businesses_to_match: [
							{
								name: 'Microsoft',
								domain: 'microsoft.com',
							},
							{
								name: 'Apple Inc.',
								domain: 'apple.com',
							},
							{
								name: 'Google',
								domain: 'google.com',
							},
						],
					},
					null,
					2,
				),
				displayOptions: {
					show: {
						type: ['businesses'],
					},
				},
			},
			{
				description:
					'Match prospects by email, name, or other identifiers to get their Explorium prospect IDs',
				default: JSON.stringify(
					{
						prospects_to_match: [
							{
								email: 'omer.prizner@explorium.ai',
								full_name: 'Omer Prizner',
								phone_number: '',
								company_name: '',
								linkedin: '',
							},
						],
					},
					null,
					2,
				),
				displayOptions: {
					show: {
						type: ['prospects'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Business',
						value: 'businesses',
						description: 'Match companies by name and/or domain',
					},
					{
						name: 'Prospect',
						value: 'prospects',
						description: 'Match people by email, name, or other identifiers',
					},
				],
				default: 'businesses',
				required: true,
				description: 'Type of entity to match',
			},
			// Business fields - now as fixedCollection for better UX
			{
				displayName: 'Businesses to Match',
				name: 'businesses_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add businesses to match by name and/or domain',
				displayOptions: { show: { type: ['businesses'] } },
				options: [
					{
						name: 'businesses_to_match',
						displayName: 'Businesses',
						values: [
							{
								displayName: 'Company Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'e.g., Microsoft',
								description: 'Name of the company to match',
							},
							{
								displayName: 'Company Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'e.g., microsoft.com',
								description: 'Domain of the company to match',
							},
						],
					},
				],
			},
			// Prospect fields - now as fixedCollection for better UX
			{
				displayName: 'Prospects to Match',
				name: 'prospects_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospects to match by various identifiers',
				displayOptions: { show: { type: ['prospects'] } },
				options: [
					{
						name: 'prospects_to_match',
						displayName: 'Prospects',
						values: [
							{
								displayName: 'Business ID',
								name: 'business_id',
								type: 'string',
								default: '',
								placeholder: 'e.g., a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID if known',
							},
							{
								displayName: 'Company Name',
								name: 'company_name',
								type: 'string',
								default: '',
								placeholder: 'e.g., Example Corp',
								description: 'Company name (helps with matching)',
							},
							{
								displayName: 'Email Address',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'e.g., john@example.com',
								description: 'Email address of the prospect',
							},
							{
								displayName: 'Full Name',
								name: 'full_name',
								type: 'string',
								default: '',
								placeholder: 'e.g., John Doe',
								description: 'Full name of the prospect',
							},
							{
								displayName: 'LinkedIn Profile',
								name: 'linkedin',
								type: 'string',
								default: '',
								placeholder: 'e.g., linkedin.com/in/johndoe',
								description: 'LinkedIn profile URL',
							},
							{
								displayName: 'Phone Number',
								name: 'phone_number',
								type: 'string',
								default: '',
								placeholder: 'e.g.,	+1234567890',
								description: 'Phone number of the prospect',
							},
						],
					},
				],
			},
		],
	},
	enrich: {
		displayName: 'Enrich',
		description: 'Add additional data to existing records',
		examples: [
			{
				description: 'Enrich businesses using business Explorium IDs',
				default: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
					},
					null,
					2,
				),
				displayOptions: {
					show: { type: ['businesses'], match: [false] },
					hide: { enrichment: ['website_keywords'] },
				},
			},
			{
				description: 'Enrich businesses using business IDs (filter by website keywords)',
				default: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
						parameters: {
							keywords: ['software', 'cloud'],
						},
					},
					null,
					2,
				),
				displayOptions: {
					show: {
						type: ['businesses'],
						match: [false],
						enrichment: ['website_keywords'],
					},
				},
			},
			{
				description: 'Enrich prospects using prospect Explorium IDs',
				default: JSON.stringify(
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
				displayOptions: { show: { type: ['prospects'], match: [false] } },
			},
			{
				description: 'Enrich businesses using business info',
				default: JSON.stringify(
					{
						businesses_to_match: [
							{ name: 'Microsoft', domain: 'microsoft.com' },
							{ name: 'Apple Inc.', domain: 'apple.com' },
							{ name: 'Google', domain: 'google.com' },
						],
					},
					null,
					2,
				),
				displayOptions: {
					show: { type: ['businesses'], match: [true] },
					hide: { enrichment: ['website_keywords'] },
				},
			},
			{
				description: 'Enrich businesses using business info (filter by website keywords)',
				default: JSON.stringify(
					{
						businesses_to_match: [
							{ name: 'Microsoft', domain: 'microsoft.com' },
							{ name: 'Apple Inc.', domain: 'apple.com' },
							{ name: 'Google', domain: 'google.com' },
						],
						parameters: {
							keywords: ['software', 'cloud'],
						},
					},
					null,
					2,
				),
				displayOptions: {
					show: {
						type: ['businesses'],
						match: [true],
						enrichment: ['website_keywords'],
					},
				},
			},
			{
				description: 'Enrich prospects using prospect Explorium IDs',
				default: JSON.stringify(
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
				displayOptions: { show: { type: ['prospects'], match: [false] } },
			},
		],
		properties: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Business', value: 'businesses', description: 'Enrich company data' },
					{ name: 'Prospect', value: 'prospects', description: 'Enrich person data' },
				],
				default: 'businesses',
				required: true,
				description: 'Type of entity to enrich',
			},
			{
				displayName: 'Enrichment',
				name: 'enrichment',
				type: 'multiOptions',
				options: businessEnrichmentOptions,
				default: ['firmographics'],
				required: true,
				description: 'Types of business data to enrich',
				displayOptions: { show: { type: ['businesses'] } },
			},
			{
				displayName: 'Enrichment',
				name: 'enrichment',
				type: 'multiOptions',
				options: prospectEnrichmentOptions,
				default: ['contacts'],
				required: true,
				description: 'Types of prospect data to enrich',
				displayOptions: { show: { type: ['prospects'] } },
			},
			{
				displayName: 'Match First',
				name: 'match',
				type: 'boolean',
				default: false,
				description:
					'Whether to find businesses/prospects before enriching, or use existing Explorium IDs',
			},
			// Match fields for business - using fixedCollection
			{
				displayName: 'Businesses to Match',
				name: 'businesses_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add businesses to match by name and/or domain',
				displayOptions: { show: { type: ['businesses'], match: [true] } },
				options: [
					{
						name: 'businesses_to_match',
						displayName: 'Businesses',
						values: [
							{
								displayName: 'Company Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'e.g., Microsoft',
								description: 'Name of the company to match',
							},
							{
								displayName: 'Company Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'e.g., microsoft.com',
								description: 'Domain of the company to match',
							},
						],
					},
				],
			},
			// Match fields for prospect - using fixedCollection
			{
				displayName: 'Prospects to Match',
				name: 'prospects_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospects to match by various identifiers',
				displayOptions: { show: { type: ['prospects'], match: [true] } },
				options: [
					{
						name: 'prospects_to_match',
						displayName: 'Prospects',
						values: [
							{
								displayName: 'Business ID',
								name: 'business_id',
								type: 'string',
								default: '',
								placeholder: 'e.g., a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID if known',
							},
							{
								displayName: 'Company Name',
								name: 'company_name',
								type: 'string',
								default: '',
								placeholder: 'e.g., Example Corp',
								description: 'Company name (helps with matching)',
							},
							{
								displayName: 'Email Address',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'e.g., john@example.com',
								description: 'Email address of the prospect',
							},
							{
								displayName: 'Full Name',
								name: 'full_name',
								type: 'string',
								default: '',
								placeholder: 'e.g., John Doe',
								description: 'Full name of the prospect',
							},
							{
								displayName: 'LinkedIn Profile',
								name: 'linkedin',
								type: 'string',
								default: '',
								placeholder: 'e.g., linkedin.com/in/johndoe',
								description: 'LinkedIn profile URL',
							},
							{
								displayName: 'Phone Number',
								name: 'phone_number',
								type: 'string',
								default: '',
								placeholder: 'e.g.,	+1234567890',
								description: 'Phone number of the prospect',
							},
						],
					},
				],
			},
			// ID fields when not matching - using fixedCollection
			{
				displayName: 'Business IDs',
				name: 'business_ids',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add business IDs to enrich',
				displayOptions: { show: { type: ['businesses'], match: [false] } },
				options: [
					{
						displayName: 'Explorium Business ID',
						name: 'business_ids',
						type: 'string',
						default: '',
						placeholder: 'e.g., a34bacf839b923770b2c360eefa26748',
					},
				],
			},
			{
				displayName: 'Prospect IDs',
				name: 'prospect_ids_collection',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospect IDs to enrich',
				displayOptions: { show: { type: ['prospects'], match: [false] } },
				options: [
					{
						name: 'prospect_ids',
						displayName: 'Prospect IDs',
						values: [
							{
								displayName: 'Prospect ID',
								name: 'id',
								type: 'string',
								default: '',
								placeholder: 'e.g., 20ae6cbf564ee683e66685e429844a5ff8ffc30f',
								description: 'Explorium prospect ID',
							},
						],
					},
				],
			},
			// Website keywords parameter
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Keywords to search for (required for website keywords enrichment)',
				displayOptions: { show: { type: ['businesses'], enrichment: ['website_keywords'] } },
				options: [
					{
						name: 'keywords',
						displayName: 'Keywords',
						values: [
							{
								displayName: 'Keyword',
								name: 'keyword',
								type: 'string',
								default: '',
								placeholder: 'e.g., software',
								description: 'Keyword to search for on websites',
							},
						],
					},
				],
			},
		],
	},
	fetch: {
		displayName: 'Fetch',
		description: 'Retrieve records with filters and pagination',
		examples: [
			{
				description: 'Fetch businesses with filters for country and company size in preview mode',
				default: JSON.stringify(
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
				displayOptions: {
					show: {
						type: ['businesses'],
					},
				},
			},
			{
				description:
					'Fetch prospects with filters for email presence and job level in preview mode',
				default: JSON.stringify(
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
				displayOptions: {
					show: {
						type: ['prospects'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Businesses', value: 'businesses', description: 'Search for companies' },
					{ name: 'Prospects', value: 'prospects', description: 'Search for people' },
				],
				default: 'businesses',
				required: true,
				description: 'Type of entities to fetch',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'json',
				default:
					'{\n  "country_code": { "values": ["US"] },\n  "company_size": { "values": ["1-10"] }\n}',
				description: 'Filter criteria for the search',
				typeOptions: { rows: 6 },
			},
			{
				displayName: 'Page Size',
				name: 'page_size',
				type: 'number',
				default: 10,
				description: 'Number of results per page (1-1000)',
				typeOptions: { minValue: 1, maxValue: 1000 },
			},
			{
				displayName: 'Next Cursor',
				name: 'next_cursor',
				type: 'string',
				default: '',
				placeholder: 'Leave empty for first page',
				description: 'Cursor for pagination (from previous response)',
			},
		],
	},
	events: {
		displayName: 'Events',
		description: 'Get business or prospect events',
		examples: [
			{
				description:
					'Get business events like IPO announcements and funding rounds using business IDs',
				default: JSON.stringify(
					{
						business_ids: ['a34bacf839b923770b2c360eefa26748', '8adce3ca1cef0c986b22310e369a0793'],
						event_types: ['ipo_announcement', 'new_funding_round'],
						timestamp_from: '2024-01-01',
					},
					null,
					2,
				),
				displayOptions: {
					show: {
						type: ['businesses'],
					},
				},
			},
			{
				description: 'Get prospect events like role changes and company changes using prospect IDs',
				default: JSON.stringify(
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
				displayOptions: {
					show: {
						type: ['prospects'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Business Events', value: 'businesses', description: 'Company-related events' },
					{ name: 'Prospect Events', value: 'prospects', description: 'Person-related events' },
				],
				default: 'businesses',
				required: true,
				description: 'Type of events to fetch',
			},
			{
				displayName: 'Match First',
				name: 'match',
				type: 'boolean',
				default: false,
				description:
					'Whether to find businesses/prospects before enriching, or use existing Explorium IDs',
			},
			// Match fields for business events - using fixedCollection
			{
				displayName: 'Businesses to Match',
				name: 'businesses_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add businesses to match by name and/or domain',
				displayOptions: { show: { type: ['businesses'], match: [true] } },
				options: [
					{
						name: 'business',
						displayName: 'Business',
						values: [
							{
								displayName: 'Company Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'e.g., Microsoft',
								description: 'Name of the company',
							},
							{
								displayName: 'Company Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'e.g., microsoft.com',
								description: 'Domain of the company',
							},
						],
					},
				],
			},
			// Match fields for prospect events - using fixedCollection
			{
				displayName: 'Prospects to Match',
				name: 'prospects_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospects to match by various identifiers',
				displayOptions: { show: { type: ['prospects'], match: [true] } },
				options: [
					{
						name: 'prospect',
						displayName: 'Prospect',
						values: [
							{
								displayName: 'Business ID',
								name: 'business_id',
								type: 'string',
								default: '',
								placeholder: 'e.g., a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID if known',
							},
							{
								displayName: 'Company Name',
								name: 'company_name',
								type: 'string',
								default: '',
								placeholder: 'e.g., Example Corp',
								description: 'Company name (helps with matching)',
							},
							{
								displayName: 'Email Address',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'e.g., john@example.com',
								description: 'Email address of the prospect',
							},
							{
								displayName: 'Full Name',
								name: 'full_name',
								type: 'string',
								default: '',
								placeholder: 'e.g., John Doe',
								description: 'Full name of the prospect',
							},
							{
								displayName: 'LinkedIn Profile',
								name: 'linkedin',
								type: 'string',
								default: '',
								placeholder: 'e.g., linkedin.com/in/johndoe',
								description: 'LinkedIn profile URL',
							},
							{
								displayName: 'Phone Number',
								name: 'phone_number',
								type: 'string',
								default: '',
								placeholder: 'e.g.,	+1234567890',
								description: 'Phone number of the prospect',
							},
						],
					},
				],
			},
			// ID fields when not matching - using fixedCollection
			{
				displayName: 'Business IDs',
				name: 'business_ids',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add business IDs for events',
				displayOptions: { show: { type: ['businesses'], match: [false] } },
				options: [
					{
						name: 'business_ids',
						displayName: 'Business IDs',
						values: [
							{
								displayName: 'Business ID',
								name: 'id',
								type: 'string',
								default: '',
								placeholder: 'e.g., a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID',
							},
						],
					},
				],
			},
			{
				displayName: 'Prospect IDs',
				name: 'prospect_ids_collection',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospect IDs for events',
				displayOptions: { show: { type: ['prospects'], match: [false] } },
				options: [
					{
						name: 'prospect_ids',
						displayName: 'Prospect IDs',
						values: [
							{
								displayName: 'Prospect ID',
								name: 'id',
								type: 'string',
								default: '',
								placeholder: 'e.g., 20ae6cbf564ee683e66685e429844a5ff8ffc30f',
								description: 'Explorium prospect ID',
							},
						],
					},
				],
			},
			// Event types
			{
				displayName: 'Event Types',
				name: 'event_types',
				type: 'multiOptions',
				options: businessEventTypes,
				default: ['ipo_announcement'],
				description: 'Types of business events to fetch',
				displayOptions: { show: { type: ['businesses'] } },
			},
			{
				displayName: 'Event Types',
				name: 'event_types',
				type: 'multiOptions',
				options: prospectEventTypes,
				default: ['prospect_changed_role'],
				description: 'Types of prospect events to fetch',
				displayOptions: { show: { type: ['prospects'] } },
			},
			{
				displayName: 'From Date',
				name: 'timestamp_from',
				type: 'dateTime',
				default: '',
				description: 'Start date for events (ISO format)',
			},
			{
				displayName: 'To Date',
				name: 'timestamp_to',
				type: 'dateTime',
				default: '',
				description: 'End date for events (ISO format)',
			},
		],
	},
	autocomplete: {
		displayName: 'Autocomplete',
		description: 'Get field suggestions and autocomplete values',
		examples: [
			{
				description: 'Get autocomplete suggestions for a specific field using a search query',
				default: JSON.stringify(
					{
						field: 'google_category',
						query: 'software',
					},
					null,
					2,
				),
				displayOptions: {
					show: {
						field: ['google_category'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Field',
				name: 'field',
				type: 'options',
				options: autocompleteFields,
				default: 'google_category',
				required: true,
				description: 'Field to get autocomplete suggestions for',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'e.g., software',
				required: true,
				description: 'Search term for autocomplete',
			},
		],
	},
} satisfies Record<string, StreamlinedOperation>;

export type OperationKey = keyof typeof operations;

export type StreamlinedOperation = {
	displayName: string;
	description: string;
	examples?: JsonExample[];
	properties: INodeProperties[];
};

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
