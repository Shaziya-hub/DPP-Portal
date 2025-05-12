import { Component, Input, OnInit, ViewChild, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiPaths, deepClone } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { PageConfig } from 'src/app/model/page-config';
import { RestApiService } from 'src/app/services/rest-api.service';
import { DataGridComponent } from '../../data-grid/data-grid.component';
import { ReconciliationFilterModel } from 'src/app/model/reconciliation-filter.model';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from 'jquery';

@Component({
  selector: 'payments-filter',
  templateUrl: './payments-filter.component.html',
  styleUrls: ['./payments-filter.component.scss'],

})
export class PaymentsFilterComponent implements OnInit {

  @ViewChild('dataGrid') dataGrid: DataGridComponent;
  @ViewChild('paymentForm', { static: true }) paymentForm: NgForm;
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  @Input() dataSource;
  @Input() pageConfig: PageConfig;//interface
  @Input() headerConfig;
  @Input() filters;
  @Input() pageSettings;
  @Input() showNoRecords;
  @Input() reconciliationPageInfo; //object of getAPIInfo is passed 
  @Input() summaryDataSource
  @Input() dataLoading
  @Output() applyFiltersEvent = new EventEmitter();
  @Input() cardsUrl
  @Input() reasonPharse


  isCollapsed: boolean = true;
  monthly: boolean = true;
  orgflag: boolean = false;
  serviceFlag: boolean = false;
  merchantFlag: boolean = false;
  toDateFlag: boolean = false;
  fromDateFlag: boolean = false;
  reconciliationFlag: boolean = true;
  todateInputFlag: boolean = true;
  organizationId: ""
  serviceId: ""
  merchantId: ""
  fromDate: ""
  toDate: ""
  searchFilter = null
  formSubmitted: boolean = false;
  reset: boolean = false;
  display = dropdown.all;
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  fromdateInputFlag: boolean = true;
  additionalFilter: boolean = false
  labelName: any;
  filterhide: boolean = false;
  addPmtRef: boolean = false;
  addFilters = []
  mismatch: boolean = false
  detailServiceCall: boolean = false;
  pmtCard: boolean

  searchFilters: ReconciliationFilterModel = new ReconciliationFilterModel();

  constructor(private translate: TranslateService, private service: RestApiService, public filtersComponent: FiltersComponent, private route: ActivatedRoute, public datepipe: DatePipe, private eRef: ElementRef) {

    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  dropdownSettings = {
    singleSelection: true,
    text: this.translate.instant(dropdown.selectOrganization), //dynamically set the dropdown title
    primaryKey: dropdown.orgIdPrimaryKey,
    labelKey: dropdown.orgNameLabelKey,
  }


  ngOnInit(): void {
    this.pmtCard = false
    // this.mismatch=false
    this.searchFilters.reconStatus = dropdown.all;
    const cloneListofValuepmt = new BehaviorSubject<any>(this.filtersComponent.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone
  }

  getBizServicesSetting = {
    text: this.translate.instant(dropdown.selectBizService),
    primaryKey: dropdown.serviceIdPrimaryKey,
    labelKey: dropdown.serviceNameLabelkey,
  }

  getMerchantServiceSetting = {
    text: this.translate.instant(dropdown.selectMerchant),
    primaryKey: dropdown.merchantIdPrimaryKey,
    labelKey: dropdown.merchantIdLabelKey,
  }


  //  onDeSelect(){  
  //    this.searchFilters.serviceId.length = 0;
  //   }

  onChangeValue() {

    if (this.searchFilters.merchantId != null && this.searchFilters.serviceId != null && this.searchFilters.fromDate == null) {
      this.fromDateFlag = true

    }
  }

  onServiceChange() {
    this.bizServiceId = this.searchFilters.serviceId
    let serviceId = []
    serviceId = [this.searchFilters.serviceId]
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
        this.searchFilters.merchantId = null;
      }
    })

  }

  toggleCheck(event) {
    // if(document.getElementById("myCheckbox").checked === true){
    //   document.getElementById("aLink").style.display = "block";
    // } else {
    //   document.getElementById("aLink").style.display = "none";
    // }
    // if(document.getElementById("myCheckbox") ){

    // }

    if (this.mismatch == true) {
      this.searchFilters.reconStatus = dropdown.mismatchesOnly
      this.pmtCard = true
      this.filtersComponent.applyPmtCards.emit(this.pmtCard)
      this.callingService();


    } else if (this.mismatch == false) {
      this.searchFilters.reconStatus = dropdown.all;
      this.pmtCard = true
      this.filtersComponent.applyPmtCards.emit(this.pmtCard)
      this.callingService();
    }


  }

  search() {
    this.cardsUrl = false
    this.reset = false;
    this.formSubmitted = true
    this.filtersComponent.applyPmtCards.emit(this.cardsUrl)
    this.searchFilters.reconStatus = dropdown.mismatchesOnly
    this.searchFilters.paymentRef = null
    this.inputFilters.paymentRef = null
    this.mismatch = true
    this.callingService();

  }

  callingService() {
    if (this.searchFilters.fromDate == null || this.searchFilters.serviceId == null || this.searchFilters.merchantId == null) {
      this.fromDateFlag = true
    }
    else {
      this.additionalFilter = true
      this.fromDateFlag = false
      this.filtersComponent.headerConfig[keyWords.pageNumber] = String(1);
      let preparedFilters: ReconciliationFilterModel = deepClone(this.searchFilters);
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
        }
        if (o.indexOf(keyWords.date) > -1) {
          if (this.searchFilters.monthly == true) {
            /*
             Recon>Pmts : pass 'toDate' as month end, when user selects on monthly? slider?
            */
             let date = new Date(this.searchFilters.fromDate);
             var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
             preparedFilters.toDate = this.datepipe.transform(lastDayOfMonth, keyWords.toDateFormat)
             let now = new Date(preparedFilters.fromDate);
             now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
             preparedFilters.fromDate = this.searchFilters.fromDate
          }
          else {
            let now = new Date(preparedFilters[o]);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            preparedFilters[o] = now.toISOString().substring(0, 19)
          }
        }

      })
      this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
    }
  }


  resetForm() {
    this.searchFilters = new ReconciliationFilterModel();
    this.mismatch = false;
    this.monthly = true;
    this.searchFilters.reconStatus = dropdown.mismatchesOnly;
    this.isCollapsed = true;
    this.additionalFilter = false
    this.inputFilters = {
      paymentRef: null,

    };
    this.filtersComponent.pageConfig.listOfValues.merchants = this.clone._value.merchants
    // this.searchFilters.reconStatus = dropdown.all; 
    this.reset = true;
    this.orgflag = false;
    this.serviceFlag = false;
    this.merchantFlag = false;
    this.fromDateFlag = false;
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }

  bsValueChange(data: any) {
    data = this.datepipe.transform(data, keyWords.fromDateFromat)
    let data2: any = this.datepipe.transform(data, keyWords.toDateFormat)
    this.searchFilters.fromDate = data;
    this.searchFilters.toDate = data2;
    this.searchFilters.monthly = false;

  }

  onMonthlyChange(data3: any) {
    data3 = this.datepipe.transform(data3, keyWords.fromDateFromat)
    this.searchFilters.fromDate = data3;
    this.searchFilters.toDate = null;
    this.searchFilters.monthly = true;
  }


  //daterange picker
  dateRangeChange(rangedate) {
    if (rangedate != undefined && rangedate != null && rangedate.length > 0) {
      this.searchFilters.fromDate = rangedate[0];
      let toDate: any = this.datepipe.transform(rangedate[1], keyWords.toDateFormat)
      this.searchFilters.toDate = toDate;
    }
  }


  inputFilters = {
    paymentRef: null,

  }

  addFilterHide() {
    this.filterhide = false;
    if (this.inputFilters.paymentRef != null) {
      this.inputFilters.paymentRef = null
      this.addPmtRef = false
    }
    if (this.searchFilters.paymentRef != null) {
      this.inputFilters.paymentRef = this.searchFilters.paymentRef;
      this.addPmtRef = false;
    }

  }
  addFilterPmtRef() {
    this.filterhide = true
    this.addPmtRef = true
    this.labelName = keyWords.pmtRef
  }

  crossClick() {
    this.inputFilters.paymentRef = null;
    this.searchFilters.paymentRef = null;
    this.pmtCard = true
    this.filtersComponent.applyPmtCards.emit(this.pmtCard)
    this.callingService();
  }

  addedFilterName: any
  additionalFIlters() {

    this.filterhide = false
    if (this.inputFilters.paymentRef != null) {
      this.addPmtRef = false;
      this.searchFilters.paymentRef = this.inputFilters.paymentRef
      this.pmtCard = true
      this.filtersComponent.applyPmtCards.emit(this.pmtCard)
      this.callingService();
    }

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
      this.filterhide = false
      if (this.inputFilters.paymentRef != null) {
        this.inputFilters.paymentRef = null
        this.addPmtRef = false
      }
      if (this.searchFilters.paymentRef != null) {
        this.inputFilters.paymentRef = this.searchFilters.paymentRef;
        this.addPmtRef = false;
      }
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
        this.filterhide == false ? elm.style.transform = 'translateY(-195px)' : elm.style.transform = 'translateY(-370px)';
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



