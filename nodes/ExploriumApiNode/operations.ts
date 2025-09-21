import { INodeProperties } from 'n8n-workflow';
import {
	autocompleteFields,
	businessEnrichmentOptions,
	businessEventTypes,
	prospectEnrichmentOptions,
	prospectEventTypes,
} from './constants';
import { JsonExample } from './types';

export const operations = {
	match: {
		displayName: 'Match',
		description: 'Find and match businesses or prospects to get their Explorium IDs',
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
			{
				displayName: 'Businesses to Match',
				name: 'businesses_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add businesses to match by name and/or domain',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
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
								placeholder: 'e.g. Microsoft',
								description: 'Name of the company to match',
							},
							{
								displayName: 'Company Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'e.g. microsoft.com',
								description: 'Domain of the company to match',
							},
						],
					},
				],
			},
			{
				displayName: 'Prospects to Match',
				name: 'prospects_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospects to match by various identifiers',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
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
								placeholder: 'e.g. a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID if known',
							},
							{
								displayName: 'Company Name',
								name: 'company_name',
								type: 'string',
								default: '',
								placeholder: 'e.g. Example Corp',
								description: 'Company name (helps with matching)',
							},
							{
								displayName: 'Email Address',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'e.g. john@example.com',
								description: 'Email address of the prospect',
							},
							{
								displayName: 'Full Name',
								name: 'full_name',
								type: 'string',
								default: '',
								placeholder: 'e.g. John Doe',
								description: 'Full name of the prospect',
							},
							{
								displayName: 'LinkedIn Profile',
								name: 'linkedin',
								type: 'string',
								default: '',
								placeholder: 'e.g. linkedin.com/in/johndoe',
								description: 'LinkedIn profile URL',
							},
							{
								displayName: 'Phone Number',
								name: 'phone_number',
								type: 'string',
								default: '',
								placeholder: 'e.g.	+1234567890',
								description: 'Phone number of the prospect',
							},
						],
					},
				],
			},
		],
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
	},
	enrich: {
		displayName: 'Enrich',
		description: 'Add additional data to existing records',
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
			{
				displayName: 'Businesses to Match',
				name: 'businesses_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add businesses to match by name and/or domain',
				displayOptions: { show: { type: ['businesses'], match: [true], useJsonInput: [false] } },
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
								placeholder: 'e.g. Microsoft',
								description: 'Name of the company to match',
							},
							{
								displayName: 'Company Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'e.g. microsoft.com',
								description: 'Domain of the company to match',
							},
						],
					},
				],
			},
			{
				displayName: 'Prospects to Match',
				name: 'prospects_to_match',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add prospects to match by various identifiers',
				displayOptions: { show: { type: ['prospects'], match: [true], useJsonInput: [false] } },
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
								placeholder: 'e.g. a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID if known',
							},
							{
								displayName: 'Company Name',
								name: 'company_name',
								type: 'string',
								default: '',
								placeholder: 'e.g. Example Corp',
								description: 'Company name (helps with matching)',
							},
							{
								displayName: 'Email Address',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'e.g. john@example.com',
								description: 'Email address of the prospect',
							},
							{
								displayName: 'Full Name',
								name: 'full_name',
								type: 'string',
								default: '',
								placeholder: 'e.g. John Doe',
								description: 'Full name of the prospect',
							},
							{
								displayName: 'LinkedIn Profile',
								name: 'linkedin',
								type: 'string',
								default: '',
								placeholder: 'e.g. linkedin.com/in/johndoe',
								description: 'LinkedIn profile URL',
							},
							{
								displayName: 'Phone Number',
								name: 'phone_number',
								type: 'string',
								default: '',
								placeholder: 'e.g.	+1234567890',
								description: 'Phone number of the prospect',
							},
						],
					},
				],
			},
			{
				displayName: 'Business IDs',
				name: 'business_ids',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Add business IDs to enrich',
				displayOptions: { show: { type: ['businesses'], match: [false], useJsonInput: [false] } },
				options: [
					{
						displayName: 'ID',
						name: 'business_ids',
						values: [
							{
								displayName: 'Explorium Business ID',
								name: 'id',
								type: 'string',
								default: '',
								placeholder: 'e.g. a34bacf839b923770b2c360eefa26748',
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
				description: 'Add prospect IDs to enrich',
				displayOptions: { show: { type: ['prospects'], match: [false], useJsonInput: [false] } },
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
								placeholder: 'e.g. 20ae6cbf564ee683e66685e429844a5ff8ffc30f',
								description: 'Explorium prospect ID',
							},
						],
					},
				],
			},
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Keywords to search for (required for website keywords enrichment)',
				displayOptions: {
					show: { type: ['businesses'], enrichment: ['website_keywords'], useJsonInput: [false] },
				},
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
								placeholder: 'e.g. software',
								description: 'Keyword to search for on websites',
							},
						],
					},
				],
			},
		],
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
	},
	fetch: {
		displayName: 'Fetch',
		description: 'Retrieve records with filters and pagination',
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
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{ name: 'Full', value: 'full', description: 'Returns complete data for each record' },
					{
						name: 'Preview',
						value: 'preview',
						description: 'Returns lightweight data with key fields only',
					},
				],
				default: 'preview',
				description: 'Level of detail in returned data',
				displayOptions: { show: { useJsonInput: [false] } },
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'number',
				default: 50,
				description: 'Total maximum number of records to return across all pages (max 10,000)',
				typeOptions: { minValue: 1, maxValue: 10000 },
				displayOptions: { show: { useJsonInput: [false] } },
			},
			{
				displayName: 'Page Size',
				name: 'page_size',
				type: 'number',
				default: 50,
				description: 'Number of records per page (max 100)',
				typeOptions: { minValue: 1, maxValue: 100 },
				displayOptions: { show: { useJsonInput: [false] } },
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number to retrieve (1-based index)',
				typeOptions: { minValue: 1 },
				displayOptions: { show: { useJsonInput: [false] } },
			},
			{
				displayName: 'Country Codes',
				name: 'country_code',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by HQ country using alpha-2 codes (e.g. "us", "ca")',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'country_code',
						displayName: 'Country Codes',
						values: [
							{
								displayName: 'Country Code',
								name: 'code',
								type: 'string',
								default: '',
								placeholder: 'e.g. us',
								description: 'Two-letter country code',
							},
						],
					},
				],
			},
			{
				displayName: 'Region Country Codes',
				name: 'region_country_code',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by region using ISO 3166-2 codes (e.g. "us-ca", "us-tx")',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'region_country_code',
						displayName: 'Region Codes',
						values: [
							{
								displayName: 'Region Code',
								name: 'code',
								type: 'string',
								default: '',
								placeholder: 'e.g. us-ca',
								description: 'Country-region code format',
							},
						],
					},
				],
			},
			{
				displayName: 'Cities',
				name: 'city_region_country',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by city-level locations (e.g. "San Francisco, CA, US")',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'city_region_country',
						displayName: 'Cities',
						values: [
							{
								displayName: 'Location',
								name: 'location',
								type: 'string',
								default: '',
								placeholder: 'e.g. San Francisco, CA, US',
								description: 'Full location string',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Sizes',
				name: 'company_size',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by employee count ranges',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_size',
						displayName: 'Company Sizes',
						values: [
							{
								displayName: 'Size Range',
								name: 'size',
								type: 'options',
								options: [
									{ name: '1-10', value: '1-10' },
									{ name: '10001+', value: '10001+' },
									{ name: '1001-5000', value: '1001-5000' },
									{ name: '11-50', value: '11-50' },
									{ name: '201-500', value: '201-500' },
									{ name: '5001-10000', value: '5001-10000' },
									{ name: '501-1000', value: '501-1000' },
									{ name: '51-200', value: '51-200' },
								],
								default: '1-10',
								description: 'Employee count range',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Revenue',
				name: 'company_revenue',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by annual revenue ranges',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_revenue',
						displayName: 'Revenue Ranges',
						values: [
							{
								displayName: 'Revenue Range',
								name: 'range',
								type: 'options',
								// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
								options: [
									{ name: '0-500K', value: '0-500K' },
									{ name: '500K-1M', value: '500K-1M' },
									{ name: '1M-5M', value: '1M-5M' },
									{ name: '5M-10M', value: '5M-10M' },
									{ name: '10M-25M', value: '10M-25M' },
									{ name: '25M-75M', value: '25M-75M' },
									{ name: '75M-200M', value: '75M-200M' },
									{ name: '200M-500M', value: '200M-500M' },
									{ name: '500M-1B', value: '500M-1B' },
									{ name: '1B-10B', value: '1B-10B' },
									{ name: '10B-100B', value: '10B-100B' },
									{ name: '100B-1T', value: '100B-1T' },
									{ name: '1T-10T', value: '1T-10T' },
									{ name: '10T+', value: '10T+' },
								],
								default: '0-500K',
								description: 'Annual revenue range',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Age',
				name: 'company_age',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by years since establishment',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_age',
						displayName: 'Age Ranges',
						values: [
							{
								displayName: 'Age Range',
								name: 'range',
								type: 'options',
								options: [
									{ name: '0-3 Years', value: '0-3' },
									{ name: '10-15 Years', value: '10-15' },
									{ name: '15-20 Years', value: '15-20' },
									{ name: '20+ Years', value: '20+' },
									{ name: '3-6 Years', value: '3-6' },
									{ name: '6-10 Years', value: '6-10' },
								],
								default: '0-3',
								description: 'Company age range',
							},
						],
					},
				],
			},
			{
				displayName: 'Google Categories',
				name: 'google_category',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by Google business categories',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'google_category',
						displayName: 'Google Categories',
						values: [
							{
								displayName: 'Category',
								name: 'category',
								type: 'string',
								default: '',
								placeholder: 'e.g. Software Development',
								description: 'Google business category',
							},
						],
					},
				],
			},
			{
				displayName: 'NAICS Categories',
				name: 'naics_category',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by NAICS industry codes',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'naics_category',
						displayName: 'NAICS Categories',
						values: [
							{
								displayName: 'NAICS Code',
								name: 'code',
								type: 'string',
								default: '',
								placeholder: 'e.g. 23',
								description: '2017 NAICS industry code',
							},
						],
					},
				],
			},
			{
				displayName: 'LinkedIn Categories',
				name: 'linkedin_category',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by LinkedIn business categories',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'linkedin_category',
						displayName: 'LinkedIn Categories',
						values: [
							{
								displayName: 'Category',
								name: 'category',
								type: 'string',
								default: '',
								placeholder: 'e.g. software development',
								description: 'LinkedIn business category',
							},
						],
					},
				],
			},
			{
				displayName: 'Tech Stack Categories',
				name: 'company_tech_stack_category',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by technology categories used by companies',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_tech_stack_category',
						displayName: 'Tech Categories',
						values: [
							{
								displayName: 'Technology Category',
								name: 'category',
								type: 'string',
								default: '',
								placeholder: 'e.g. Marketing, CRM, Cloud Services',
							},
						],
					},
				],
			},
			{
				displayName: 'Technologies',
				name: 'company_tech_stack_tech',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by specific technologies used by companies',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_tech_stack_tech',
						displayName: 'Technologies',
						values: [
							{
								displayName: 'Technology',
								name: 'tech',
								type: 'string',
								default: '',
								placeholder: 'e.g. JavaScript, HTML5, Apache',
								description: 'Specific technology',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Names',
				name: 'company_name',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by specific company names',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_name',
						displayName: 'Company Names',
						values: [
							{
								displayName: 'Company Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'e.g. Google, Walmart',
							},
						],
					},
				],
			},
			{
				displayName: 'Number of Locations',
				name: 'number_of_locations',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by number of office locations',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'number_of_locations',
						displayName: 'Location Counts',
						values: [
							{
								displayName: 'Location Range',
								name: 'range',
								type: 'options',
								options: [
									{ name: '1', value: '1' },
									{ name: '2-5', value: '2-5' },
									{ name: '6+', value: '6+' },
								],
								default: '1',
								description: 'Number of office locations',
							},
						],
					},
				],
			},
			{
				displayName: 'Website Keywords',
				name: 'website_keywords',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by keywords mentioned on company websites',
				displayOptions: { show: { type: ['businesses'], useJsonInput: [false] } },
				options: [
					{
						name: 'website_keywords',
						displayName: 'Keywords',
						values: [
							{
								displayName: 'Keyword',
								name: 'keyword',
								type: 'string',
								default: '',
								placeholder: 'e.g. sustainability',
								description: 'Keyword to search for on websites',
							},
						],
					},
				],
			},
			// Prospect-specific filters
			{
				displayName: 'Business IDs',
				name: 'business_id',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter prospects by specific business IDs',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'business_id',
						displayName: 'Business IDs',
						values: [
							{
								displayName: 'Business ID',
								name: 'id',
								type: 'string',
								default: '',
								placeholder: 'e.g. a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID',
							},
						],
					},
				],
			},
			{
				displayName: 'Job Levels',
				name: 'job_level',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by job seniority levels',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'job_level',
						displayName: 'Job Levels',
						values: [
							{
								displayName: 'Job Level',
								name: 'level',
								type: 'options',
								options: [
									{ name: 'CXO', value: 'cxo' },
									{ name: 'Director', value: 'director' },
									{ name: 'Entry Level', value: 'entry' },
									{ name: 'Manager', value: 'manager' },
									{ name: 'Senior', value: 'senior' },
								],
								default: 'manager',
								description: 'Job seniority level',
							},
						],
					},
				],
			},
			{
				displayName: 'Job Departments',
				name: 'job_department',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by job departments',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'job_department',
						displayName: 'Job Departments',
						values: [
							{
								displayName: 'Department',
								name: 'department',
								type: 'options',
								options: [
									{ name: 'Business Development', value: 'business development' },
									{ name: 'Engineering', value: 'engineering' },
									{ name: 'Finance', value: 'finance' },
									{ name: 'Human Resources', value: 'human resources' },
									{ name: 'Legal', value: 'legal' },
									{ name: 'Marketing', value: 'marketing' },
									{ name: 'Operations', value: 'operations' },
									{ name: 'Sales', value: 'sales' },
								],
								default: 'sales',
								description: 'Job department',
							},
						],
					},
				],
			},
			{
				displayName: 'Has Email',
				name: 'has_email',
				type: 'boolean',
				default: true,
				description: 'Whether to filter prospects who have email addresses',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
			},
			{
				displayName: 'Has Phone',
				name: 'has_phone_number',
				type: 'boolean',
				default: false,
				description: 'Whether to filter prospects who have phone numbers',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
			},
			{
				displayName: 'Country Codes (Prospect)',
				name: 'country_code_prospect',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by prospect location country using alpha-2 codes (e.g. "us", "ca")',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'country_code_prospect',
						displayName: 'Country Codes',
						values: [
							{
								displayName: 'Country Code',
								name: 'code',
								type: 'string',
								default: '',
								placeholder: 'e.g. us',
								description: 'Two-letter country code for prospect location',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Country Codes',
				name: 'company_country_code',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by company HQ country using alpha-2 codes (e.g. "us", "ca")',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_country_code',
						displayName: 'Company Country Codes',
						values: [
							{
								displayName: 'Country Code',
								name: 'code',
								type: 'string',
								default: '',
								placeholder: 'e.g. us',
								description: 'Two-letter country code for company HQ',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Sizes (Prospects)',
				name: 'company_size_prospects',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by company employee count ranges',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_size_prospects',
						displayName: 'Company Sizes',
						values: [
							{
								displayName: 'Size Range',
								name: 'size',
								type: 'options',
								options: [
									{ name: '1-10', value: '1-10' },
									{ name: '10001+', value: '10001+' },
									{ name: '1001-5000', value: '1001-5000' },
									{ name: '11-50', value: '11-50' },
									{ name: '201-500', value: '201-500' },
									{ name: '5001-10000', value: '5001-10000' },
									{ name: '501-1000', value: '501-1000' },
									{ name: '51-200', value: '51-200' },
								],
								default: '11-50',
								description: 'Company employee count range',
							},
						],
					},
				],
			},
			{
				displayName: 'Company Revenue (Prospects)',
				name: 'company_revenue_prospects',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Filter by company annual revenue ranges',
				displayOptions: { show: { type: ['prospects'], useJsonInput: [false] } },
				options: [
					{
						name: 'company_revenue_prospects',
						displayName: 'Revenue Ranges',
						values: [
							{
								displayName: 'Revenue Range',
								name: 'range',
								type: 'options',
								// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
								options: [
									{ name: '0-500K', value: '0-500K' },
									{ name: '500K-1M', value: '500K-1M' },
									{ name: '1M-5M', value: '1M-5M' },
									{ name: '5M-10M', value: '5M-10M' },
									{ name: '10M-25M', value: '10M-25M' },
									{ name: '25M-75M', value: '25M-75M' },
									{ name: '75M-200M', value: '75M-200M' },
									{ name: '200M-500M', value: '200M-500M' },
									{ name: '500M-1B', value: '500M-1B' },
									{ name: '1B-10B', value: '1B-10B' },
									{ name: '10B-100B', value: '10B-100B' },
									{ name: '100B-1T', value: '100B-1T' },
									{ name: '1T-10T', value: '1T-10T' },
									{ name: '10T+', value: '10T+' },
								],
								default: '1M-5M',
								description: 'Company annual revenue range',
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Filters (JSON)',
				name: 'additional_filters',
				type: 'json',
				default: '{}',
				description: 'Additional filter criteria as JSON (for complex or unlisted filters)',
				typeOptions: { rows: 4 },
				displayOptions: { show: { useJsonInput: [false] } },
			},
		],
		examples: [
			{
				description: 'Fetch businesses or prospects with filters and pagination',
				default: JSON.stringify(
					{
						mode: 'preview',
						size: 50,
						page_size: 50,
						page: 1,
						filters: {
							country_code: { values: ['us'] },
							company_size: { values: ['11-50', '51-200'] },
						},
					},
					null,
					2,
				),
				displayOptions: {
					show: {},
				},
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
								placeholder: 'e.g. Microsoft',
								description: 'Name of the company',
							},
							{
								displayName: 'Company Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'e.g. microsoft.com',
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
								placeholder: 'e.g. a34bacf839b923770b2c360eefa26748',
								description: 'Explorium business ID if known',
							},
							{
								displayName: 'Company Name',
								name: 'company_name',
								type: 'string',
								default: '',
								placeholder: 'e.g. Example Corp',
								description: 'Company name (helps with matching)',
							},
							{
								displayName: 'Email Address',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'e.g. john@example.com',
								description: 'Email address of the prospect',
							},
							{
								displayName: 'Full Name',
								name: 'full_name',
								type: 'string',
								default: '',
								placeholder: 'e.g. John Doe',
								description: 'Full name of the prospect',
							},
							{
								displayName: 'LinkedIn Profile',
								name: 'linkedin',
								type: 'string',
								default: '',
								placeholder: 'e.g. linkedin.com/in/johndoe',
								description: 'LinkedIn profile URL',
							},
							{
								displayName: 'Phone Number',
								name: 'phone_number',
								type: 'string',
								default: '',
								placeholder: 'e.g.	+1234567890',
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
								placeholder: 'e.g. a34bacf839b923770b2c360eefa26748',
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
								placeholder: 'e.g. 20ae6cbf564ee683e66685e429844a5ff8ffc30f',
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
				placeholder: 'e.g. software',
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
