import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiPaths, addFilterHide, addFilterRefundAmt, additionalFIlters, changeDateRange, dateModalPosition, deepClone, filterAssign, getUniqueData } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { RefundsTransFilter } from 'src/app/model/refundsTransFilter.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";


@Component({
  selector: 'refunds-filter',
  templateUrl: './refunds-filter.component.html',
  styleUrls: ['refunds-filter.component.scss']
})
export class RefundsFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() logVal;
  @Input() searchFilter: any;
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
  isToReset: boolean = false
  searchFilters: RefundsTransFilter = new RefundsTransFilter();
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  additionalFilter: boolean = false;
  filterhide: boolean = false
  labelName: any
  addTransId: boolean = false
  addRefundId: boolean = false
  addExtRef: boolean = false
  addBatchID: boolean = false
  addPmtRef: boolean = false
  addIBAN: boolean = false
  addSearch: boolean = false
  addRefundAmt: boolean = false
  addFilters = []
  selectedList = []
  selectedListChannel = []
  selectedListPmtMethod = []
  selectedListRefundStats = []
  selectedListBankName = []
  bsdateRange = []
  landingDateRange: any

  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }

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
    if (this.logVal == keyWords.backFromLogger) {
      this.searchFilters.serviceId = this.searchFilter[0].serviceId
      if (this.searchFilter[0].refundId) {
        this.searchFilters.refundId = this.searchFilter[0].refundId
      }
      if (this.searchFilter[0].extSysRefId) {
        this.searchFilters.extSysRefId = this.searchFilter[0].extSysRefId
      }
      if (this.searchFilter[0].paymentRef) {
        this.searchFilters.paymentRef = this.searchFilter[0].paymentRef
      }
      if (this.searchFilter[0].transId) {
        this.inputFilters.transId = this.searchFilter[0].transId
        this.searchFilters.transId = this.searchFilter[0].transId
      }
      if (this.searchFilter[0].batchId) {
        this.inputFilters.batchId = this.searchFilter[0].batchId
        this.searchFilters.batchId = this.searchFilter[0].batchId
      }
      if (this.searchFilter[0].iban) {
        this.inputFilters.iban = this.searchFilter[0].iban
        this.searchFilters.iban = this.searchFilter[0].iban
      }
      if (this.searchFilter[0].amount) {
        this.inputFilters.amount = this.searchFilter[0].amount
        this.searchFilters.amount = this.searchFilter[0].amount
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
          this.pageConfig.listOfValues.refundStatus.find(el => {
            this.searchFilter[0].processStatus.find(el1 => {
              if (el.value == el1) {
                this.selectedListRefundStats.push(el);
              }
            })

          })
          this.searchFilters.processStatus = this.selectedListRefundStats
        }

      }, 500)
    }
    const cloneListofValuepmt = new BehaviorSubject<any>(this.filtersComponent.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone

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
      text: this.translate.instant(dropdown.allRefundChannel),
      primaryKey: dropdown.channelId,
      labelKey: dropdown.channelName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getRefundStatusSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allRefundStatus),
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

      this.filtersComponent.pageConfig.listOfValues.pmtMethods = this.nextdropdown.pmtMethods
      this.filtersComponent.pageConfig.listOfValues.pmtChannels = this.nextdropdown.pmtChannels

      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.pmtMethodId = [];
        this.searchFilters.channelId = [];
      }
    })
  }


  search() {
    this.additionalFilter = true;
    this.reset = false;
    if (this.range) {
      if ((!this.amountMin && this.amountMax) || (this.amountMin && !this.amountMax)) {
        let errorMessage = this.translate.instant(keyWords.minAndMaxAmt)
        this.notificationService.showError(errorMessage);
        return;
      }
    }
  //  this.filtersComponent.headerConfig['page-number'] = String(1);
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
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown
    this.getUpdatedValuesForAllSelections(preparedFilters);
    let keys = Object.keys(this.searchFilters);

    this.isCollapsed = keys.length - 1 == keys.indexOf("toDate");

    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: RefundsTransFilter) {
    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    } if (this.searchFilters?.processStatus.length > 0) {
      preparedFilters.processStatus = this.searchFilters?.processStatus.map(o => o.value)
    }
    if (this.searchFilters?.pmtMethodId?.length > 0) {
      preparedFilters.pmtMethodId = this.searchFilters?.pmtMethodId.map(elment => elment.methodId);
    }
  }

  resetForm() {
    this.cardAttriute = null
    this.additionalFilter = false
    this.inputFilters = {
      transId: null,
      batchId: null,
      iban: null,
      amount: null,
      amountMin: null,
      amountMax: null
    }
    this.searchFilters = new RefundsTransFilter();
    this.filtersComponent.pageConfig.listOfValues.pmtMethods = this.clone._value.pmtMethods
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
    addBatchID: false,
    addIBAN: false,
    addRefundAmt: false,
    labelName: '',
    range: false,
  }
  inputFilters = {
    transId: null,
    batchId: null,
    iban: null,
    amount: null,
    amountMin: null,
    amountMax: null
  }

  addFilterHide() {
    this.amount = false;
    addFilterHide(this.inputFilters, this.extraFilter, this.searchFilters, null, null)
  }


  addFilterTransId() {
    filterAssign(this.extraFilter, "addTransId", keyWords.transactionID)
  }

  addFilterBatchID() {
    filterAssign(this.extraFilter, "addBatchID", keyWords.batchID)
  }

  addFilterIBAN() {
    filterAssign(this.extraFilter, 'addIBAN', keyWords.IBAN)
  }

  addFilterRefundAmt() {
    // filterAssign(this.extraFilter,'addRefundAmt',keyWords.refundAmt)
    //console.log("refund",this.extraFilter,this.searchFilters,this.inputFilters)
    addFilterRefundAmt(this.extraFilter, this.searchFilters, this.inputFilters);
  }


  additionalFIlters() {
    this.amount = false
    if (this.inputFilters.amountMin > this.inputFilters.amountMax) {//console.log('max',this.inputFilters.amountMax,'-----------------','min',this.inputFilters.amountMin)
      //this.notificationService.showError(this.translate.instant('Minimum amount should not exceed maximum amount'))
      this.inputFilters.amountMax = null;
      this.inputFilters.amountMin = null;
    } else {
      this.inputFilters.amount = this.inputFilters.amount != null ? this.inputFilters.amount.toString() : '';
      // console.log("payment",this.inputFilters)
      additionalFIlters(this.extraFilter, this.inputFilters, this.amountMax, this.amountMin, this.searchFilters);
    }
    // additionalFIlters(this.extraFilter, this.inputFilters, this.inputFilters.amountMax, this.inputFilters.amountMin, this.searchFilters)
  }

  // This method is called whenever the value of amountMin or amountMax changes
  amount: boolean = false
  validateAmounts(): boolean {
    if (this.inputFilters.amountMin != null && this.inputFilters.amountMax != null && this.inputFilters.amountMin > this.inputFilters.amountMax) {
      return this.amount = true;
    } else if (this.inputFilters.amountMin != null && this.inputFilters.amountMax != null && this.inputFilters.amountMin < this.inputFilters.amountMax) {
      return this.amount = false;
    }
    return this.amount = false;;
  }

  rangeHide() {
    this.extraFilter.range = true;
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
  onMousewheel(event) {//console.log('scrolling...')
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
      if (elm != null) {  //console.log(elm)
        elm.style.transform = 'translateY(0px)';
      }
    }
  }
  // Making all dropdown's change position dynamically accordingly to browser window ( End )

}
