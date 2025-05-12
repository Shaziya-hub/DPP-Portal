export class SettlementFilterModel {

    //organizationId: any[] = [];
    serviceId?: any[] = [];

    fromDate: any = new Date(new Date())              //new Date(new Date().setHours(0, 0, 0, 0));
    toDate: any = new Date(new Date());          // new Date(new Date().setHours(0, 0, 0, 0));
    merchantId?: any[] = [];
    date1: any = '';
    //fromDate:any = '';
    //toDate:any='';
}