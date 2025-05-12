import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from 'src/app/model/page-config';
import { ReportsFilterModel } from 'src/app/model/reportsFilter.model';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { ApiPaths, changeDateRange, deepClone } from 'src/app/shared/utils';
import { FiltersComponent } from '../filters.component';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-standardreports',
  templateUrl: './standardreports.component.html',
  styleUrls: ['./standardreports.component.scss']

})

export class StandardReportsComponent implements OnInit {
  @Input() pageConfig: PageConfig;
  @Input() pageConfig2
  @Input() reportPageInfo
  @Input() url
  @Input() dataSource
  @Input() dataFromDate: any
  @Input() dataToDate: any
  @Output() selectedValue: EventEmitter<any> = new EventEmitter();
  @Output() selectedFromDate: EventEmitter<any> = new EventEmitter();
  @Output() selectedToDate: EventEmitter<any> = new EventEmitter()

  reports: any;
  flag = false;
  flag2 = false;
  organizationId: ""
  serviceId: ""
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset2: boolean = false
  reset3: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false;
  isOpen: boolean = false;
  isCollapsed: boolean = true;
  //pageConfig2 = null;
  additionalFilter: boolean = false
  bsdateRange: any = []
  landingDateRange: any = [];
  bizServiceId: any = [];
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any;
  formSubmitted: any = false
  searchFilters: ReportsFilterModel = new ReportsFilterModel();

  constructor(private translate: TranslateService, public datepipe: DatePipe, public filtersComponent: FiltersComponent, private service: RestApiService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {
    this.landingDateRange = this.pageConfig?.customParams?.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
  }


  reportsdropdownSettings = {
    text: this.translate.instant(dropdown.selectReports),//dynamically set the dropdown title
    primaryKey: dropdown.primaryKey,
    labelKey: dropdown.labelKey,
  }

  dropdownSettings = {
    text: this.translate.instant(dropdown.selectOrganization),//dynamically set the dropdown title
  }

  specificSetting = {
    text: this.translate.instant(dropdown.selectBizService),
  }

  merchantSetting = {
    text: this.translate.instant(dropdown.selectMerchant)
  }

  getwaysTypeSettings = {
    text: this.translate.instant(dropdown.selectPmtGetways)
  }

  //SVC mapping service method
  onServiceChange() {
    //this.searchFilters.merchantId=null;
    //  this.searchFilters.pmtGatewayType=null;
    this.bizServiceId = this.searchFilters.serviceId
    let serviceId = []
    serviceId = [this.searchFilters.serviceId]
    let obj = {
      url: ApiPaths.getSvcMappings,
      attributeName: keyWords.svcAttributeName,
    }
    let filters = {
      serviceId: serviceId,
      resourceId: this.resourceId + "." + this.searchFilters.reportType
    }
    this.svcMapping = obj
    let url = this.svcMapping.url
    this.service.getSvcMappings(url, filters).subscribe(data => {
      this.nextdropdown = data.body[this.svcMapping.attributeName];

      this.filtersComponent.pageConfig2.listOfValues.merchants = this.nextdropdown.merchants;
      this.filtersComponent.pageConfig2.listOfValues.pmtGateways = this.nextdropdown.pmtGateways
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
          this.searchFilters.merchantId = null
        this.searchFilters.pmtGatewayType = null
        //  this.searchFilters.pmtGatewayId = [];
      }

    })

  }

  search() {
    this.formSubmitted = true
    this.reset = false
    if (this.searchFilters.serviceId == null) {
      this.flag2 = true;
      return;
    }else if (this.searchFilters.merchantId == null) {
      this.flag2 = true;
      return;
    }
    else if (this.searchFilters.pmtGatewayType == null) {
      this.flag2 = true;
      return;
    }
    else {
      console.log('this.pageConfig2', this.pageConfig2)
      console.log('this.searchFilters', this.searchFilters)
      this.pageConfig2?.listOfValues?.pmtGateways?.filter(filter => filter.pmtGatewayType == this.searchFilters.pmtGatewayType ?  this.searchFilters.pmtGatewayId = filter.pmtGatewayId : null)
      this.filtersComponent.headerConfig[keyWords.pageNumber] = String(1);
      let preparedFilters: ReportsFilterModel = deepClone(this.searchFilters);
      console.log('preparedFilters', preparedFilters)
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[dropdown.value]);
        }

        if (o.indexOf(keyWords.date) > -1) {
          let now = new Date(preparedFilters[o]);
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          preparedFilters[o] = now.toISOString().substring(0, 19);
        }


      })

      this.getUpdatedValuesForAllSelections(preparedFilters);

      this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });

    }
  }
  getUpdatedValuesForAllSelections(preparedFilters: ReportsFilterModel) {
    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }

  }

  page: any

  //Completed Form is being reset
  resetForm() {
    this.searchFilters = new ReportsFilterModel();
    this.isCollapsed = true;
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true
    this.formSubmitted = false
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.isFromReset = true;
    this.isToReset = true;
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }


  onChange(val: any) {
    val = this.searchFilters.reportType
    this.selectedValue.emit(val)
    this.searchFilters.serviceId = null;
     this.searchFilters.merchantId=null;
    this.searchFilters.pmtGatewayType = null;
    this.searchFilters.fromDate = new Date(new Date().setHours(0, 0, 0, 0))
    this.searchFilters.toDate = new Date(new Date().setHours(23, 59, 59, 999));
    this.reset3 = true
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
  }

  getPageAPIInfo() {
    this.searchFilters.reportType
  }

  onFromDateChange(fromdate: any) {
    fromdate = this.datepipe.transform(fromdate, keyWords.fromDateFromat)
    this.searchFilters.fromDate = fromdate
    this.selectedFromDate.emit(fromdate)
  }


  bsValueChange(data: any) {
    this.searchFilters.fromDate = data;
    this.selectedFromDate.emit(data)
  }

  onMonthlyChange(data2: any) {
    this.searchFilters.toDate = data2;
    this.selectedToDate.emit(data2)
  }

  //daterange picker
  latestDateRange = [];
  latestTime = []
  timeChange: boolean = false;
  //daterange picker
  dateRangeChange(rangedate) {
    let utilFun = changeDateRange(rangedate, this.searchFilters.fromDate, this.searchFilters.toDate, this.latestDateRange, this.latestTime, this.timeChange, this.datepipe)
    this.searchFilters.fromDate = utilFun[0];
    this.searchFilters.toDate = utilFun[1];
  }
}