export class EInvoiceTransFilter {
    serviceId?: any[] = [];
    serviceTypeId?: any[] = [];
    invoiceType?: any[] = [];
    processStatus?: any[] = [];
    invoiceNo?: any = "";
    extSysRefId: string;
    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());

    //advance
    profileId?: string;
    sellerId: string;
    buyerId: string;
    invoiceIdentifier?: string;
    orderRefId?: string;
    sourceSystem?: string;

}