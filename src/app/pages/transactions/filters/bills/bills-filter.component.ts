import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/services/notification.service';
import { deepClone, dateModalPosition, getUniqueData, ApiPaths, changeDateRange, additionalFIlters, addFilterHide, filterAssign, addFilterBillAmt } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { BillTransFilter } from 'src/app/model/billTransFilter.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PageConfig } from 'src/app/model/page-config';
import { map } from 'rxjs/operators';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { drop } from 'lodash';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";


@Component({
  selector: 'bills-filter',
  templateUrl: './bills-filter.component.html',
  styleUrls: ['./bills-filter.component.scss']


})
export class BillsFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() logVal;
  @Input() searchFilter: any;
  @Input() cardServiceAttribute
  @Input() cardsUrl
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  isCollapsed: boolean = true;
  selectedLang: string = "";
  range: boolean = false;
  amountMin: number;
  amountMax: number;
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
  //daterangepicker calender
  daterangepickerFlag: boolean = false;
  //additional filter dropdown
  additionalFilter: boolean = false;
  filterhide: boolean = false
  labelName: any
  addAccountno: boolean = false
  addBillNo: boolean = false
  addProfileID: boolean = false
  addTransId: boolean = false
  addServiceNo: boolean = false
  addBillAmt: boolean = false
  selectedServices = []
  selectedList = []
  selectedListServiceType = []
  selectedListBillStats = []
  selectedListBillType = []
  bsdateRange: any = []
  dashboardFlag: boolean = false;
  landingDateRange: any;
  addReasonCode: boolean = false;
  addBillCategory: boolean = false


  addFilters = []



  searchFilters: BillTransFilter = new BillTransFilter();
  bsRangeValueFromDashBoard = [];
  extraFilter = {
    filterhide: false,
    addTransId: false,
    addAccountno: false,
    addProfileID: false,
    addBillAmt: false,
    addServiceNo: false,
    addReasonCode: false,
    addBillCategory: false,
    labelName: '',
    range: false
  }

  constructor(private translate: TranslateService, private service: RestApiService, public datepipe: DatePipe, private notificationService: NotificationService, public filtersComponent: FiltersComponent, dateTimeAdapter: DateTimeAdapter<any>, private route: ActivatedRoute, private router: Router, private eRef: ElementRef) {
    dateTimeAdapter.setLocale(translate.defaultLang);
  }

  ngOnInit(): void {

    this.landingDateRange = this.pageConfig.customParams.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    if (this.logVal == keyWords.backFromLogger) {
      if (this.searchFilter[0].batchId) {
        this.searchFilters.batchId = this.searchFilter[0].batchId
      }
      if (this.searchFilter[0].billNumber) {
        this.searchFilters.billNumber = this.searchFilter[0].billNumber
      }
      if (this.searchFilter[0].extSysRefId) {
        this.searchFilters.extSysRefId = this.searchFilter[0].extSysRefId
      }
      if (this.searchFilter[0].accountNumber) {
        this.inputFilters.accountNumber = this.searchFilter[0].accountNumber
        this.searchFilters.accountNumber = this.searchFilter[0].accountNumber
      }
      if (this.searchFilter[0].profileId) {
        this.inputFilters.profileId = this.searchFilter[0].profileId
        this.searchFilters.profileId = this.searchFilter[0].profileId
      }
      if (this.searchFilter[0].transId) {
        this.inputFilters.transId = this.searchFilter[0].transId
        this.searchFilters.transId = this.searchFilter[0].transId
      }
      if (this.searchFilter[0].serviceNumber) {
        this.inputFilters.serviceNumber = this.searchFilter[0].serviceNumber
        this.searchFilters.serviceNumber = this.searchFilter[0].serviceNumber
      }
      if (this.searchFilter[0].amount) {
        this.inputFilters.amount = this.searchFilter[0].amount
        this.searchFilters.amount = this.searchFilter[0].amount
      }
      if (this.searchFilter[0].reasonCode) {
        this.inputFilters.reasonCode = this.searchFilter[0].reasonCode
        this.searchFilters.reasonCode = this.searchFilter[0].reasonCode
      }
      if (this.searchFilter[0].billCategory) {
        this.inputFilters.billCategory = this.searchFilter[0].billCategory
        this.searchFilters.billCategory = this.searchFilter[0].billCategory
      }
      setTimeout(() => {

        if (this.searchFilter[0].serviceId) {
          this.pageConfig.listOfValues.bizServices.find(el => {
            this.searchFilter[0].serviceId.find(el1 => {
              if (el.serviceId == el1) {
                this.selectedList.push(el)
              }
            })

          })
          this.searchFilters.serviceId = this.selectedList;
        }

        if (this.searchFilter[0].serviceTypeId) {
          this.pageConfig.listOfValues.serviceTypes.find(el => {
            this.searchFilter[0].serviceTypeId.find(el1 => {
              if (el.serviceTypeId == el1) {
                this.selectedListServiceType.push(el)
              }
            })

          })
          this.searchFilters.serviceTypeId = this.selectedListServiceType
        }

        if (this.searchFilter[0].billStatus) {
          this.pageConfig.listOfValues.billStatus.find(el => {
            this.searchFilter[0].billStatus.find(el1 => {
              if (el.value == el1) {
                this.selectedListBillStats.push(el);
              }
            })

          })
          this.searchFilters.billStatus = this.selectedListBillStats
        }

        if (this.searchFilter[0].billType) {
          this.pageConfig.listOfValues.billTypes.find(el => {
            this.searchFilter[0].billType.find(el1 => {
              if (el.value == el1) {
                this.selectedListBillType.push(el);
              }
            })

          })
          this.searchFilters.billType = this.selectedListBillType
        }

        //this.search();

      }, 500)

    }

    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId;
    })
    let state = history.state

    this.searchFilters.fromDate = state?.fromDate,
      this.searchFilters.toDate = state?.toDate,
      this.searchFilters.serviceId = state?.serviceId
    this.dashboardFlag = state.dashboardFlag;
    state?.serviceId?.map((o: any) => {
      this.pageConfig.listOfValues.bizServices.find((el: any) => {
        if (el.serviceId == o) {
          this.selectedServices.push(el)
        }
      })
    });
    if (this.dashboardFlag) {
      setTimeout(() => {
        const inputSpan = document.querySelector<HTMLElement>(".input-group-append span");
        const customTextwidth = document.querySelector<HTMLElement>(".customTextwidth")
        customTextwidth != null && customTextwidth != undefined ? customTextwidth.style.width = '100%' : '';
        if (inputSpan != null && inputSpan != undefined) {
          inputSpan.style.height = '50px';
          inputSpan.style.top = '0px'
        }
      }, 10)
    }

    this.bsRangeValueFromDashBoard = [new Date(this.searchFilters.fromDate), new Date(this.searchFilters.toDate)]
    this.searchFilters.serviceId = this.selectedServices;
    if (this.dashboardFlag) {
      this.search();
    }

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

  getBillStatusSetting() {
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
    this.additionalFilter = true
    //console.log('cardServiceAttribute',this.cardServiceAttribute)
    this.cardsUrl = false
    this.filtersComponent.applyPmtCards.emit(this.cardsUrl)
    this.reset = false
    if (this.range) {
      if ((!this.amountMin && this.amountMax) || (this.amountMin && !this.amountMax)) {
        let errorMessage = this.translate.instant(keyWords.minAndMaxAmt)
        this.notificationService.showError(errorMessage);
        return;
      }
    }
    //this.filtersComponent.headerConfig['page-number'] = String(1);
    let preparedFilters = deepClone(this.searchFilters);
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
        preparedFilters.amount = this.amountMin + ',' + this.amountMax;
      }
    })

    //if range is true transactionAmount should get delete
    if (preparedFilters && preparedFilters?.transactionAmount) {
      delete preparedFilters?.transactionAmount;
    }

    this.getUpdatedValuesForAllSelections(preparedFilters);
    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: BillTransFilter) {

    if (preparedFilters?.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
    if (this.searchFilters?.billType.length > 0) {
      preparedFilters.billType = this.searchFilters?.billType.map(o => o.value)
    } if (this.searchFilters?.billStatus.length > 0) {
      preparedFilters.billStatus = this.searchFilters?.billStatus.map(o => o.value)
    }
  }

  resetForm() {
    this.cardAttriute = null
    this.cardServiceAttribute = null
    this.additionalFilter = false
    this.searchFilters = new BillTransFilter();
    this.inputFilters = {
      accountNumber: null,
      profileId: null,
      transId: null,
      serviceNumber: null,
      amount: null,
      reasonCode: null,
      billCategory: null,
      amountMax: null,
      amountMin: null
    }
    this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.isCollapsed = true;
    this.range = false;
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

  inputFilters = {
    accountNumber: null,
    profileId: null,
    transId: null,
    serviceNumber: null,
    amount: null,
    reasonCode: null,
    billCategory: null,
    amountMin: null,
    amountMax: null

  }

  addFilterHide() {
    this.amount = false;
    addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, null, null)
  }

  addFiltertransId() {
    filterAssign(this.extraFilter, "addTransId", keyWords.transactionID)
  }

  addFilterAccountno() {
    filterAssign(this.extraFilter, "addAccountno", keyWords.accountNo)
  }

  addFilterProfileID() {
    filterAssign(this.extraFilter, "addProfileID", keyWords.profileID)
  }

  addFilterBillNo() {
    filterAssign(this.extraFilter, "addBillAmt", keyWords.billNo)
  }

  addFilterServiceNo() {
    filterAssign(this.extraFilter, "addServiceNo", keyWords.serviceNo)
  }

  addFilterBillAmt() {
    //for range checkbox
    addFilterBillAmt(this.extraFilter, this.searchFilters, this.inputFilters);
    //filterAssign(this.extraFilter,"addBillAmt",keyWords.billAmt);
  }

  addFilterReasonCode() {
    filterAssign(this.extraFilter, "addReasonCode", keyWords.reasonCode);
  }

  addFilterBillCategory() {
    filterAssign(this.extraFilter, "addBillCategory", keyWords.billCategory);
  }

  addedFilterName: any
  additionalFIlters() {
    this.amount = false;
    if (this.inputFilters.amountMin > this.inputFilters.amountMax) {//console.log('max',this.inputFilters.billAmountMax,'-----------------','min',this.inputFilters.billAmountMin)
      //this.notificationService.showError(this.translate.instant('Minimum amount should not exceed maximum amount'))
      this.inputFilters.amountMax = null;
      this.inputFilters.amountMin = null;

    } else {
      this.inputFilters.amount = this.inputFilters.amount != null ? this.inputFilters.amount.toString() : '';
      // console.log("payment",this.inputFilters)
      additionalFIlters(this.extraFilter, this.inputFilters, this.amountMax, this.amountMin, this.searchFilters);
    }
    // additionalFIlters(this.extraFilter, this.inputFilters, this.amountMax, this.amountMin, this.searchFilters);
  }

  // This method is called whenever the value of amountMin or amountMax changes
  amount: boolean = false
  validateAmounts(): boolean {
    if (this.inputFilters.amountMin != null && this.inputFilters.amountMax != null && this.inputFilters.amountMin > this.inputFilters.amountMax) {
      return this.amount = true;
    } else if (this.inputFilters.amountMin != null && this.inputFilters.amountMax != null && this.inputFilters.amountMin < this.inputFilters.amountMax) {
      return this.amount = false;
    }
    return this.amount = false;
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
      addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, this.amountMax, this.amountMin)
    }
    if (this.dropdown?.isOpen == true) {
      this.togglePosition();
    }
  }

  rangeHide() {
    this.extraFilter.range = true;
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
        this.extraFilter.filterhide == false ? elm.style.transform = 'translateY(-500px)' : elm.style.transform = 'translateY(-375px)';
      }
    } else if (position < menuHeight && $win.height() - position > buttonHeight + menuHeight) {
      var elm = document.querySelector<HTMLElement>('.scrolling_Dropdown')!;
      if (elm != null) {  // console.log(elm)
        elm.style.transform = 'translateY(0px)';
      }
    }
  }
  // Making all dropdown's change position dynamically accordingly to browser window ( End )
}
