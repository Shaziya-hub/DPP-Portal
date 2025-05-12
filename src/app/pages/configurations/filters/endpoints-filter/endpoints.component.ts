import { Component, Input, ViewChild, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from "src/app/model/page-config";
import { LoaderService } from "src/app/services/loader.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { ApiPaths, deepClone } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";
import { BehaviorSubject } from 'rxjs';
import { ConfigFilter } from "src/app/model/configuration-filter.model";
import { dropdown, keyWords } from "src/app/shared/constant";

@Component({
  selector: 'endpoints-filter',
  templateUrl: './endpoints-filter.component.html'
})

export class EndPointsComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() configurationsPageInfo;
  @Input() dataSource
  isCollapsed: boolean = true
  reset: boolean = false
  orgFlag: boolean = false
  serviceFlag: boolean = false
  formSubmit: boolean = false
  resourceId: string = null;
  svcMapping: any
  nextdropdown: any
  bizServiceId: any = [];
  cloneListofValue: any
  clone: any



  // constructor(private translate:TranslateService, public filter:FiltersComponent){}
  searchFilters = {
    serviceId: null,
    serviceTypeId: null,
    search: null

  }
  constructor(private translate: TranslateService, private service: RestApiService, public filter: FiltersComponent, private route: ActivatedRoute, private loaderService: LoaderService) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  ngOnInit(): void {

    const cloneListofValuepmt = new BehaviorSubject<any>(this.filter.pageConfig.listOfValues)
    this.cloneListofValue = cloneListofValuepmt
    const clone = deepClone(this.cloneListofValue)
    this.clone = clone

  }



  getBizServicesSetting() {

    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.common_enpoints),
      primaryKey: dropdown.serviceIdPrimaryKey,
      labelKey: dropdown.serviceNameLabelkey,
      //disabled: this.searchFilters.organizationId ? false : true,
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      enableSearchFilter: true,
      badgeShowLimit: 1,
      searchPlaceholderText: this.translate.instant(dropdown.search),
      //classes:this.serviceFlag || this.formSubmit==true && this.searchFilters.serviceId==null? dropdown.validation:this.searchFilters.serviceId != null?dropdown.classes:''

    }
    return Object.assign(specificSetting);
  }

  getServiceTypesSetting() {

    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.allServiceTypes),
      primaryKey: dropdown.serviceTypeId,
      labelKey: dropdown.serviceTypeName,
      //  disabled: this.searchFilters.organizationId ? false : true,
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      enableSearchFilter: true,
      badgeShowLimit: 1,
      searchPlaceholderText: this.translate.instant(dropdown.search),
      classes: dropdown.classes
    }
    return Object.assign(specificSetting);
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
      serviceId = this.filter.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
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
    this.loaderService.show();
    this.service.getSvcMappings(url, filters).subscribe(data => {
      this.nextdropdown = data.body[this.svcMapping.attributeName];

      this.filter.pageConfig.listOfValues.serviceTypes = this.nextdropdown.serviceTypes

      //if serviceid is seleted oother dropdown sould get reset
      if (this.nextdropdown != null && this.nextdropdown != undefined) {
        this.searchFilters.serviceTypeId = [];
      }
    })
    this.loaderService.hide();
  }

  onChangeValue() {
    if (this.searchFilters.serviceId == null || this.searchFilters.serviceId == undefined || this.searchFilters.serviceId == "") {
      this.serviceFlag = true
      this.orgFlag = false
      this.reset = false
    }

    else {
      this.serviceFlag = false
      //this.orgFlag=false
    }
  }
  search() {
    this.reset = false
    this.formSubmit = true
    // if(this.searchFilters.serviceId==null || this.searchFilters.serviceId==undefined || this.searchFilters.serviceId==''){
    //   return
    // }
    // else{

    this.filter.headerConfig[keyWords.pageNumber] = String(1);
    let preparedFilters = deepClone(this.searchFilters);
    // if(!preparedFilters.serviceId){
    //   return
    // }
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
      }

    })
    //this.getUpdatedValuesForAllSelections(preparedFilters);
    // preparedFilters.organizationId=preparedFilters.organizationId.toString()    //to convert an array into string
    this.filter.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
    // }  


  }

  getUpdatedValuesForAllSelections(preparedFilters: ConfigFilter) {
    if (preparedFilters.serviceId == null) {
      preparedFilters.serviceId = this.filter.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
  }

  resetForm() {
    this.searchFilters = {
      serviceId: null,
      serviceTypeId: null,
      search: null
    }
    this.filter.pageConfig.listOfValues.serviceTypes = this.clone._value.serviceTypes
    this.isCollapsed = true;
    this.filter.applyFiltersEvent.emit({ reset: true });
    this.reset = true;
    this.orgFlag = false;
    this.serviceFlag = false;
    this.formSubmit = false
  }

}
