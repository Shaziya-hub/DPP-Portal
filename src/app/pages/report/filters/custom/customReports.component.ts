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
  selector: 'app-customreports',
  templateUrl: './customReports.component.html',
  styleUrls: ['./customReports.component.scss']

})

export class CustomReportsComponent implements OnInit {
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
  flag2: boolean = false;
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
  searchFilters: ReportsFilterModel = new ReportsFilterModel();
  isDropup = true;
  days: any = '00'
  hours: any = '00'
  minutes: any = '05'
  totalcntDrop: any = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']
  totalHoursDrop: any = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
  totalMinutesDrop: any = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']

  constructor(public datepipe: DatePipe, public filtersComponent: FiltersComponent, private service: RestApiService, private route: ActivatedRoute, private translate: TranslateService) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void { //console.log('standardReports')
    this.landingDateRange = this.pageConfig?.customParams?.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]

  }

  reportsdropdownSettings = {
    //  text: this.translate.instant(dropdown.selectReports),//dynamically set the dropdown title
    primaryKey: dropdown.primaryKey,
    labelKey: dropdown.labelKey,
  }

  dropdownSettings = {
    //text: this.translate.instant(dropdown.selectOrganization),//dynamically set the dropdown title
  }

  specificSetting = {
    //  text: this.translate.instant(dropdown.selectBizService),
  }

  merchantSetting = {
    //  text: this.translate.instant(dropdown.selectMerchant)
  }

  getwaysTypeSettings = {
    // text:this.translate.instant(dropdown.selectPmtGetways)
  }

  getBillStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant('All Bill Statuses'),
      primaryKey: 'value',
      labelKey: 'name',
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getPaymentStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant('All Payment Statuses'),
      primaryKey: 'value',
      labelKey: 'name',
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  onServiceChange() {
    let abc = this.translate
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
        //   this.searchFilters.merchantId = null
        this.searchFilters.pmtGatewayType = null
        //  this.searchFilters.pmtGatewayId = [];
      }

    })

  }


  search() {
    if (this.searchFilters.reportType == 'CUST_SUMMARY_BILL_PMTS' && this.searchFilters.customReportSummaryType == null) {
      this.flag2 = true;
      return;
    }
    else {
      this.flag2 = false;
      //  console.log('searchFilter',this.searchFilters.processStatus)
      // if(this.searchFilters.processStatus == null){
      //   this.searchFilters.processStatus=[];
      //  this.searchFilters.processStatus=this.filtersComponent.pageConfig2.listOfValues?.billStatus?.map(o => o.value )
      //  console.log('searchFilter',this.searchFilters.processStatus)
      // }

      this.pageConfig2?.listOfValues?.pmtGateways?.filter(filter => filter.pmtGatewayType == this.searchFilters.pmtGatewayType ? this.searchFilters.pmtGatewayId = filter.pmtGatewayId : null)
      this.filtersComponent.headerConfig[keyWords.pageNumber] = String(1);
      let preparedFilters: ReportsFilterModel = deepClone(this.searchFilters);

      if (this.searchFilters.reportType == 'CUST_PENDING_BILLS') {//console.log('searchFilters.reportType',this.searchFilters.reportType)
        preparedFilters.processStatus = null;
        preparedFilters.toDate = null;
        preparedFilters.fromDate = null;
        preparedFilters.fromDate = this.days + ',' + this.hours + ',' + this.minutes;
        //console.log('fromDate',preparedFilters.fromDate)
        preparedFilters.processStatus == null || preparedFilters.processStatus.length == 0 ? delete preparedFilters.processStatus : '';
        //preparedFilters.processStatus.length==0? delete preparedFilters.processStatus:'';
        preparedFilters.toDate == null ? delete preparedFilters.toDate : '';
        //console.log('preparedFilter CUST_PENDING_BILLS',preparedFilters)
      } else {
        //preparedFilters.processStatus=this.filtersComponent.pageConfig2.listOfValues?.billStatus?.map(o => o.value )
        //console.log('preparedFilter',preparedFilters)
        Object.keys(preparedFilters).forEach(o => {
          let obj = preparedFilters[o];
          if (Array.isArray(obj)) {
            preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d['value']);
          }

          if (o.indexOf(keyWords.date) > -1) {
            let now = new Date(preparedFilters[o]);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            preparedFilters[o] = now.toISOString().substring(0, 19);
          }
        })
      }

      if (this.searchFilters.reportType == "CUST_SUMMARY_BILL_PMTS" || this.searchFilters.reportType == "CUST_SUMMARY_REFUNDS") {
        preparedFilters.processStatus == null || preparedFilters.processStatus.length == 0 ? delete preparedFilters.processStatus : '';
      }


      this.getUpdatedValuesForAllSelections(preparedFilters);
      preparedFilters.serviceId == null ? delete preparedFilters.serviceId : '';
      preparedFilters.pmtGatewayType == null ? delete preparedFilters.pmtGatewayType : '';
      preparedFilters.pmtGatewayId == null ? delete preparedFilters.pmtGatewayId : '';
      if (preparedFilters.reportType != 'CUST_SUMMARY_REFUNDS') {
        preparedFilters.customReportSummaryType == null ? delete preparedFilters.customReportSummaryType : '';

      } else if (preparedFilters.reportType == 'CUST_SUMMARY_REFUNDS' || preparedFilters.reportType == 'CUST_SUMMARY_BILL_PMTS') {
        preparedFilters.processStatus == null || preparedFilters.processStatus.length == 0 ? delete preparedFilters.processStatus : '';
      }
      // 
      preparedFilters.fromDate == null ? delete preparedFilters.fromDate : '';
      // console.log('preparedFilter',preparedFilters)
      this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });

    }
  }
  getUpdatedValuesForAllSelections(preparedFilters: ReportsFilterModel) {
    if ((preparedFilters.processStatus == null || preparedFilters.processStatus.length == 0) && preparedFilters.reportType != 'CUST_PENDING_BILLS' && preparedFilters.reportType != 'CUST_SUMMARY_REFUNDS') {
      if (this.filtersComponent.pageConfig2.listOfValues?.billStatus) {
        preparedFilters.processStatus = this.filtersComponent.pageConfig2.listOfValues?.billStatus?.map(o => o.value)
      } else if (this.filtersComponent.pageConfig2.listOfValues?.paymentStatus) {
        preparedFilters.processStatus = this.filtersComponent.pageConfig2.listOfValues?.paymentStatus?.map(o => o.value)
      }

    }

    if (preparedFilters.customReportSummaryType == null && preparedFilters.reportType == 'CUST_SUMMARY_REFUNDS') {

      if (this.filtersComponent.pageConfig2.listOfValues?.customReportSummaryType) {
        preparedFilters.customReportSummaryType = this.filtersComponent.pageConfig2.listOfValues?.customReportSummaryType[0].value
      }

    }
  }

  onSummaryChange(val: any) {
    // console.log('val',val)
    if (val != null) {
      this.flag2 = false
    }

  }



  resetForm() {
    this.searchFilters = new ReportsFilterModel();
    this.isCollapsed = true;
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true
    this.flag2 = false
    this.days = '00'
    this.hours = '00'
    this.minutes = '05'
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.isFromReset = true;
    this.isToReset = true;
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }

  changeDropdownDays(days) {

    this.days = days
    //  console.log('days',days);
  }

  changeDropdownHours(hours) {

    this.hours = hours
    // console.log('hours',hours);
  }

  changeDropdownMinutes(min) {

    this.minutes = min
    // console.log('min',min);
  }

  onChange(val: any) {
    val = this.searchFilters.reportType
    this.selectedValue.emit(val)
    this.searchFilters.processStatus = null;
    this.searchFilters.customReportSummaryType = null;
    this.searchFilters.serviceId = null;
    this.searchFilters.fromDate = new Date(new Date().setHours(0, 0, 0, 0))
    this.searchFilters.toDate = new Date(new Date().setHours(23, 59, 59, 999));
    this.days = '00'
    this.hours = '00'
    this.minutes = '05'
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