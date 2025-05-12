export class ManualRefundsFilters {
    serviceId?: any[] = [];
    pmtMethodId?: any[] = [];
    channelId?: any[] = [];
    serviceTypeId?: any[] = [];
    processStatus?: any[] = [];
    postingStatus?: any[] = [];
    billNumber: any = "";
    transId: any = "";
    paymentRef: any = "";
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());

}