export type DefectState = {  
	readonly Id: string;
	readonly GarageId: string; 
	readonly Object: string;  
	readonly Location: string;  
	readonly ShortDesc: string;  
	readonly DetailedDesc: string;  
	readonly ReportingDate: string;  
	readonly Status: string;  
	readonly ImageNames: string[];  
	readonly LastModifiedAt: string;
};