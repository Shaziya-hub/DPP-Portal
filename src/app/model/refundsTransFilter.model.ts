export class RefundsTransFilter {
    serviceId?: any[] = [];
    pmtMethodId?: any[] = [];
    processStatus?: any[] = [];
    // bankId?: any[] = [];
    channelId?: any[] = [];
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());
    transId?: string;
    refundId: string;
    extSysRefId: string;
    batchId?: string;
    paymentRef: string;
    iban: string;
    search: string;
    refundAmount?: string;
    amount?: string
}