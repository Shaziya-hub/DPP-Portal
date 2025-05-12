export class PayrollFilter {

    payrollSrcAccount?: any[] = [];
    processStatus?: any[] = [];
    accrualMonth?: any[] = [];

    beneficiaryAccountNumber?: string;
    extSysRefId?: string;
    payrollTransId?: string;

    fromDate: Date = new Date(new Date())
    toDate: Date = new Date(new Date());

}