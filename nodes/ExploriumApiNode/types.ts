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

export interface JsonExample {
	/** Description shown in tooltip/hover to inform users about the structure */
	description: string;
	/** Default JSON value for this example */
	default: string;
	/** Display conditions - when this example should be shown */
	displayOptions: { show?: Record<string, any>; hide?: Record<string, any> };
}
