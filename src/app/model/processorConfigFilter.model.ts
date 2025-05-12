import { dropdown } from "../shared/constant";

export class ProcessorConfigFilterModel {

    serviceId = { key: null, value: dropdown.selectBizService };
    pmtMethodId = { key: null, value: dropdown.selectPaymentMethod }
    serviceTypeId = { key: null, value: dropdown.selectServiceType }

}