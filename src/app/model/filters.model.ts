export class FiltersModel {
    organizationId: any[] = [];
    serviceId?: any[] = [];
    name?: any[] = [];
    processStatus?: any[] = [];
    billType?: any[] = [];
    serviceTypeId?: any[] = [];
    accountTransactionType?: any[] = [];
    pmtMethodId?: any[] = [];
    bankId?: any[] = [];
    channelId?: any[] = [];
    backendStatus?: any[] = [];
    profileId?: string;
    date: Date = new Date(new Date());
    fromDate: Date = new Date(new Date().setHours(0, 0, 0, 0));
    toDate: Date = new Date(new Date().setHours(23, 59, 59, 999));
    accountNumber?: string;
    billNumber?: string;
    batchId?: string;
    transId?: string;
    serviceNumber?: string;
    billAmount?: string;
    refundAmount?: string;
    paymentReference?: string;
    paymentRef: string;
    refundId: string;
    extSysRefId: string;
    iban: string;
    search: string;
    productId: string;
    transactionAmount: string;
    externalReferenceId: string;
    transactionId: string;

}