export class NonSadadTransFilter {
    serviceId?: any[] = [];
    processStatus?: any[] = [];
    serviceTypeId?: any[] = [];
    profileId?: string;
    transId?: string;
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());
    paymentRef: string;
    accountNumber?: string;
    serviceNumber?: string;
    billNumber?: string;
    batchId?: string;
    amount?: string
}