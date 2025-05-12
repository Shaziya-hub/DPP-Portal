export class BillTransFilter {
    serviceId?: any[] = [];
    billStatus?: any[] = [];
    billType?: any[] = [];
    serviceTypeId?: any[] = [];
    profileId?: string;
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());

    //advance
    accountNumber?: string;
    billNumber?: string;
    batchId?: string;
    transId?: string;
    serviceNumber?: string;
    amount?: string;
    extSysRefId?: string;
    reasonCode?: string;
    billCategory?: string;
}