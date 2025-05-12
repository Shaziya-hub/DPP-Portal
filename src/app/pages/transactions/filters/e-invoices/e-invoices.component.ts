import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { EInvoiceTransFilter } from 'src/app/model/einvoice.model';
import { FiltersComponent } from '../filters.component';
import { addFilterHide, additionalFIlters, ApiPaths, changeDateRange, deepClone, filterAssign } from 'src/app/shared/utils';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PageConfig } from 'src/app/model/page-config';
import { ActivatedRoute } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service';
import { DateTimeAdapter } from 'ng-pick-datetime';
//import { Service } from 'src/app/services/service';

@Component({
  selector: 'app-e-invoices',
  templateUrl: './e-invoices.component.html',
  styleUrls: ['./e-invoices.component.scss']
})
export class EInvoicesComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() transactionsPageInfo;
  @Input() dataSource;
  @Input() logVal;
  @Input() searchFilter: any;

  //Flags
  daterangepickerFlag: boolean = false;
  additionalFilter: boolean = false;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  timeChange: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false
  isCollapsed: boolean = true;
  reset: boolean = false;
  reset3: boolean = false;
  reset2: boolean = false;


  latestDateRange = [];
  latestTime = []
  bsdateRange: any = []
  dateRange: Date[]
  addFilters = [];
  bizServiceId: any = [];

  landingDateRange: any
  svcMapping: any
  nextdropdown: any
  searchFilters: EInvoiceTransFilter = new EInvoiceTransFilter();

  extraFilter = {
    filterhide: false,
    addProfileID: false,
    addSellerId: false,
    addBuyerId: false,
    addInvoiceIdentifier: false,
    addOrderRefId: false,
    addSourceSystem: false,
    labelName: '',
  };

  inputFilters = {
    profileId: null,
    sellerId: null,
    buyerId: null,
    invoiceIdentifier: null,
    orderRefId: null,
    sourceSystem: null,
  };
  resourceId: any;

  constructor(
    dateTimeAdapter: DateTimeAdapter<any>,
    public filtersComponent: FiltersComponent,
    private translate: TranslateService,
    private datepipe: DatePipe,
    private eRef: ElementRef,
    private route: ActivatedRoute,
    private service: RestApiService
  ) { 
    dateTimeAdapter.setLocale(translate.defaultLang)
  }

  ngOnInit() {
    this.reset3 = false;
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange;
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];

    if (this.logVal === keyWords.backFromLogger) {
      this.setSearchFiltersFromLogger();
      setTimeout(() => {
        this.setSelectedListFromLogger();
      }, 100);
    }

    this.additionalFilter = false;

    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId;
    });

    const state = history.state;
    this.searchFilters.fromDate = state?.fromDate;
    this.searchFilters.toDate = state?.toDate;
  }
  
  /*
    Back from logger logic
  */

  private setSearchFiltersFromLogger(): void {
    const searchFilter = this.searchFilter[0];
    if (searchFilter.profileId) {
      this.searchFilters.profileId = searchFilter.profileId;
    }
    if (searchFilter.sellerId) {
      this.searchFilters.sellerId = searchFilter.sellerId;
    }
    if (searchFilter.buyerId) {
      this.searchFilters.buyerId = searchFilter.buyerId;
    }
    if (searchFilter.invoiceIdentifier) {
      this.searchFilters.invoiceIdentifier = searchFilter.invoiceIdentifier;
    }
    if (searchFilter.orderRefId) {
      this.searchFilters.orderRefId = searchFilter.orderRefId;
    }
    if (searchFilter.sourceSystem) {
      this.searchFilters.sourceSystem = searchFilter.sourceSystem;
    }
    if (searchFilter.invoiceNo) {
      this.searchFilters.invoiceNo = searchFilter.invoiceNo;
    }
    if (searchFilter.extSysRefId) {
      this.searchFilters.extSysRefId = searchFilter.extSysRefId;
    }
  }

  private setSelectedListFromLogger(): void {
    const searchFilter = this.searchFilter[0];
    if (searchFilter.invoiceType) {
      this.searchFilters.invoiceType = this.getSelectedList(searchFilter.invoiceType, this.pageConfig.listOfValues.invoiceType);
    }
    if (searchFilter.serviceTypeId) {
      this.searchFilters.serviceTypeId = this.getSelectedList(searchFilter.serviceTypeId, this.pageConfig.listOfValues.serviceTypes);
    }
    if (searchFilter.serviceId) {
      this.searchFilters.serviceId = this.getSelectedList(searchFilter.serviceId, this.pageConfig.listOfValues.bizServices);
    }
    if (searchFilter.processStatus) {
      this.searchFilters.processStatus = this.getSelectedList(searchFilter.processStatus, this.pageConfig.listOfValues.eInvoiceStatus);
    }
  }

  private getSelectedList(filterValues: any[], listOfValues: any[]): any[] {
    return listOfValues.filter(el => filterValues.includes(el.value));
  }

  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
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

  getInvoiceTypeSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allInvoiceType),
      primaryKey: 'value',
      labelKey: 'name',
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getPaymentStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allInvoiceStatus),
      primaryKey: dropdown.value,
      labelKey: dropdown.name,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  dateRangeChange(rangedate) {
    let utilFun = changeDateRange(rangedate, this.searchFilters.fromDate, this.searchFilters.toDate, this.latestDateRange, this.latestTime, this.timeChange, this.datepipe);
    this.searchFilters.fromDate = utilFun[0];
    this.searchFilters.toDate = utilFun[1];
  }

  addProfileId(str, title) {
    filterAssign(this.extraFilter, str, title);
  }
  
  /*
  The entered value should be applied as a filter, and relevant results should be displayed.
  */

  addBuyerId(str, title) {
    filterAssign(this.extraFilter, str, title);
  }

  addSellerId(str, title) {
    filterAssign(this.extraFilter, str, title);
  }

  addInvoiceId(str, title) {
    filterAssign(this.extraFilter, str, title);
  }

  addOrderId(str, title) {
    filterAssign(this.extraFilter, str, title);
  }

  addSourceSystem(str, title) {
    filterAssign(this.extraFilter, str, title);
  }

  additionalFIlters() {
    additionalFIlters(this.extraFilter, this.inputFilters, null, null, this.searchFilters);
  }

  addFilterHide() {
    addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, null, null);
  }

  search() {
    this.reset = false;
    this.additionalFilter = true;
    //this.filtersComponent.headerConfig['page-number'] = String(1);
    let preparedFilters = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == 'invoiceType' ? d['value'] : d[o] || d['value']);
      }
      if (o.indexOf('Date') > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 19);
      }
    });
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown

    this.getUpdatedValuesForAllSelections(preparedFilters);

    //preparedFilters["timeOut"]=TimeOutDetails.getPaymentTransactionsTimeout;
    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: EInvoiceTransFilter) {
    if (preparedFilters?.serviceId?.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId);
    }
  }

  resetForm() {
    this.inputFilters = {
      profileId: null,
      sellerId: null,
      buyerId: null,
      invoiceIdentifier: null,
      orderRefId: null,
      sourceSystem: null,
    };
    this.searchFilters.fromDate = null;
    this.searchFilters.toDate = null;
    this.additionalFilter = false;
    this.searchFilters = new EInvoiceTransFilter();
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true;
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange);
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }


  onServiceChange() {

    this.bizServiceId = this.searchFilters.serviceId
    let serviceId = []
    if (this.bizServiceId.length > 0) {
      this.bizServiceId.forEach(element1 => {
        serviceId.push(element1.serviceId)
      });
    }
    else {
      serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
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

      this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes
      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.serviceTypeId = [];
      }
    })


  }

  autoclose = false;
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.eRef.nativeElement.contains(event.target) && event.target.className == "dropdown-item") {
      this.autoclose = false;
    } else if (event.target.className == "dropdown-item insideClick") {
      this.autoclose = false;
    }
    else if (event.target.className.indexOf('insideClick') > -1) {
      this.autoclose = false;
    }
    else {
      this.autoclose = true;
      addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, null, null);
    }
  }
}
