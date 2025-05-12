import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { ApiPaths, deepClone, deleteFilters } from 'src/app/shared/utils';
import { FiltersComponent } from '../filters.component';
import { DatePipe } from '@angular/common';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ActivatedRoute } from '@angular/router';
import { GenerateInvoiceFilterModel } from 'src/app/model/generateInvoice-filter.model';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { GenerateInvoiceModalService } from '../../generate-invoice-modal/genereate-invoice-modal.service';

@Component({
  selector: 'app-generate-invoices',
  templateUrl: './generate-invoices.component.html',
  styleUrls: ['./generate-invoices.component.scss']
})
export class GenerateInvoicesComponent {

  @Input() pageConfig: PageConfig;//interface
  @Input() operationsPageInfo;
  @Input() headerConfig
  bizServiceId: any = [];
  nextdropdown: any;
  resourceId: string = null;
  svcMapping: any;
  additionalFilter: boolean = false;
  reset3 = false;
  reset = false
  cloneListofValue: any
  clone: any
  showNoRecords: boolean;
  serviceNotResponded: boolean;
  billNumber: any
  reconciliationFlag: boolean = true;
  generateInvoiceFlag: boolean = true;
  formSubmitted: boolean = false;
  fromDateFlag: boolean = false
  serviceId: any = [];
  permissionFlag: boolean = false
  constructor(private generateInvoiceModalService: GenerateInvoiceModalService, private generateModalService: GenerateInvoiceModalService, private translate: TranslateService, private loaderService: LoaderService, public filterComponent: FiltersComponent, private datepipe: DatePipe, private service: RestApiService, private route: ActivatedRoute, private restApiService: RestApiService) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId;
    })
  }

  searchFilters: GenerateInvoiceFilterModel = new GenerateInvoiceFilterModel();

  ngOnInit() {
    const cloneListofValuepmt = new BehaviorSubject<any>(this.filterComponent.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone

    let permission: any[]
    if (this.pageConfig.permissions.length <= 1) {
      permission = this.pageConfig.permissions
      if (permission[0].type == 'View') {
        this.permissionFlag = true;
      }
    } else if (this.pageConfig.permissions.length > 1) {
      this.permissionFlag = false;
    }
    this.generateInvoiceModalService.clearFilter.subscribe(flag => {
      if (flag == true) {
        this.resetForm();
      }
    })
  }

  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }
  getBizServicesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.selectBizService),
      primaryKey: dropdown.serviceId,
      labelKey: dropdown.serviceName,
      classes: 'custom-class',
      singleSelection: true,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getServiceTypesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      singleSelection: true,
      text: this.translate.instant(dropdown.selectServiceTypes),
      primaryKey: dropdown.serviceTypeId,
      labelKey: dropdown.serviceTypeName,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getBillCategorySetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      singleSelection: true,
      text: this.translate.instant(dropdown.allBillCategory),
      primaryKey: dropdown.value,
      labelKey: dropdown.name,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getIdentityTypesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      singleSelection: true,
      text: this.translate.instant(dropdown.allIdentityTypes),
      primaryKey: dropdown.value,
      labelKey: dropdown.name,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  search() {
    this.reset3 = false;
    this.reset = false
    if (this.searchFilters.serviceId == null || this.searchFilters.serviceId == '') {
      let doc = document.getElementsByClassName('redBorderBizService')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid red";
      }
    }
    if (this.searchFilters.serviceTypeId == null || this.searchFilters.serviceTypeId == '') {
      let doc = document.getElementsByClassName('redBorderServiceType')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid red";
      }
    }
    if (this.searchFilters.billCategory == null || this.searchFilters.billCategory == '') {
      let doc = document.getElementsByClassName('redBorderBillCategory')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid red";
      }
    }
    if (this.searchFilters.officialIdType == null || this.searchFilters.officialIdType == '') {
      let doc = document.getElementsByClassName('redBorderOfficialId')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid red";
      }
    }
    if (this.searchFilters.expiryTimestamp == null || this.searchFilters.expiryTimestamp == '') {
      this.fromDateFlag = true
      this.formSubmitted = true
    }
    if (this.searchFilters.GFSCode == null || this.searchFilters.GFSCode == '' || this.searchFilters.officialId == null || this.searchFilters.officialId == '' || this.searchFilters.amount == null || this.searchFilters.amount == '') {
      this.formSubmitted = true
      return;
    }
    else {
      this.additionalFilter = true;

      this.filterComponent.headerConfig['page-number'] = String(1);
      let preparedFilters: GenerateInvoiceFilterModel = deepClone(this.searchFilters);
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => o == 'organizationId' ? d['orgId'] : d[o] || d['name']);
        }
        if (o.indexOf('Date') > -1) {
          let now = new Date(preparedFilters[o]);
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          preparedFilters[o] = now.toISOString().substring(0, 19);
        }
      })
      //console.log('pre',preparedFilters)
      let url = this.operationsPageInfo.url

      let filter = {
        serviceId: this.searchFilters.serviceId[0].serviceId,
        serviceTypeId: this.searchFilters.serviceTypeId[0].serviceTypeId,
        billCategory: this.searchFilters.billCategory[0].value,
        GFSCode: this.searchFilters.GFSCode,
        descriptionEn: this.searchFilters.descriptionEn,
        descriptionAr: this.searchFilters.descriptionAr,
        officialIdType: this.searchFilters.officialIdType[0].value,
        officialId: this.searchFilters.officialId,
        amount: this.searchFilters.amount,
        expiryTimestamp: this.searchFilters.expiryTimestamp
      }
      let filters = { GenerateInvoicesRq: filter };
      //  console.log('preparedFilter',filters)

      filters?.GenerateInvoicesRq?.descriptionEn == '' ? delete filters?.GenerateInvoicesRq?.descriptionEn : '';
      filters?.GenerateInvoicesRq?.descriptionAr == '' ? delete filters?.GenerateInvoicesRq?.descriptionAr : '';
      // this.filterComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
      this.loaderService.show();
      this.restApiService.getTableData(url, filters, this.headerConfig).subscribe(data => {
        // console.log('data', data)
        if (!data.body) {
          this.billNumber = null
          this.showNoRecords = true;
        } else {
          this.serviceNotResponded = false;
          this.billNumber = data.body?.GenerateInvoicesRs.billNumber
          // console.log('billNumber', this.billNumber);
          this.generateModalService.open(this.billNumber)
          this.loaderService.hide();
        }
      },
        err => {
          if (err) {
            this.loaderService.hide();
            this.billNumber = null;
            this.showNoRecords = false;
            this.serviceNotResponded = true;
          }
        })
    }

  }

  //dropdowns change values
  onServiceChange(e) {
    this.bizServiceId = this.searchFilters.serviceId
    let serviceId = []
    if (this.bizServiceId.length > 0) {
      this.bizServiceId.forEach(element1 => {
        serviceId.push(element1.serviceId)
      });
    }
    else {
      serviceId = this.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
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

      this.filterComponent.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes;
      this.filterComponent.pageConfig.listOfValues.billCategory = this.nextdropdown.billCategory;
      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.serviceTypeId = null;
        this.searchFilters.billCategory = null;
        this.searchFilters.GFSCode = null;
      }
    })
  }

  updateBillCategory(serviceTypeId) {
    let filterServiceType = []
    if (this.nextdropdown != null && serviceTypeId != null) {
      this.searchFilters.billCategory = null;
      this.searchFilters.GFSCode = null;
      this.nextdropdown.billCategory.forEach(key => {
        if (serviceTypeId[0].serviceTypeId == key.serviceTypeId) {
          filterServiceType.push(key)
          this.filterComponent.pageConfig.listOfValues.billCategory = filterServiceType
          // console.log('billCategory', this.filterComponent.pageConfig.listOfValues.billCategory)
        }
      })
    } else if (this.nextdropdown == null) {
      this.filterComponent.pageConfig.listOfValues.billCategory = this.filterComponent.pageConfig.listOfValues.billCategory
    }

  }

  event(e, event) {
    //  console.log('e',e,'-----------','event',event)
    if (e == 'serviceId' && event != null && event.length > 0 || e == true) {
      let doc = document.getElementsByClassName('redBorderBizService')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid #d2d3db";
      }
    }
    if (e == 'serviceTypeId' && event != null && event.length > 0 || e == true) {
      let doc = document.getElementsByClassName('redBorderServiceType')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid #d2d3db";
      }
    }
    if (e == 'billCategory' && event != null && event.length > 0 || e == true) {
      let doc = document.getElementsByClassName('redBorderBillCategory')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid #d2d3db";
      }
    }
    if (e == 'officialIdType' && event != null && event.length > 0 || e == true) {
      let doc = document.getElementsByClassName('redBorderOfficialId')
      let collection = (doc[0].getElementsByClassName('cuppa-dropdown') as HTMLCollectionOf<HTMLElement>)
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.border = "1px solid #d2d3db";
      }
    }
  }


  gfscode(e) {
    if (this.searchFilters.billCategory != null) {
      this.pageConfig.listOfValues.billCategory.forEach(key => {
        if (key.value == e[0].value) {
          this.searchFilters.GFSCode = key.GFSCode
        }
      })
    }
  }

  resetForm() {
    this.searchFilters = new GenerateInvoiceFilterModel();
    this.filterComponent.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.filterComponent.pageConfig.listOfValues.billCategory = this.clone._value.billCategory
    this.reset3 = true;
    this.reset = true
    this.billNumber = null
    this.showNoRecords = false;
    this.serviceNotResponded = false;
    this.fromDateFlag = false;
    this.additionalFilter = false
    this.filterComponent.applyFiltersEvent.emit({ reset: true });
    this.event(this.reset, this.reset3)

  }


  bsValueChange(data: any) {
    data = this.datepipe.transform(data, keyWords.fromDateFromat)
    this.searchFilters.expiryTimestamp = data;
  }

  greaterFLagEn: boolean = false
  onKeyPress(val: any) {
    if (val.length == 32) {
      this.greaterFLagEn = true
    } else {
      this.greaterFLagEn = false
    }
  }

  greaterFLagAr: boolean = false
  onKeyPresss(val: any) {
    if (val.length == 32) {
      this.greaterFLagAr = true
    } else {
      this.greaterFLagAr = false
    }
  }

}
