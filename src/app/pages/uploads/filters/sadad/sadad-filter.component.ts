import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { changeDateRange, deepClone } from 'src/app/shared/utils';
import { DataGridComponent } from "../../data-grid/data-grid.component";
import { ViewChild } from "@angular/core";
import { UploadFilterComponent } from "../upload-filter.component";
import { UploadsFilterModel } from "src/app/model/uploads-filter.model";
import { DatePipe } from '@angular/common';
import { dropdown, keyWords } from "src/app/shared/constant";


@Component({
  selector: 'sadad-filter',
  templateUrl: './sadad-filter.component.html',
  styleUrls: ['./sadad-filter.component.scss']
})
export class SadadFilterComponent implements OnInit {

  @ViewChild('dataGrid') dataGrid: DataGridComponent;

  @Input() pageConfig: PageConfig;//interface
  @Input() uploadsPageInfo; //object of getAPIInfo is passed 
  @Input() dataSource;
  @Output() applyFiltersEvent = new EventEmitter();

  columns = [];
  sadadData = null;
  isCollapsed: boolean = true;
  selectedLang: string = "";
  reset: boolean = false;
  reset2: boolean = false;
  reset3: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  additionalFilter: boolean = false;
  bsdateRange: any = []
  landingDateRange: any

  searchFilters: UploadsFilterModel = new UploadsFilterModel();//we get all the data of our component element from the service

  constructor(private translate: TranslateService, public uploadFilter: UploadFilterComponent, public datepipe: DatePipe) {

  }
  ngOnInit(): void {
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
  }

  dropdownSettings = {
    singleSelection: false,
    text: this.translate.instant(dropdown.allOrganizations),
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    primaryKey: dropdown.orgIdPrimaryKey,
    labelKey: dropdown.orgNameLabelKey,
    enableSearchFilter: true,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }

  settings = {
    singleSelection: false,
    text: this.translate.instant(dropdown.status),
    primaryKey: dropdown.primaryKey,
    labelKey: dropdown.labelKey,
    enableSearchFilter: true,

  }

  getsatusServiceSetting() {
    let commonSettings = deepClone(this.settings);
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.allStatus),
      selectAllText: this.translate.instant(dropdown.selectAllText),
      unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
      primaryKey: dropdown.primaryKey,
      labelKey: dropdown.labelKey,
      badgeShowLimit: 1,
      classes: dropdown.classes,
    }
    return Object.assign(commonSettings, specificSetting);
  }

  getBizServicesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.allBizService),
      primaryKey: dropdown.serviceIdPrimaryKey,
      labelKey: dropdown.serviceNameLabelkey,
      //   disabled: this.searchFilters.organizationId ? false : true,

      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: dropdown.classes,
      searchPlaceholderText: this.translate.instant(dropdown.search)
    }
    return Object.assign(commonSettings, specificSetting);
  }



  resetForm() {
    this.searchFilters = new UploadsFilterModel();
    this.isCollapsed = true;
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true;
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.uploadFilter.applyFiltersEvent.emit({ reset: true });

  }

  onDeSelect() { this.searchFilters.serviceId.length = 0; }



  search() {
    this.reset = false;
    this.uploadFilter.headerConfig[keyWords.pageNumber] = String(1);
    let preparedFilters: UploadsFilterModel = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
      }
      if (o.indexOf(keyWords.date) > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 16) + ':00'
      }

    })
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown
    this.getUpdatedValuesForAllSelections(preparedFilters);
    //logic to close advanced filters if none of the fields have value
    let keys = Object.keys(this.searchFilters);
    this.isCollapsed = keys.length - 1 == keys.indexOf(keyWords.toDate);

    this.uploadFilter.applyFiltersEvent.emit({ SearchFilters: preparedFilters });

  }

  getUpdatedValuesForAllSelections(preparedFilters: UploadsFilterModel) {
    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.uploadFilter.pageConfig?.listOfValues?.bizServices.map(o => o.serviceId)
    } if (this.searchFilters?.processStatus.length > 0) {
      preparedFilters.processStatus = this.searchFilters?.processStatus.map(o => o.value)
    }

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




}
