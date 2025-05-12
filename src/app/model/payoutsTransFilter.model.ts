export class PayoutsTransFilter {

    payoutStatus?: any[] = [];
    payerId?: any[] = [];

    payeeAccountNum?: string;
    extPrimaryId?: string;
    extRefKey?: string;

    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());

}