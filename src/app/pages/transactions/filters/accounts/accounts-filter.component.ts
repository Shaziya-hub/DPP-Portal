import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiPaths, addFilterHide, additionalFIlters, changeDateRange, dateModalPosition, deepClone, filterAssign, getUniqueData } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { AccountTransFilter } from 'src/app/model/accountTransFilter.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";


@Component({
  selector: 'accounts-filter',
  templateUrl: './accounts-filter.component.html',
  styleUrls: ['./accounts-filter.component.scss']
})
export class AccountsFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() logVal;
  @Input() searchFilter: any;
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  selectedLang: string = "";
  range: boolean = false;
  billAmountMin: number;
  billAmountMax: number;
  getUniqData: any = getUniqueData;
  onDateClick = dateModalPosition;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset3: boolean = false;
  reset2: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false
  searchFilters: AccountTransFilter = new AccountTransFilter();
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  landingDateRange: any

  additionalFilter: boolean = false;
  addFilters = []
  selectedList = []
  selectedListServiceType = []
  selectedListaccountStatus = []
  selectedListaccountTransType = []
  bsdateRange = []

  constructor(private translate: TranslateService, private service: RestApiService, public datepipe: DatePipe, private notificationService: NotificationService, public filtersComponent: FiltersComponent, dateTimeAdapter: DateTimeAdapter<any>, private route: ActivatedRoute, private eRef: ElementRef) {
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
      primaryKey: dropdown.serviceIdPrimaryKey,
      labelKey: dropdown.serviceNameLabelkey,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getServiceTypesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allServiceTypes),
      primaryKey: dropdown.serviceTypeIdPrimaryKey,
      labelKey: dropdown.serviceTypeNamePrimaryKey,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getAccountsStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allProcessStatus),
      primaryKey: dropdown.name,
      labelKey: dropdown.name,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getAccountTransactionTypesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allTransType),
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
      attributeName: keyWords.svcMappingRs,
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
    this.additionalFilter = true
    this.reset = false
    if (this.range) {
      if ((!this.billAmountMin && this.billAmountMax) || (this.billAmountMin && !this.billAmountMax)) {
        let errorMessage = this.translate.instant(keyWords.minAndMaxAmt)
        this.notificationService.showError(errorMessage);
        return;
      }
    }
    //this.filtersComponent.headerConfig['page-number'] = String(1);
    let preparedFilters: AccountTransFilter = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == 'organizationId' ? d['orgId'] : d[o] || d['value']);
      }
      if (o.indexOf('Date') > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        //console.log('prepared',preparedFilters[o])
        preparedFilters[o] = now.toISOString().substring(0, 19)
      }
      if (this.range) {
        preparedFilters.billAmount = this.billAmountMin + ',' + this.billAmountMax;
      }
    })
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown
    this.getUpdatedValuesForAllSelections(preparedFilters);

    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: AccountTransFilter) {

    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    } if (this.searchFilters?.accountStatus.length > 0) {
      preparedFilters.accountStatus = this.searchFilters?.accountStatus.map(o => o.value)
    } if (this.searchFilters?.accountTransType.length > 0) {
      preparedFilters.accountTransType = this.searchFilters?.accountTransType.map(o => o.value)
    }


  }

  resetForm() {
    this.cardAttriute = null
    this.additionalFilter = false
    this.inputFilters = {
      //  batchId : null,
      transId: null,
      // accountNumber : null
    }
    this.searchFilters = new AccountTransFilter();
    this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.range = false;
    this.reset = true;
    this.reset3 = true
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }

  bsValueChange(data: any) {
    this.searchFilters.fromDate = data;

  }

  onMonthlyChange(data2: any) {
    this.searchFilters.toDate = data2;

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
    addTransId: false,
    labelName: ''
  }
  inputFilters = {
    transId: null,
  }

  addFilterHide() {
    addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, this.billAmountMax, this.billAmountMin)

  }


  addFiltertransId() {
    filterAssign(this.extraFilter, 'addTransId', keyWords.transactionID);
  }
  additionalFIlters() {
    additionalFIlters(this.extraFilter, this.inputFilters, this.billAmountMax, this.billAmountMin, this.searchFilters)
  }

  autoclose = false;
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.eRef.nativeElement.contains(event.target) && event.target.className == "dropdown-item") {
      // this.text = "clicked inside";
      this.autoclose = false;
    } else if (event.target.className == "dropdown-item insideClick") {
      //this.text = "clicked outside";
      this.autoclose = false;
    }
    else if (event.target.className.indexOf('insideClick') > -1) {
      this.autoclose = false;
    }
    else {
      //this.text = "clicked outside";
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
      if (elm != null) { //console.log(elm)
        this.extraFilter.filterhide == false ? elm.style.transform = 'translateY(-199px)' : elm.style.transform = 'translateY(-375px)';
      }
    } else if (position < menuHeight && $win.height() - position > buttonHeight + menuHeight) {
      var elm = document.querySelector<HTMLElement>('.scrolling_Dropdown')!;
      if (elm != null) { //console.log(elm)
        elm.style.transform = 'translateY(0px)';
      }
    }
  }
  // Making all dropdown's change position dynamically accordingly to browser window ( End )

}
