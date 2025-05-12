import { Component, OnInit, Input, HostListener, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
//import { FiltersModel } from 'src/app/model/filters.model';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiPaths, addFilterHide, addFiltertransAmt, additionalFIlters, changeDateRange, dateModalPosition, deepClone, filterAssign } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { PaymentTransFilter } from 'src/app/model/paymentTransFilter.model';
import { getUniqueData } from '../../../../shared/utils';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';
import { PageConfig } from 'src/app/model/page-config';
import { BehaviorSubject, from, Subject } from 'rxjs';
import { DatePipe, formatDate } from '@angular/common';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { drop } from 'lodash';
import { time } from 'console';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";

@Component({
  selector: 'payments-filter',
  templateUrl: './payments-filter.component.html',
  styleUrls: ['./payments-filter.component.scss']

})
export class PaymentsFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() logVal;
  @Input() searchFilter: any;
  @Input() actionKey
  @Input() cardServiceAttribute
  @Input() cardsUrl
  @Input() transactionsPageInfo
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  selectedLang: string = "";
  amountMax: number;
  amountMin: number;
  getUniqData: any = getUniqueData;
  onDateClick = dateModalPosition;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset3: boolean = false;
  reset2: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false
  searchFilters: PaymentTransFilter = new PaymentTransFilter();
  statusValue: any = [];
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  daterangepickerFlag: boolean = false;
  additionalFilter: boolean = false;
  addFilters = [];
  selectedServices = []
  dateRange: Date[]
  selectedList = [];
  selectedListServiceType = [];
  selectedListChannel = [];
  selectedListPmtMethod = [];
  selectedListPmtStats = [];
  selectedListBankName = [];
  selectedListBankStatus = [];
  bsdateRange: any = []
  dashboardFlag: boolean = false;
  landingDateRange: any
  billAmtMaxSearch: any;
  billAmtMinSearch: any;

  extraFilter = {
    filterhide: false,
    addTransId: false,
    addTransAmt: false,
    addBatchID: false,
    addProfileID: false,
    addExternalRef: false,
    addProductID: false,
    addReasonCode: false,
    addServiceNo: false,
    addNotificationStatus: false,
    labelName: '',
    range: false
  }


  constructor(private translate: TranslateService, private service: RestApiService, private notificationService: NotificationService, public filtersComponent: FiltersComponent, dateTimeAdapter: DateTimeAdapter<any>, private route: ActivatedRoute, public datepipe: DatePipe, private sidemenu: SideMenuService, private eRef: ElementRef) {
    dateTimeAdapter.setLocale(translate.defaultLang)
  }


  index: number
  bsRangeValueFromDashBoard = [];
  ngOnInit(): void {

    this.reset3 = false
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    if (this.logVal == keyWords.backFromLogger) {
      this.searchFilters.serviceId = this.searchFilter[0].serviceId
      if (this.searchFilter[0].paymentRef) {
        this.searchFilters.paymentRef = this.searchFilter[0].paymentRef
      }
      if (this.searchFilter[0].billNumber) {
        this.searchFilters.billNumber = this.searchFilter[0].billNumber
      }
      if (this.searchFilter[0].transId) {
        this.inputFilters.transId = this.searchFilter[0].transId
        this.searchFilters.transId = this.searchFilter[0].transId
      }
      if (this.searchFilter[0].amount) {
        this.inputFilters.amount = this.searchFilter[0].amount
        this.searchFilters.amount = this.searchFilter[0].amount
      }
      if (this.searchFilter[0].batchId) {
        this.inputFilters.batchId = this.searchFilter[0].batchId
        this.searchFilters.batchId = this.searchFilter[0].batchId
      }
      if (this.searchFilter[0].profileId) {
        this.inputFilters.profileId = this.searchFilter[0].profileId
        this.searchFilters.profileId = this.searchFilter[0].profileId
      }
      if (this.searchFilter[0].extSysRefId) {
        this.inputFilters.extSysRefId = this.searchFilter[0].extSysRefId
        this.searchFilters.extSysRefId = this.searchFilter[0].extSysRefId
      }
      if (this.searchFilter[0].productId) {
        this.inputFilters.productId = this.searchFilter[0].productId
        this.searchFilters.productId = this.searchFilter[0].productId
      }
      if (this.searchFilter[0].reasonCode) {
        this.inputFilters.reasonCode = this.searchFilter[0].reasonCode
        this.searchFilters.reasonCode = this.searchFilter[0].reasonCode
      }
      if (this.searchFilter[0].serviceNumber) {
        this.inputFilters.serviceNumber = this.searchFilter[0].serviceNumber
        this.searchFilters.serviceNumber = this.searchFilter[0].serviceNumber
      }
      if (this.searchFilter[0].notificationStatus) {
        this.inputFilters.notificationStatus = this.searchFilter[0].notificationStatus
        this.searchFilters.notificationStatus = this.searchFilter[0].notificationStatus
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


        if (this.searchFilter[0].channelId) {
          this.pageConfig.listOfValues.pmtChannels.find(el => {
            this.searchFilter[0].channelId.find(el1 => {
              if (el.channelId == el1) {
                this.selectedListChannel.push(el)
              }
            })

          })
          this.searchFilters.channelId = this.selectedListChannel
        }

        if (this.searchFilter[0].pmtMethodId) {
          this.pageConfig.listOfValues.pmtMethods.find(el => {
            this.searchFilter[0].pmtMethodId.find(el1 => {
              if (el.methodId == el1) {
                this.selectedListPmtMethod.push(el)
              }
            })

          })
          this.searchFilters.pmtMethodId = this.selectedListPmtMethod
        }

        if (this.searchFilter[0].processStatus) {
          this.pageConfig.listOfValues.paymentStatus.find(el => {
            this.searchFilter[0].processStatus.find(el1 => {
              if (el.value == el1) {
                this.selectedListPmtStats.push(el);
              }
            })

          })
          this.searchFilters.processStatus = this.selectedListPmtStats
        }

      }, 500)

    }
    this.additionalFilter = false

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
        //console.log("Input",inputSpan)
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

  getPmtChannelsSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allPmtChannel),
      primaryKey: dropdown.channelId,
      labelKey: dropdown.channelName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getBankDetailsSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allBanks),
      primaryKey: dropdown.bankId,
      labelKey: dropdown.bankName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getBackendStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.backendStatus),
      primaryKey: dropdown.value,
      labelKey: dropdown.name,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getPaymentStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allPaymentStatus),
      primaryKey: dropdown.value,
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

    this.service?.getSvcMappings(url, filters).subscribe(data => {
      this.nextdropdown = data.body[this.svcMapping.attributeName];

      this.filtersComponent.pageConfig.listOfValues.pmtChannels = this.nextdropdown.pmtChannels
      this.filtersComponent.pageConfig.listOfValues.pmtMethods = this.nextdropdown.pmtMethods
      this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes
      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.pmtMethodId = [];
        this.searchFilters.serviceTypeId = [];
        this.searchFilters.channelId = [];
      }
    })


  }

  search() {
    this.additionalFilter = true
    this.cardsUrl = false
    this.filtersComponent.applyPmtCards.emit(this.cardsUrl)
    this.reset = false;
    if (this.extraFilter.range) {
      if ((!this.amountMin && this.amountMax) || (this.amountMin && !this.amountMax)) {
        let errorMessage = this.translate.instant(keyWords.minAndMaxAmt)
        this.notificationService.showError(errorMessage);
        return;
      }
    }
   // this.filtersComponent.headerConfig['page-number'] = String(1);
    let preparedFilters = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == 'organizationId' ? d['orgId'] : d[o] || d['value']);
      }
      if (o.indexOf('Date') > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 19);
      }
      if (this.extraFilter.range) {
        preparedFilters.amount = this.amountMin + ',' + this.amountMax;
      }

    })
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown
    if (preparedFilters && preparedFilters?.billAmount) {
      delete preparedFilters?.billAmount;
    }
    this.getUpdatedValuesForAllSelections(preparedFilters);

    //preparedFilters["timeOut"]=TimeOutDetails.getPaymentTransactionsTimeout;
    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: PaymentTransFilter) {

    if (preparedFilters?.serviceId?.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
    if (this.searchFilters?.processStatus?.length > 0) {
      this.statusValue = this.searchFilters?.processStatus.map(elment => elment.value);
      preparedFilters.processStatus = this.statusValue;
    }

    if (this.searchFilters?.pmtMethodId?.length > 0) {
      preparedFilters.pmtMethodId = this.searchFilters?.pmtMethodId.map(elment => elment.methodId);
    }

  }

  resetForm() {
    this.cardAttriute = null
    this.cardServiceAttribute = null
    this.additionalFilter = false
    this.filtersComponent.pageConfig.listOfValues.pmtChannels = this.clone._value.pmtChannels
    this.filtersComponent.pageConfig.listOfValues.pmtMethods = this.clone._value.pmtMethods
    this.filtersComponent.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.searchFilters.fromDate = null;
    this.searchFilters.toDate = null;
    this.searchFilters = new PaymentTransFilter();
    this.extraFilter.range = false;
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true
    this.inputFilters = {
      transId: null,
      amount: null,
      minMaxAmt: null,
      batchId: null,
      profileId: null,
      extSysRefId: null,
      productId: null,
      reasonCode: null,
      serviceNumber: null,
      notificationStatus: null,
      amountMin: null,
      amountMax: null
    }
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }

    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.isFromReset = true;
    this.isToReset = true;
    this.actionKey = null
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

  inputFilters = {
    transId: null,
    amount: null,
    minMaxAmt: null,
    batchId: null,
    profileId: null,
    extSysRefId: null,
    productId: null,
    reasonCode: null,
    serviceNumber: null,
    notificationStatus: null,
    amountMax: null,
    amountMin: null,
  }

  addFilterHide() {
    this.amount = false;
    addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, null, null)
  }

  rangeHide() {
    this.extraFilter.range = false
  }

  addFiltertransId() {
    filterAssign(this.extraFilter, "addTransId", keyWords.transactionID);
  }

  addFiltertransAmt() {
    addFiltertransAmt(this.extraFilter, this.searchFilters, this.inputFilters);
    // filterAssign(this.extraFilter,"addTransAmt",keyWords.transAmount)
  }

  addFilterBatchID() {
    filterAssign(this.extraFilter, "addBatchID", keyWords.batchID);
  }

  addFilterProfileID() {
    filterAssign(this.extraFilter, "addProfileID", keyWords.profileID);
  }

  addFilterExternalRef() {
    filterAssign(this.extraFilter, "addExternalRef", keyWords.extRefLabel);
  }

  addFilterProductID() {
    filterAssign(this.extraFilter, "addProductID", keyWords.productId)
  }

  addFilterReasonCode() {
    filterAssign(this.extraFilter, "addReasonCode", keyWords.reasonCode);
  }

  addFilterNotificationStatus() {
    filterAssign(this.extraFilter, "addNotificationStatus", keyWords.notificationStatus);
  }

  addFilterServiceNo() {
    filterAssign(this.extraFilter, "addServiceNo", keyWords.serviceNo)
    //  addFilterServiceNo(this.extraFilter);
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
      addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, this.amountMax, this.amountMin)
    }
    if (this.dropdown?.isOpen == true) {
      this.togglePosition();
    }
  }

  // Making all dropdown's change position dynamically accordingly to browser window ( Start )
  @HostListener('mousewheel', ['$event'])
  onMousewheel(event) {// console.log('window scroll...',this.dropdown)
    if (this.dropdown?.isOpen == true) { //console.log('scrolling...')
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
        this.extraFilter.filterhide == false ? elm.style.transform = 'translateY(-595px)' : elm.style.transform = 'translateY(-375px)';
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
