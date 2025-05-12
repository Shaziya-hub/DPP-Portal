export class UploadsFilterModel {
   // organizationId: any[] = [];
    serviceId?: any[] = [];
    processStatus?: any[] = [];
    fromDate: Date = new Date(new Date());
    toDate: Date = new Date(new Date());
    batchId?: string;
}