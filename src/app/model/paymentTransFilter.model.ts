export class PaymentTransFilter {
    serviceId?: any[] = [];
    pmtMethodId?: any[] = [];
    channelId?: any[] = [];
    serviceTypeId?: any[] = [];
    processStatus?: any[] = [];
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());

    //advance
    accountNumber?: string;
    paymentRef: string;
    transId?: string;
    amount: string;
    notificationStatus?: string;
    batchId?: string;
    profileId?: string;
    extSysRefId: string;
    productId: string;
    billNumber?: string;
    serviceNumber?: string;
    reasonCode?: string
}