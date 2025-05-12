import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiPaths, changeDateRange, dateModalPosition, deepClone } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { PageConfig } from 'src/app/model/page-config';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SettlementFilterModel } from 'src/app/model/settlment-filter.model';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { dropdown, keyWords } from 'src/app/shared/constant';
@Component({
  selector: 'payments-filter',
  templateUrl: './payments-filter.component.html',
  styleUrls: ['./payments-filter.component.scss'],
})
export class PaymentsFilterComponent implements OnInit {
  @ViewChild('startDateTimeInput') public startDateTimeInput: BsDatepickerDirective;
  @ViewChild('paymentForm', { static: true }) paymentForm: NgForm;
  customButtonsSubscription: Subscription;
  customButtons$;
  @Input() public disableDatePicker: boolean = false;
  @Input() public isDisabled: boolean;
  @Input() pageConfig: PageConfig;//interface
  @Input() settlementPageInfo; //object of getAPIInfo is passed 
  @Input() applyFiltersEvent = new EventEmitter();
  public bsConfigStartDateTime: Partial<BsDatepickerConfig>;
  public bsConfigEndDateTime: Partial<BsDatepickerConfig>;
  @Input() dataSource;
  @Input() cardsAttribute



  reset = false
  reset3: boolean = false;
  orgflag: boolean = false
  toDateFlag: boolean = false
  fromDateFlag: boolean = false
  dateFlag: boolean = false
  columns = [];
  settlementFlag: boolean = true
  resetdate: Date = new Date(new Date().setHours(0, 0, 0, 0));
  isCollapsed: boolean = true;
  selectedLang: string = "";
  placeholder = keyWords.datePlaceholder
  onDateClick = dateModalPosition;
  formSubmitted: boolean = false;
  fromPickerDisplay: boolean = true;
  toPickerDisplay: boolean = true;
  monthDisplay: boolean = true
  isFromReset: boolean = false;
  isToReset: boolean = false;
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  additionalFilter: boolean = false;
  bsdateRange: any = []
  landingDateRange: any = []
  monthly: boolean = false


  searchFilters: SettlementFilterModel = new SettlementFilterModel();//we get all the data of our component element from the service


  constructor(private translate: TranslateService, private service: RestApiService, public filtersComponent: FiltersComponent, private route: ActivatedRoute, public datepipe: DatePipe) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.createDatePickersConfigs();
    const cloneListofValuepmt = new BehaviorSubject<any>(this.filtersComponent.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone
  }


  monthlyChanges(): void {
    if (this.monthly == true && this.searchFilters.fromDate != null || '') {
      this.searchFilters.fromDate = '';
      this.searchFilters.toDate = '';
    }
    else if (this.monthly == false && this.searchFilters.fromDate != null || '') {
      this.searchFilters.fromDate = '';
      this.searchFilters.toDate = '';
    }
  }

  dropdownSettings = {
    singleSelection: false,
    //  text: this.translate.instant(dropdown.allOrganizations),
  }

  getBizServicesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
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
      searchPlaceholderText: this.translate.instant(dropdown.search),
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getMerchantServiceSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
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
    return Object.assign(commonSettings, specificSetting);
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

      this.filtersComponent.pageConfig.listOfValues.merchants = this.nextdropdown.merchants

      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.merchantId = [];
      }
    })

  }

  resetForm() {
    this.formSubmitted = false;
    this.orgflag = false;
    this.toDateFlag = false;
    this.fromDateFlag = false;
    this.dateFlag = false;
    this.reset = true;
    this.reset3 = true
    this.additionalFilter = false
    this.searchFilters = new SettlementFilterModel();
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.filtersComponent.pageConfig.listOfValues.merchants = this.clone._value.merchants
    this.isCollapsed = true;
    //this.searchFilters.monthly = false;
    this.monthly = false
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });

  }

  onDeSelect() { this.searchFilters.serviceId.length = 0; }

  onChangeValue() {

    if (this.monthly == false) {
      if ((this.searchFilters.fromDate == '' || this.searchFilters.fromDate == undefined) && (this.searchFilters.toDate == '' || this.searchFilters.toDate == undefined)) {
        this.orgflag = true
        this.fromDateFlag = true
        this.toDateFlag = true
        return
      }

      else if ((this.searchFilters.fromDate == '' || this.searchFilters.fromDate == undefined) && (this.searchFilters.toDate != '' || this.searchFilters.toDate != undefined)) {
        this.fromDateFlag = true
        this.toDateFlag = false
        this.orgflag = true

      }

      else if ((this.searchFilters.fromDate != '' || this.searchFilters.fromDate != undefined) && (this.searchFilters.toDate == '' || this.searchFilters.toDate == undefined)) {
        this.fromDateFlag = false
        this.toDateFlag = true
        this.orgflag = true
      }
      else if ((this.searchFilters.fromDate != '' || this.searchFilters.fromDate != undefined) && (this.searchFilters.toDate != '' || this.searchFilters.toDate != undefined)) {
        this.orgflag = true
        this.fromDateFlag = false
        this.toDateFlag = false

      }
    }
    else if (this.monthly == true) {
      if ((this.searchFilters.fromDate == '' || this.searchFilters.fromDate == undefined) || (this.searchFilters.toDate == '' || this.searchFilters.toDate == undefined)) {
        this.orgflag = true
        this.dateFlag = true

      }
      else if ((this.searchFilters.fromDate == '' || this.searchFilters.fromDate == null)) {
        this.orgflag = false
        this.dateFlag = true
      }
    }
  }
  search() {
    if (this.monthly == true && this.searchFilters.fromDate == null) {
      return;
    } else {
      this.reset = false
      this.formSubmitted = true
      this.additionalFilter = true
      this.filtersComponent.headerConfig[keyWords.pageNumber] = String(1);
      let preparedFilters: SettlementFilterModel = deepClone(this.searchFilters);
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
        }
        if (o.indexOf(keyWords.date) > -1) {
          if (this.monthly == true) {
            /*
            settlement>Pmts?: pass 'toDate' as month end, when user selects on monthly? slider?
            */
            let date = new Date(this.searchFilters.fromDate);
            var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            preparedFilters.toDate = this.datepipe.transform(lastDayOfMonth, keyWords.toDateFormat)
            let now = new Date(preparedFilters.fromDate);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            preparedFilters.fromDate = now.toISOString().substring(0, 16) + ':00';
          }
          else {
            let now = new Date(preparedFilters[o]);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            preparedFilters[o] = now.toISOString().substring(0, 19);
          }
        }

      })
      //preparedFilters.organizationId=[preparedFilters.organizationId]
      this.getUpdatedValuesForAllSelections(preparedFilters);

      //logic to close advanced filters if none of the fields have value
      let keys = Object.keys(this.searchFilters);
      this.isCollapsed = keys.length - 1 == keys.indexOf(keyWords.toDate);
      //preparedFilters.organizationId[0] = "0001";
      this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });

    }
  }
  getUpdatedValuesForAllSelections(preparedFilters: SettlementFilterModel) {
    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
  }

  private createDatePickersConfigs(): void {
    this.bsConfigStartDateTime = {
      dateInputFormat: keyWords.datePlaceholder,
      containerClass: keyWords.themeWhite,
      customTodayClass: keyWords.customTodayClass,// to select the current date
      minDate: new Date(2019, 0, 1),
      maxDate: new Date(),
      showWeekNumbers: false,
      monthLabel: keyWords.monthLabel

    };
    this.bsConfigEndDateTime = Object.assign({}, this.bsConfigStartDateTime);

  }

  //FromDate
  bsValueChange(data: any) {
    data = this.datepipe.transform(data, keyWords.fromDateFromat)
    this.searchFilters.fromDate = data;
    if (this.searchFilters.fromDate != '' || this.searchFilters.fromDate != null) {
      this.fromDateFlag = false
    } else {
      this.fromDateFlag = true
    }

    this.isFromReset = true;
    if (!this.isFromReset) {
      this.reset = false;
    }
    this.isFromReset = false;
  }

  //ToDate
  ontoDateChange(data2: any) {
    data2 = this.datepipe.transform(data2, keyWords.toDateFormat)
    this.searchFilters.toDate = data2;
    this.reset = false;

    if (this.searchFilters.toDate != '' || this.searchFilters.toDate != null) {
      this.toDateFlag = false
    } else {
      this.toDateFlag = true
    }

    this.isToReset = true;
    if (!this.isToReset) {
      this.reset = false;
    }
    this.isToReset = false;
  }

  // Daily
  bsMonthChange(data3: any) {
    data3 = this.datepipe.transform(data3, keyWords.fromDateFromat)
    this.searchFilters.fromDate = data3;
    this.searchFilters.toDate = null;
    this.monthly = true;
    if (this.searchFilters.fromDate != '' || this.searchFilters.fromDate != null || this.searchFilters.fromDate != undefined) {
      this.dateFlag = false
    } else {
      this.dateFlag = true
    }

    this.isFromReset = true;
    if (!this.isFromReset) {
      this.reset = false;
    }
    this.isFromReset = false;
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


