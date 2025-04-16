export interface ServiceItemDocument {
    type: 'quote' | 'contract';
    url: string;
    // contract
    isSigned: boolean;
     // contract-id
    id: number;
}
