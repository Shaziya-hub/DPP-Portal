import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ManualRefundsFilters } from 'src/app/model/manualRefundsFilter.model';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { ApiPaths, changeDateRange, dateModalPosition, deepClone } from 'src/app/shared/utils';
import { FiltersComponent } from '../filters.component';
import { DatePipe } from '@angular/common';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manual-refunds',
  templateUrl: './manual-refunds.component.html',
  styleUrls: ['./manual-refunds.component.scss']
})
export class ManualRefundsComponent {

  bsdateRange: any = [];
  landingDateRange: any;
  fromdateInputFlag: boolean = true;
  onDateClick = dateModalPosition;
  searchFilters: ManualRefundsFilters = new ManualRefundsFilters();
  additionalFilter: boolean = false;
  reset3 = false;
  latestDateRange = [];
  latestTime = []
  timeChange: boolean = false;
  resourceId: string = null;
  svcMapping: any;
  bizServiceId: any = [];
  nextdropdown: any;
  callService: boolean = false;
  gridFlag: boolean = false;
  constructor(private translate: TranslateService, public filterComponent: FiltersComponent, private datepipe: DatePipe, private service: RestApiService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId;
    })
  }


  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
    text: this.translate.instant(dropdown.allBizService),
    primaryKey: dropdown.orgId,
    labelKey: dropdown.orgName,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }
  getBizServicesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allBizService),
      primaryKey: dropdown.serviceId,
      labelKey: dropdown.serviceName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getServiceTypesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allServiceType),
      primaryKey: dropdown.serviceTypeId,
      labelKey: dropdown.serviceTypeName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getPmtMethodsSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allPmtMethod),
      primaryKey: dropdown.methodId,
      labelKey: dropdown.methodName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getPmtStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allPmtStatus),
      primaryKey: 'value',
      labelKey: 'name',
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getPostingStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allPostingStatus),
      primaryKey: 'value',
      labelKey: 'name',
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  ngOnInit() {
    let state = history.state
    if (state.filters) {

      this.gridFlag = state?.gridFlag
      this.searchFilters.fromDate = state.filters?.SearchFilters.fromDate;
      this.searchFilters.toDate = state?.filters?.SearchFilters.toDate;
      this.searchTransaction();
    }
    else {
      this.landingDateRange = this.filterComponent.pageConfig.customParams.LandingDateRange;
      this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];
    }




  }
  //dropdowns change values
  onServiceChange() {
    this.bizServiceId = this.searchFilters.serviceId
    let serviceId = []
    if (this.bizServiceId.length > 0) {
      this.bizServiceId.forEach(element1 => {
        serviceId.push(element1.serviceId)
      });
    }
    else {
      serviceId = this.filterComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
    let obj = {
      url: ApiPaths.getSvcMappings,
      attributeName: keyWords.svcMappingRs,
    }
    let filters = {
      serviceId: serviceId,
      resourceId: this.resourceId
    }
    this.svcMapping = obj

    let url = this.svcMapping.url
    this.service?.getSvcMappings(url, filters).subscribe(data => {
      this.nextdropdown = data.body[this.svcMapping.attributeName];

      this.filterComponent.pageConfig.listOfValues.pmtMethods = this.nextdropdown.pmtMethods
      this.filterComponent.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes;

      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.pmtMethodId = [];
        this.searchFilters.serviceTypeId = [];
      }
    })


  }


  //daterange picker
  dateRangeChange(rangedate) {
    let utilFun = changeDateRange(rangedate, this.searchFilters.fromDate, this.searchFilters.toDate, this.latestDateRange, this.latestTime, this.timeChange, this.datepipe)
    this.searchFilters.fromDate = utilFun[0];
    this.searchFilters.toDate = utilFun[1];
  }
  searchTransaction() {
    this.additionalFilter = true;
    this.reset3 = false;
    this.filterComponent.headerConfig['page-number'] = String(1);
    let preparedFilters: ManualRefundsFilters = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == 'organizationId' ? d['orgId'] : d[o] || d['name']);
      }
      if (o.indexOf('Date') > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 19);
      }
    })
    preparedFilters.pmtMethodId = []
    preparedFilters.processStatus = this.filterComponent.pageConfig.listOfValues.paymentStatus.map(o => o.value)
    preparedFilters.postingStatus = this.filterComponent.pageConfig.listOfValues.postingStatus.map(o => o.value)
    this.searchFilters?.pmtMethodId?.forEach(pmt => preparedFilters.pmtMethodId.push(pmt.methodId))
    this.getUpdatedValuesForAllSelections(preparedFilters);
    this.filterComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(filters: ManualRefundsFilters) {
    if (filters?.serviceId?.length == 0) {
      filters.serviceId = this.filterComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
  }
  resetForm() {
    this.reset3 = true;
    this.additionalFilter = false;
    this.searchFilters.fromDate = null;
    this.searchFilters.toDate = null;
    this.searchFilters = new ManualRefundsFilters();
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.filterComponent.applyFiltersEvent.emit({ reset: true });
  }
}
