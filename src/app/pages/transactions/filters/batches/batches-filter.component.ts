import { Component, Input, OnInit, HostListener, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { changeDateRange, dateModalPosition, deepClone, getUniqueData } from '../../../../shared/utils';
import { FiltersComponent } from '../filters.component';
import { BatchTransFilter } from 'src/app/model/batchTransFilter.model';
import { DatePipe } from '@angular/common';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown, keyWords } from 'src/app/shared/constant';

@Component({
  selector: 'batches-filter',
  templateUrl: './batches-filter.component.html',
  styleUrls: ['./batches-filter.component.scss']
})
export class BatchesFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() logVal;
  @Input() searchFilter: any;

  isCollapsed: boolean = true;
  onDateClick = dateModalPosition;
  getUniqData: any = getUniqueData;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset3: boolean = false;
  reset2: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false
  bsdateRange = []
  selectedList = []
  additionalFilter: boolean = false;
  landingDateRange: any

  searchFilters: BatchTransFilter = new BatchTransFilter();

  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }

  constructor(private translate: TranslateService, public filtersComponent: FiltersComponent, dateTimeAdapter: DateTimeAdapter<any>, public datepipe: DatePipe) {
    dateTimeAdapter.setLocale(translate.defaultLang)
  }

  ngOnInit(): void {
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
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

  search() {
    this.additionalFilter = true;
    this.reset = false
   // this.filtersComponent.headerConfig['page-number'] = String(1);
    let preparedFilters: BatchTransFilter = deepClone(this.searchFilters);
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
    })
    // Added intermediate call to a function which will return all the 
    // list values as selected if nothing selected by user in the dropdown
    this.getUpdatedValuesForAllSelections(preparedFilters);
    preparedFilters?.batchId == "" || preparedFilters?.batchId == undefined || preparedFilters.batchId == null ? delete preparedFilters.batchId : '';
    //logic to close advanced filters if none of the fields have value
    let keys = Object.keys(this.searchFilters);
    this.isCollapsed = keys.length - 1 == keys.indexOf("toDate");

    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(preparedFilters: BatchTransFilter) {

    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }

  }

  resetForm() {
    this.cardAttriute = null
    this.additionalFilter = false
    this.searchFilters = new BatchTransFilter();
    this.isCollapsed = true;
    this.reset = true;
    this.reset3 = true
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
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

}
