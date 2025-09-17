export interface BusinessToMatch {
	businesses: Business[];
}

export interface ProspectToMatch {
	prospects: Prospect[];
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
