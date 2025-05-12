export class ReportsFilterModel {

  serviceId? = null;
  reportType? = null;
  merchantId? = null;
  pmtGatewayType? = null;
  pmtGatewayId? = null;
   fromDate: Date = new Date(new Date().setHours(0, 0, 0, 0))
 // fromDate? = null;
   toDate: Date =new Date(new Date().setHours(23, 59, 59, 999));
 // toDate? = null;


}