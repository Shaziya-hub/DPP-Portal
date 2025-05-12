import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { PageConfig } from 'src/app/model/page-config';
import { TranslateService } from "@ngx-translate/core";
import { FiltersComponent } from "../filters.component";
import { ApiPaths, changeDateRange, deepClone } from "src/app/shared/utils";
import { ReconciliationLogsFiletrModel } from "src/app/model/reconciliationLogs-filter.model";
import { DatePipe } from "@angular/common";
import { dropdown, keyWords } from "src/app/shared/constant";
import { ActivatedRoute } from "@angular/router";
import { RestApiService } from "src/app/services/rest-api.service";

@Component({
  selector: 'app-logsUI',
  templateUrl: './logsUI-filter.component.html',
  styleUrls: ['./logsUI-filter.component.scss']

})

export class LogsUIFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;//interface
  @Input() reconciliationPageInfo; //object of getAPIInfo is passed 
  @Output() applyFiltersEvent = new EventEmitter();
  @Input() dataSource;

  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset2: boolean = false
  reset3: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false;
  isOpen: boolean = false;
  logs: any;
  flag = false;
  flag2 = false;
  isCollapsed: boolean = true;
  orgflag: boolean = false;
  serviceFlag: boolean = false;
  merchantFlag: boolean = false;
  fromDateFlag: boolean = true;
  toDateFlag: boolean = true;
  reconciliationFlag: boolean = true;
  additionalFilter: boolean = false;
  bsdateRange: any = []
  landingDateRange: any
  formSubmitted: boolean = false;
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  reconLogType: boolean = false

  searchFilters: ReconciliationLogsFiletrModel = new ReconciliationLogsFiletrModel();

  constructor(private translate: TranslateService, public filtersComponent: FiltersComponent, private service: RestApiService, private route: ActivatedRoute, public datepipe: DatePipe) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange;

    if (this.pageConfig?.listOfValues?.reconLogType.length == 0 || this.pageConfig?.listOfValues?.reconLogType == null || this.pageConfig?.listOfValues?.reconLogType == '' || this.pageConfig?.listOfValues?.reconLogType == undefined) {
      this.reconLogType = false;

    } else {
      this.reconLogType = true;

    }
  }


  dropdownSettings = {
    singleSelection: false,
    text: this.translate.instant(dropdown.allOrganizations),

  }

  getBizServicesSetting() {
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.allBizService),
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      primaryKey: dropdown.serviceIdPrimaryKey,
      labelKey: dropdown.serviceNameLabelkey,
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: dropdown.classes,
      searchPlaceholderText: this.translate.instant(dropdown.search)
    }
    return Object.assign(specificSetting);
  }
  //Comment belwo methods as service dropdown has been removed from UI in future we can uncomment if service dropdown filetre need agaian

  // onServiceChange(){
  //   this.searchFilters.pmtGatewayType=null;
  //   this.searchFilters.logType=null;
  //   this.searchFilters.merchantId=null;
  //   this.bizServiceId=this.searchFilters.serviceId
  //    let serviceId = []
  //    if (this.bizServiceId.length > 0) {
  //     this.bizServiceId.forEach(element1 => {
  //       serviceId.push(element1.serviceId)
  //     });
  //   }
  //   else {
  //     serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
  //   }
  //     let obj={
  //           url: ApiPaths.getSvcMappings,
  //           attributeName:keyWords.svcAttributeName,
  //     }
  //     let filters ={
  //           serviceId : serviceId,
  //           resourceId : this.resourceId
  //     }
  //     this.svcMapping=obj
  //     let url = this.svcMapping.url
  //     this.service.getSvcMappings(url,filters).subscribe(data =>{

  //             this.nextdropdown = data.body[this.svcMapping.attributeName];


  //             this.filtersComponent.pageConfig.listOfValues.merchants=this.nextdropdown.merchants
  //             this.filtersComponent.pageConfig.listOfValues.pmtGateways=this.nextdropdown.pmtGateways
  //             this.filtersComponent.pageConfig.listOfValues.reconLogType=this.nextdropdown.reconLogType

  //             if(this.nextdropdown != null && this.nextdropdown != undefined){
  //               this.searchFilters.reconLogType = null;
  //               this.searchFilters.pmtGatewayId = null;
  //               this.searchFilters.merchantId = [];
  //             }  
  //             if(this.nextdropdown.reconLogType.length == 0 || this.nextdropdown.reconLogType == null || this.nextdropdown.reconLogType == ''  || this.nextdropdown.reconLogType == undefined){
  //               this.reconLogType=false;

  //             }else{
  //               this.reconLogType=true;

  //             }      

  //     })

  // }

  getMerchantServiceSetting() {
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.merchantNames),
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      primaryKey: dropdown.merchantIdPrimaryKey,
      labelKey: dropdown.merchantIdLabelKey,
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: dropdown.classes,
      searchPlaceholderText: this.translate.instant(dropdown.search)
    }
    return Object.assign(specificSetting);
  }


  getwaysSettings = {
    text: this.translate.instant(dropdown.selectPmtGetways),
  }

  logTypeSettings = {
    text: this.translate.instant(dropdown.selectLogType),
  }

  logFlag: boolean = false;
  onChange(val: any) {
    if (val == 'TAHSEEL' || val == 'SADAD') {
      console.log('val', val)
      this.logFlag = true;

    } else {
      this.logFlag = false;
    }
  }

  onLogChange(val: any) {
    if (val != null) {
      this.logFlag = false;
    }
  }

  search() {
    if (this.searchFilters.pmtGatewayType == null) {
      this.formSubmitted = true
    }
    else if (this.reconLogType == true && this.searchFilters.logType == null && this.searchFilters.pmtGatewayType == 'SADAD') {
      this.formSubmitted = true
    } else if ((this.searchFilters.pmtGatewayType == 'TAHSEEL' || this.searchFilters.pmtGatewayType == 'SADAD') && this.searchFilters.logType == null) {
      this.logFlag = true;
      return;
    }
    else {
      this.logFlag = false;
      this.filtersComponent.headerConfig[keyWords.pageNumber] = String(1);
      let preparedFilters: ReconciliationLogsFiletrModel = deepClone(this.searchFilters);
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
        }
        if (o.indexOf(keyWords.date) > -1) {


          let now = new Date(preparedFilters[o]);
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          preparedFilters[o] = now.toISOString().substring(0, 19);

        }

      })

      this.getUpdatedValuesForAllSelections(preparedFilters);

      //logic to close advanced filters if none of the fields have value
      let keys = Object.keys(this.searchFilters);
      this.isCollapsed = keys.length - 1 == keys.indexOf(keyWords.toDate);

      this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
    }
  }

  getUpdatedValuesForAllSelections(preparedFilters: ReconciliationLogsFiletrModel) {
    //Commeted below code since service dropdown has been removed from UI we can uncomment if in future it is required
    // if (preparedFilters.serviceId.length == 0) {
    //   preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    // }
    if (preparedFilters.merchantId == null || preparedFilters.merchantId == undefined || preparedFilters.merchantId.length == 0) {
      //console.log('merchantId',preparedFilters.merchantId)
      preparedFilters.merchantId = this.filtersComponent.pageConfig.listOfValues.merchants.map(o => o.merchantId)
    }
  }



  resetForm() {
    this.formSubmitted = false
    this.searchFilters = new ReconciliationLogsFiletrModel();
    this.isCollapsed = true;
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.isFromReset = true;
    this.isToReset = true;
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }

  bsValueChange(data: any) {
    this.searchFilters.fromDate = data;
  }

  onMonthlyChange(data2: any) {
    this.searchFilters.toDate = data2;
  }
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
