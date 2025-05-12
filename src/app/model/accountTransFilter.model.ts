export class AccountTransFilter {

    serviceId?: any[] = [];
    serviceTypeId?: any[] = [];
    accountTransType?: any[] = [];
    accountStatus?: any[] = [];
    profileId?: string;
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());
    batchId?: string;
    transId?: string;
    accountNumber?: string;
    billAmount?: string;
}