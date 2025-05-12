import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { DxDataGridComponent } from "devextreme-angular";
import { ConfigFilter } from "src/app/model/configuration-filter.model";
import { PageConfig } from "src/app/model/page-config";
import { RestApiService } from "src/app/services/rest-api.service";
import { ApiPaths, deepClone } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";
import { BehaviorSubject } from 'rxjs';
import { dropdown, keyWords } from "src/app/shared/constant";


@Component({
  selector: 'processor-config',
  templateUrl: './processorconfig-filter.component.html'
})
export class ProcessorConfigComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  @Input() pageConfig: PageConfig;
  @Input() configurationsPageInfo;
  @Input() dataSource

  columns = [];
  show: boolean;
  isCollapsed: boolean;
  reset: boolean = false
  orgFlag: boolean = false
  serviceFlag: boolean = false
  userId: string = null;
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any
  formSubmit: boolean = false


  searchFilters = {
    serviceId: null,
    pmtMethodId: null,
    serviceTypeId: null
  }


  getBizServicesSetting = {
    text: this.translate.instant(dropdown.selectBizService),
  }

  paymentDropdownSetting = {
    text: this.translate.instant(dropdown.allPaymentMethods),
  }

  serviceTypeDropdownSetting = {
    text: this.translate.instant(dropdown.allServiceTypes),
  }

  constructor(private translate: TranslateService, private service: RestApiService, public processFilter: FiltersComponent, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {

    const cloneListofValuepmt = new BehaviorSubject<any>(this.processFilter.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone

  }

  onChangeValue() {
    if (this.searchFilters.serviceId == null) {
      this.serviceFlag = true
      this.orgFlag = false
    }
    else {
      this.serviceFlag = false

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

      this.processFilter.pageConfig.listOfValues.pmtMethods = this.nextdropdown.pmtMethods
      this.processFilter.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.pmtMethodId = null;
        this.searchFilters.serviceTypeId = null;
      }
    })

  }


  search() {
    this.reset = false
    this.formSubmit = true
    if (this.searchFilters.serviceId == null) {
      return
    }
    else {

      this.processFilter.headerConfig[keyWords.pageNumber] = String(1);
      let preparedFilters = deepClone(this.searchFilters);
      Object.keys(preparedFilters).forEach(o => {
        let obj = preparedFilters[o];
        if (Array.isArray(obj)) {
          preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
        }

      })
      this.processFilter.applyFiltersEvent.emit({ SearchFilters: preparedFilters });

    }
  }



  resetForm() {
    this.searchFilters = {
      serviceId: null,
      pmtMethodId: null,
      serviceTypeId: null
    }
    this.formSubmit = false
    this.processFilter.pageConfig.listOfValues.pmtMethods = this.clone._value.pmtMethods
    this.processFilter.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.isCollapsed = true;
    this.nextdropdown = !this.nextdropdown
    this.processFilter.applyFiltersEvent.emit({ reset: true });
    this.reset = true
    this.orgFlag = false
    this.serviceFlag = false
  }


}