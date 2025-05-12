import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { identityMngFilter } from "src/app/model/identityManagement.model";
import { PageConfig } from "src/app/model/page-config";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { dropdown, keyWords } from "src/app/shared/constant";
import { deepClone, isUserHasAccess } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";
import { RestApiService } from "src/app/services/rest-api.service";

@Component({
  selector: 'users-filter',
  templateUrl: './users-filter.component.html',
  styleUrls: ['users-filter.component.scss']
})

export class UsersFilterComponent {
  @Input() pageConfig: PageConfig;
  @Input() identitymanagementPageInfo;
  @Input() gridOpen: boolean;
  @Input() dataSource


  pageDetails;
  searchFilters = {
    serviceId: null
  }
  orgFlag: boolean = false
  serviceFlag: boolean = false
  isUserHasAccess: any
  dropdownSettings = {
    singleSelection: false,
    text: this.translate.instant(dropdown.allOrganizations),
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    primaryKey: dropdown.orgIdPrimaryKey,
    labelKey: dropdown.orgNameLabelKey,
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }

  //Business Service Dropdown for multiselect
  getBizServicesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allBizService),
      primaryKey: dropdown.serviceIdPrimaryKey,
      labelKey: dropdown.serviceNameLabelkey,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  constructor(private translate: TranslateService, public filterComponent: FiltersComponent, private router: Router, private rowDetailService: RowDetailsService, private activateRoute: ActivatedRoute, private restApiService: RestApiService) {

  }
  ngOnInit() {
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
    //this.searchFilters.organizationId = this.pageConfig?.listOfValues?.organizations
    //this.searchFilters.serviceId = this.pageConfig?.listOfValues?.bizServices
    this.search()
  }

  search() {

    this.filterComponent.headerConfig[keyWords.pageNumber] = String(1);
    let preparedFilters = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {              //Object.keys returns an array of an object
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {                  //isArray is a method which returns true if it is an array and false if it is not a array
        preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
      }
    })
    /*
    when we select anything from list, it passes the whole array and not the selected one
    */
    if(preparedFilters.serviceId == null || preparedFilters.serviceId == undefined || preparedFilters.serviceId.length == 0 || preparedFilters.serviceId.length == ''){
      preparedFilters.serviceId = this.filterComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
    
    this.filterComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }


  addUser() {
    this.rowDetailService.roleData.next([])
    let pageId;
    this.rowDetailService.setRowDetail('')
    this.activateRoute?.queryParams?.subscribe(data => pageId = data.pageId)
    this.restApiService.setdocument(this.pageConfig)
    this.router.navigate([keyWords.identityUserDetailsUrl], { queryParams: { pageId: pageId } })

  }
}