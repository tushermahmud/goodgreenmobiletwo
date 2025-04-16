export enum QuoteStatus {

    /** quote is being drafted */
    DRAFT = 'draft',

    /** quote is ready and the customer can view */
    READY = 'ready',

    /** quote is accepted by customer */
    ACCEPTED = 'accepted',

    /** quote was rejected because customer accepted another quote */
    REJECTED = 'rejected',

    /** quote is lost because customer signed a contract from another vendor */
    LOST = 'lost',

}
