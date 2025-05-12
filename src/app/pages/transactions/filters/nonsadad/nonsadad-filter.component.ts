import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiPaths, addFilterHide, additionalFIlters, changeDateRange, dateModalPosition, deepClone, filterAssign, getUniqueData } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { NonSadadTransFilter } from 'src/app/model/non-sadad-transFilter.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";

@Component({
  selector: 'nonsadad-filter',
  templateUrl: './nonsadad-filter.component.html',
  styleUrls: ['./nonsadad-filter.component.scss']
})
export class NonSadadFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() logVal;
  @Input() searchFilter: any;
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  isCollapsed: boolean = true;
  selectedLang: string = "";
  range: boolean = false;
  billAmountMin: number;
  billAmountMax: number;
  onDateClick = dateModalPosition;
  getUniqData: any = getUniqueData;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset3: boolean = false;
  reset2: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false;
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  additionalFilter: boolean = false;
  labelName: any;
  filterhide: boolean = false;
  addPmtRef: boolean = false;
  addAccountNo: boolean = false;
  addServiceNo: boolean = false;
  addBillNo: boolean = false;
  addBatchId: boolean = false;
  addAmount: boolean = false;
  addFilters = []
  selectedList = []
  selectedListServiceType = []
  selectedListnonSADADStats = []
  bsdateRange = []
  landingDateRange: any

  searchFilters: NonSadadTransFilter = new NonSadadTransFilter();

  constructor(private translate: TranslateService, private service: RestApiService, private notificationService: NotificationService, public filtersComponent: FiltersComponent, dateTimeAdapter: DateTimeAdapter<any>, private route: ActivatedRoute,
    public datepipe: DatePipe, private eRef: ElementRef) {
    dateTimeAdapter.setLocale(translate.defaultLang)
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]


    const cloneListofValuepmt = new BehaviorSubject<any>(this.filtersComponent.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone
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

  getBillTypesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allBillTypes),
      primaryKey: dropdown.name,
      labelKey: dropdown.name,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getNonSADADPmtStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allProcessStatus),
      primaryKey: dropdown.name,
      labelKey: dropdown.name,
      classes: dropdown.classes,
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
      attributeName: "svcMappingRs",
    }
    let filters = {
      serviceId: serviceId,
      resourceId: this.resourceId
    }
    this.svcMapping = obj
    let url = this.svcMapping.url
    this.service.getSvcMappings(url, filters).subscribe(data => {
      this.nextdropdown = data.body[this.svcMapping.attributeName];

      this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes

      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.serviceTypeId = [];
      }
    })

  }


  search() {
    this.additionalFilter = true;
    this.reset = false;
    if (this.range) {
      if ((!this.billAmountMin && this.billAmountMax) || (this.billAmountMin && !this.billAmountMax)) {
        let errorMessage = this.translate.instant(keyWords.minAndMaxAmt)
        this.notificationService.showError(errorMessage);
        return;
      }
    }
   // this.filtersComponent.headerConfig['page-number'] = String(1);
    let preparedFilters: NonSadadTransFilter = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == 'organizationId' ? d['orgId'] : d[o] || d['value']);
      }
      if (o.indexOf('Date') > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 19)
      }
      if (this.range) {
        preparedFilters.amount = this.billAmountMin + ',' + this.billAmountMax;
      }
    })
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown
    this.getUpdatedValuesForAllSelections(preparedFilters);
    // preparedFilters?.nonSADADPmtStatus.length == 0? delete preparedFilters?.nonSADADPmtStatus:'';
    // preparedFilters?.serviceTypeId.length == 0? delete preparedFilters?.serviceTypeId:'';
    // preparedFilters?.profileId == "" || preparedFilters?.profileId == undefined || preparedFilters.profileId == null?delete preparedFilters.profileId:'';
    // preparedFilters?.transId == "" || preparedFilters?.transId == undefined || preparedFilters.transId == null?delete preparedFilters.transId:''
    //logic to close advanced filters if none of the fields have value
    let keys = Object.keys(this.searchFilters);
    this.isCollapsed = keys.length - 1 == keys.indexOf("toDate");

    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: NonSadadTransFilter) {

    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    } if (this.searchFilters?.processStatus.length > 0) {
      preparedFilters.processStatus = this.searchFilters?.processStatus.map(o => o.value)
    }

  }

  resetForm() {
    this.cardAttriute = null
    this.additionalFilter = false
    this.inputFilters = {
      // paymentRef : null,
      //  accountNumber: null,
      serviceNumber: null,
      billNumber: null,
      batchId: null,
      amount: null,
      amountMax: null,
      amountMin: null,
    }
    this.searchFilters = new NonSadadTransFilter();
    this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.isCollapsed = true;
    this.range = false;
    this.reset = true;
    this.reset3 = true
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
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
  extraFilter = {
    filterhide: false,
    addServiceNo: false,
    addAmount: false,
    addBatchID: false,
    addBillNo: false,
    labelName: '',
    range: false
  }
  inputFilters = {
    serviceNumber: null,
    billNumber: null,
    batchId: null,
    amount: null,
    amountMax: null,
    amountMin: null
  }

  addFilterHide() {
    addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, this.billAmountMax, this.billAmountMin);
  }

  addFilterServiceNo() {
    filterAssign(this.extraFilter, "addServiceNo", keyWords.serviceNo)
  }

  addFilterBillNo() {
    filterAssign(this.extraFilter, "addBillNo", keyWords.billNo);
  }

  addFilterBatchID() {
    filterAssign(this.extraFilter, "addBatchID", keyWords.batchID);
  }

  addFilterAmount() {
    filterAssign(this.extraFilter, "addAmount", keyWords.amt)
  }

  additionalFIlters() {
    this.amount = false;//console.log('max',this.inputFilters.billAmountMax,'-----------------','min',this.inputFilters.billAmountMin)
    if (this.inputFilters.amountMin > this.inputFilters.amountMax) {//console.log('max',this.inputFilters.billAmountMax,'-----------------','min',this.inputFilters.billAmountMin)
      //this.notificationService.showError(this.translate.instant('Minimum amount should not exceed maximum amount'))
      this.inputFilters.amountMax = null;
      this.inputFilters.amountMin = null;
    } else {
      this.inputFilters.amount = this.inputFilters.amount != null ? this.inputFilters.amount.toString() : '';
      console.log('amount', this.inputFilters.amount)
      additionalFIlters(this.extraFilter, this.inputFilters, this.inputFilters.amountMax, this.inputFilters.amountMin, this.searchFilters);
    }

  }

  amount: boolean = false
  validateAmounts(): boolean {
    if (this.inputFilters.amountMin != null && this.inputFilters.amountMax != null && this.inputFilters.amountMin > this.inputFilters.amountMax) {
      return this.amount = true;
    } else if (this.inputFilters.amountMin != null && this.inputFilters.amountMax != null && this.inputFilters.amountMin < this.inputFilters.amountMax) {
      return this.amount = false;
    }
    return this.amount = false;;
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
      addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, this.billAmountMax, this.billAmountMin)
    }
    if (this.dropdown?.isOpen == true) {
      this.togglePosition();
    }
  }

  // Making all dropdown's change position dynamically accordingly to browser window ( Start )
  @HostListener('mousewheel', ['$event'])
  onMousewheel(event) { //console.log('scrolling...')
    if (this.dropdown?.isOpen == true) {
      this.togglePosition();
    }
  }

  togglePosition() {
    var dropdownContainer = document.querySelector(".additionalFilter")
    var position = dropdownContainer.getBoundingClientRect().top;
    var buttonHeight = dropdownContainer.getBoundingClientRect().height;
    var menuHeight = 350;
    var $win = $(window);
    if (position > menuHeight && $win.height() - position < buttonHeight + menuHeight) {
      var elm = document.querySelector<HTMLElement>('.scrolling_Dropdown')!;
      if (elm != null) {  //console.log(elm)
        this.extraFilter.filterhide == false ? elm.style.transform = 'translateY(-350px)' : elm.style.transform = 'translateY(-375px)';
      }
    } else if (position < menuHeight && $win.height() - position > buttonHeight + menuHeight) {
      var elm = document.querySelector<HTMLElement>('.scrolling_Dropdown')!;
      if (elm != null) {   // console.log(elm)
        elm.style.transform = 'translateY(0px)';
      }
    }
  }
  // Making all dropdown's change position dynamically accordingly to browser window ( End )

}
