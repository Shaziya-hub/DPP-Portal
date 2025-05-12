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
import { ReconEnterpriceLogsFiletrModel } from "src/app/model/reconEnterpriceLogs.model";

@Component({
  selector: 'app-enterpriceLogs',
  templateUrl: './enterpriceLogs-filter.component.html',
  styleUrls: ['./enterpriceLogs-filter.component.scss']

})

export class EnterPriceLogsFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;//interface
  @Input() reconciliationPageInfo; //object of getAPIInfo is passed 
  @Output() applyFiltersEvent = new EventEmitter();
  @Input() dataSource;
  @Input() logVal
  @Input() searchFilter: any;

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
  selectedList = [];
  selectedbackendSystem = [];

  searchFilters: ReconEnterpriceLogsFiletrModel = new ReconEnterpriceLogsFiletrModel();

  constructor(private translate: TranslateService, public filtersComponent: FiltersComponent, private service: RestApiService, private route: ActivatedRoute, public datepipe: DatePipe) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange;
    // console.log('log 1', this.logVal)
    if (this.logVal == keyWords.backFromLogger) {
      //console.log('log 2', this.logVal); //console.log('search', this.searchFilter)
      this.searchFilters.serviceId = this.searchFilter.serviceId
      if (this.searchFilters.backendSystem) {
        this.searchFilters.backendSystem = this.searchFilter.backendSystem
      }

      setTimeout(() => {

        if (this.searchFilter.serviceId) {
          this.pageConfig.listOfValues.bizServices.find(el => {
            this.searchFilter.serviceId.find(el1 => {
              if (el.serviceId == el1) {
                this.selectedList.push(el)
              }
            })

          })
          this.searchFilters.serviceId = this.selectedList;

        }

        if (this.searchFilter.backendSystem) {
          // console.log('back')
          this.pageConfig.listOfValues.backendSystem.find(el => {
            // console.log('backend', el)
            this.searchFilter.backendSystem.find(el1 => {
              // console.log('backend', el1)
              if (el.backendSystem == el1) {
                this.selectedbackendSystem.push(el)
              }
            })

          })
          this.searchFilters.backendSystem = this.selectedbackendSystem
        }


      }, 500)
    }


    if (this.pageConfig?.listOfValues?.reconLogType.length == 0 || this.pageConfig?.listOfValues?.reconLogType == null || this.pageConfig?.listOfValues?.reconLogType == '' || this.pageConfig?.listOfValues?.reconLogType == undefined) {
      this.reconLogType = false;

    } else {
      this.reconLogType = true;

    }

  }


  dropdownSettings = {
    singleSelection: false,
    // text: this.translate.instant(dropdown.allOrganizations),

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




  getBackedSystemSetting() {
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.allBackendSystem),
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      primaryKey: dropdown.name,
      labelKey: dropdown.value,
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: dropdown.classes,
      searchPlaceholderText: this.translate.instant(dropdown.search)
    }
    return Object.assign(specificSetting);
  }
  //SVC mapping service method
  onServiceChange() {
    this.searchFilters.backendSystem = null;
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
      attributeName: keyWords.svcAttributeName,
    }
    let filters = {
      serviceId: serviceId,
      resourceId: this.resourceId
    }
    this.svcMapping = obj
    let url = this.svcMapping.url
    this.service.getSvcMappings(url, filters).subscribe(data => {

      this.nextdropdown = data.body[this.svcMapping.attributeName];


      this.filtersComponent.pageConfig.listOfValues.backendSystem = this.nextdropdown.backendSystem

      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.backendSystem = [];
      }
    })
  }

  search() {

    this.filtersComponent.headerConfig[keyWords.pageNumber] = String(1);
    let preparedFilters: ReconEnterpriceLogsFiletrModel = deepClone(this.searchFilters);
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

  getUpdatedValuesForAllSelections(preparedFilters: ReconEnterpriceLogsFiletrModel) {
    if (preparedFilters.serviceId == null || preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
    // if(preparedFilters.backendSystem==null || preparedFilters.backendSystem.length == 0){
    //     preparedFilters.backendSystem = this.filtersComponent.pageConfig.listOfValues.backendSystem.map(o => o.value)
    // }
  }



  //Completed Form is being reset
  resetForm() {
    this.formSubmitted = false
    this.searchFilters = new ReconEnterpriceLogsFiletrModel();
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
