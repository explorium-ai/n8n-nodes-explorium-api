import { INodeProperties } from 'n8n-workflow';

export type StreamlinedOperation = {
	displayName: string;
	description: string;
	docsHref?: Array<{ href: string; title: string; displayCondition: string }>;
	jsonExamples?: Array<{
		description: string;
		default: string;
		displayOptions: { show?: Record<string, any>; hide?: Record<string, any> };
	}>;
	properties: INodeProperties[];
};

export interface BusinessesToMatch {
	businesses_to_match: Business[];
}

export interface ProspectsToMatch {
	prospects_to_match: Prospect[];
}

export interface Business {
	name: string;
	domain: string;
}

export interface Prospect {
	email: string;
	phone_number: string;
	full_name: string;
	company_name: string;
	linkedin: string;
	business_id: string;
}

export interface BusinessIds_Collection {
	business_ids: Array<{ id: string }>;
}

export interface ProspectIds_Collection {
	prospect_ids: Array<{ id: string }>;
}

export interface BusinessIds_Body {
	business_ids: string[];
}

export interface ProspectIds_Body {
	prospect_ids: string[];
}
