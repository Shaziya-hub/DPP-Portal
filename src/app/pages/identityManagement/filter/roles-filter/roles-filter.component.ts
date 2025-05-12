import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { identityMngFilter } from "src/app/model/identityManagement.model";
import { PageConfig } from "src/app/model/page-config";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { dropdown, keyWords } from "src/app/shared/constant";
import { deepClone, isUserHasAccess } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";

@Component({
  selector: 'roles-filter',
  templateUrl: './roles-filter.component.html',
  styleUrls: ['roles-filter.component.scss']
})

export class RolesFilterComponent {
  @Input() pageConfig: PageConfig;
  @Input() identitymanagementPageInfo;
  @Input() dataSource

  gridFlag: boolean = false;
  searchFilters = {

    roleId: null,
    roleStatus: null

  }
  isUserHasAccess: any;

  dropdownSettings = {
    singleSelection: false,
    text: this.translate.instant(dropdown.roleName),
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    primaryKey: dropdown.orgIdPrimaryKey,
    labelKey: dropdown.orgNameLabelKey,
    enableSearchFilter: true,
    searchPlaceholderText: this.translate.instant(dropdown.search),
    badgeShowLimit: 1,
  }

  getRolesSettings() {

    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allRoles),
      primaryKey: dropdown.roleIdPrimaryKey,
      labelKey: dropdown.roleNameLabelKey,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getRolesStatus() {

    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      text: this.translate.instant(dropdown.allStatuses),
      primaryKey: dropdown.primaryKey,
      labelKey: dropdown.labelKey,
    }
    return Object.assign(commonSettings, specificSetting);

  }
  constructor(private translate: TranslateService, public filterComponent: FiltersComponent, private router: Router, private rowDetailService: RowDetailsService, private activateRoute: ActivatedRoute) {

  }

  ngOnInit() {
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
   
    let state = history.state
    console.log('state.fileters',state.filters)
   // if (state.filters) {

      //this.gridFlag = state?.gridFlag
      //this.searchFilters.roleId = this.pageConfig.listOfValues.roles
    //this.searchFilters.roleStatus = this.pageConfig.listOfValues.roleStatus
    this.search()
   // }
  }

  filters: any
  search() {
    // if(this.searchFilters.roleId==null || this.searchFilters.roleStatus==null){
    //   return
    // }
    this.filterComponent.headerConfig[keyWords.pageNumber] = String(1);
    let preparedFilters = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {              //Object.keys returns an array of an object
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {                  //isArray is a method which returns true if it is an array and false if it is not a array
        preparedFilters[o] = obj.map(d => o == dropdown.roleStatus ? d[dropdown.primaryKey] : d[o] || d[dropdown.labelKey]);
      }
    })
    /*
    when we select anything from list, it passes the whole array and not the selected one
    Pass the other lists in request too, if anything selected from filters, don't pass unselected lists as blank
    */
    if ((preparedFilters.roleId == null || preparedFilters.roleId == undefined || preparedFilters.roleId.length == 0 || preparedFilters.roleId.length == '') &&
      (preparedFilters.roleStatus == null || preparedFilters.roleStatus == undefined || preparedFilters.roleStatus.length == 0 || preparedFilters.roleStatus.length == '')
    ) {
      preparedFilters.roleId = this.filterComponent.pageConfig.listOfValues.roles.map(o => o.roleId)
      preparedFilters.roleStatus = this.filterComponent.pageConfig.listOfValues.roleStatus.map(o => o.value)

    }else if ((preparedFilters.roleId != null || preparedFilters.roleId != undefined || preparedFilters.roleId?.length != 0 || preparedFilters.roleId?.length != '') &&
          (preparedFilters.roleStatus == null || preparedFilters.roleStatus == undefined || preparedFilters.roleStatus.length == 0 || preparedFilters.roleStatus.length == '')) {
          preparedFilters.roleStatus = this.filterComponent.pageConfig.listOfValues.roleStatus.map(o => o.value)

    }else  if ((preparedFilters.roleId == null || preparedFilters.roleId == undefined || preparedFilters.roleId.length == 0 || preparedFilters.roleId.length == '') &&
        (preparedFilters.roleStatus != null || preparedFilters.roleStatus != undefined || preparedFilters.roleStatus.length != 0 || preparedFilters.roleStatus.length != '')) {
        preparedFilters.roleId = this.filterComponent.pageConfig.listOfValues.roles.map(o => o.roleId)
  }

    this.filters = { SearchFilters: preparedFilters }
    this.filterComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  addRoles() {

    this.rowDetailService.setRoleRowDetail('')
    let pageId;
    this.activateRoute?.queryParams?.subscribe(data => pageId = data.pageId)
    this.router.navigate([keyWords.identityRolesDetailsUrl], { queryParams: { pageId: pageId }, state: { error: false, filters: this.filters } })
  }

}
