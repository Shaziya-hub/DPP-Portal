import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { deepClone, isUserHasAccess } from 'src/app/shared/utils';
import { DataGridComponent } from '../../data-grid/data-grid.component';
import { ParametersModalService } from '../../parameters-modal/parameters-modal.service';
import { ConfigFilter } from 'src/app/model/configuration-filter.model';
import { FiltersComponent } from '../filters.component';
import { dropdown, keyWords } from 'src/app/shared/constant';

@Component({
  selector: 'parameters',
  templateUrl: './parameters-filter.component.html',
  styleUrls: ['./parameters-filter.component.scss']
})
export class ParametersFilterComponent implements OnInit {

  @ViewChild('dataGrid') dataGrid: DataGridComponent;

  @Input() pageConfig: PageConfig;
  @Input() configurationsPageInfo;
  @Input() headerConfig;
  @Input() dataSource
  show: boolean = true;
  showNoRecords: boolean;
  columns = [];
  isCollapsed: boolean = true
  orgflag = false;
  serviceFlag: boolean = false
  searchFlag: boolean = false
  reset: boolean = false
  formSubmit: boolean = false

  searchFilters = {
    serviceId: null,
    search: null
  };

  pageSettings = {
    responseCount: 0,
    totalRecordsCount: 0,
    ttlPagesCnt: 0
  };

  isUserHasAccess: any;
  constructor(private translate: TranslateService, private processFilter: FiltersComponent, private parametersModalService: ParametersModalService) { }

  ngOnInit(): void {
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);

  }

  getBizServicesSetting() {
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.common_parameters),
      primaryKey: dropdown.serviceIdPrimaryKey,
      labelKey: dropdown.serviceNameLabelkey,
      //disabled: this.searchFilters.organizationId ? false : true,
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      enableSearchFilter: true,
      badgeShowLimit: 1,
      searchPlaceholderText: this.translate.instant(dropdown.search),
      //classes:this.serviceFlag ?'validation':''
      // classes:this.serviceFlag || this.formSubmit==true && this.searchFilters.serviceId==null? dropdown.validation:this.searchFilters.serviceId != null?dropdown.classes:''
    }
    return Object.assign(specificSetting);
  }

  onChangeValue() {
    if (this.searchFilters.serviceId == null || this.searchFilters.serviceId == undefined || this.searchFilters.serviceId.length == 0 || this.searchFilters.serviceId.length == '') {
      this.serviceFlag = true
      this.reset = false
    }

    else {
      this.serviceFlag = false
      //this.orgFlag=false
    }
  }


  search() {
    this.headerConfig=keyWords.config;
    this.reset = false
    this.formSubmit = true
    // if(this.searchFilters.serviceId==null || this.searchFilters.serviceId==undefined || this.searchFilters.serviceId.length==0 || this.searchFilters.serviceId.length==''){
    //   return
    // }
    // else{


    this.processFilter.headerConfig[keyWords.pageNumber] = String(1);
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

   // this.getUpdatedValuesForAllSelections(preparedFilters);
    // preparedFilters.organizationId= preparedFilters.organizationId.toString()   //It will change the array into string, becuz it is required in our search filter
    this.processFilter.applyFiltersEvent.emit({ SearchFilters: preparedFilters });

    // }
  }



  getUpdatedValuesForAllSelections(preparedFilters: ConfigFilter) {

    if (preparedFilters.serviceId == null) {
      preparedFilters.serviceId = this.processFilter.pageConfig?.listOfValues.bizServices.map(o => o.serviceId)
    }

  }
  onDeSelect() {
    this.searchFilters.serviceId.length = 0;
  }

  //Completed Form is being reset
  resetForm() {
    this.searchFilters = {
      serviceId: null,
      search: null
    }

    this.isCollapsed = true;
    this.processFilter.applyFiltersEvent.emit({ reset: true })
    this.reset = true
    this.orgflag = false
    this.serviceFlag = false
    this.formSubmit = false
  }

  add() {
    this.headerConfig=keyWords.initiateRefundConfig;
    this.parametersModalService.open(this.pageConfig, null, this.headerConfig);

  }
}
