export enum ServiceItemState {

    /** the service-item is yet to be picked up by a business-account for further action */
    NEW_REQUEST = 'new-request',

    /** the service-item has received quotes from 1 or multiple partners */
    QUOTES_RECEIVED = 'quotes-received',

    /**  the customer has accepted the quote */
    QUOTE_ACCEPTED = 'quote-accepted',

    /**
     * the customer has received the contract and is pending for signature.
     */
    CONTRACT_RECEIVED = 'contract-received',

    /**  a quote for the service-item is accepted and the customer is waiting for contract
     * or the partner is preparing the contract yet.
     */
    //WAITING_FOR_CONTRACT = 'waiting-for-contract',
    CONTRACT_SIGNED = 'contract-signed',

    /** the service-item needs payment from the customer to the partner
     * as the contract has been signed by the customer.
     */
    MAKE_PAYMENT = 'make-payment',

    /**
     * the payment has been completed by the customer
     */
    PAYMENT_COMPLETED = 'payment-completed',

    /** the service-item is ready for execution */
    SCHEDULED = 'scheduled',

    /** the service-item work is in progress */
    WORK_IN_PROGRESS = 'in-progress',

    /** the service-item work is completed */
    DONE = 'done',
}
