import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { NotificationService } from 'src/app/services/notification.service';
import { FiltersComponent } from '../filters.component';
import { PageConfig } from 'src/app/model/page-config';
import { PayoutsTransFilter } from 'src/app/model/payoutsTransFilter.model';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { changeDateRange, deepClone } from 'src/app/shared/utils';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payouts-filter',
  templateUrl: './payouts-filter.component.html',
  styleUrls: ['./payouts-filter.component.scss']
})
export class PayoutsFilterComponent implements OnInit{

  @Input() pageConfig: PageConfig;
  @Input() transactionsPageInfo
  @Input() searchFilter: any;
  @Input() dataSource;
  @Input() logVal;
    

  //Flags
  daterangepickerFlag: boolean = false;
  additionalFilter: boolean = false;
  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  timeChange: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false
  isCollapsed: boolean = true;
  reset: boolean = false;
  reset3: boolean = false;
  reset2: boolean = false;

  landingDateRange: any
  latestDateRange = [];
  latestTime = []
  bsdateRange: any = []
  dateRange: Date[]
  selectedListPayoutStatus = [];
  selectedListPayoutPayer = [];

  resourceId: string = null;
  searchFilters: PayoutsTransFilter = new PayoutsTransFilter();

  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: this.translate.instant(dropdown.search)
  }  

  constructor(dateTimeAdapter: DateTimeAdapter<any>,private translate: TranslateService, private notificationService: NotificationService, public filtersComponent: FiltersComponent, public datepipe: DatePipe, private route: ActivatedRoute) {
    dateTimeAdapter.setLocale(translate.defaultLang)
   }

   ngOnInit(): void {
    this.reset3 = false;
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange;
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];

    if (this.logVal === keyWords.backFromLogger) {
        this.setSearchFiltersFromLogger();
        setTimeout(() => {
            this.setSelectedListFromLogger();
        }, 100);
    }

    this.additionalFilter = false;

    this.route.queryParams.subscribe(params => {
        this.resourceId = params.pageId;
    });

    const state = history.state;
    this.searchFilters.fromDate = state?.fromDate;
    this.searchFilters.toDate = state?.toDate;
}

 setSearchFiltersFromLogger(): void {
    const searchFilter = this.searchFilter[0];
    if (searchFilter.payeeAccountNum) {
        this.searchFilters.payeeAccountNum = searchFilter.payeeAccountNum;
    }
    if (searchFilter.extPrimaryId) {
        this.searchFilters.extPrimaryId = searchFilter.extPrimaryId;
    }
    if (searchFilter.extRefKey) {
        this.searchFilters.extRefKey = searchFilter.extRefKey;
    }
}

 setSelectedListFromLogger(): void {
    const searchFilter = this.searchFilter[0];
    if (searchFilter.payoutStatus) {
        this.selectedListPayoutStatus = this.getSelectedList(searchFilter.payoutStatus, this.pageConfig.listOfValues.payoutStatus);
        this.searchFilters.payoutStatus = this.selectedListPayoutStatus;
    }
    if (searchFilter.payerId) {
        this.selectedListPayoutPayer = this.getSelectedList(searchFilter.payerId, this.pageConfig.listOfValues.payoutPayer);
        this.searchFilters.payerId = this.selectedListPayoutPayer;
    }
}

 getSelectedList(filterValues: any[], listOfValues: any[]): any[] {
    return listOfValues.filter(el => filterValues.includes(el.value));
}

  getPayoutStatus() {
      let commonSettings = deepClone(this.dropdownSettings);
      let specificSetting = {
        text: this.translate.instant(dropdown.payoutStatus),
        primaryKey: dropdown.value,
        labelKey: dropdown.name,
        classes: dropdown.classes,
      }
      return Object.assign(commonSettings, specificSetting);
  }

  getPayerAccount() {
      let commonSettings = deepClone(this.dropdownSettings);
      let specificSetting = {
        text: this.translate.instant(dropdown.payerAccount),
        primaryKey: dropdown.value,
        labelKey: dropdown.name,
        classes: dropdown.classes,
      }
      return Object.assign(commonSettings, specificSetting);
  }


  search() {
    this.additionalFilter = true;
    this.reset = false
    this.filtersComponent.headerConfig['page-number'] = String(1);
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
    })

    let keys = Object.keys(this.searchFilters);
    this.isCollapsed = keys.length - 1 == keys.indexOf("toDate");

    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  resetForm() {
    this.reset = true;
    this.reset2 = true;
    this.reset3 = true;
    this.additionalFilter = false
    this.searchFilters = new PayoutsTransFilter();
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange)
    }
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate]
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
   
  }


    dateRangeChange(rangedate) {
      let utilFun = changeDateRange(rangedate, this.searchFilters.fromDate, this.searchFilters.toDate, this.latestDateRange, this.latestTime, this.timeChange, this.datepipe)
      this.searchFilters.fromDate = utilFun[0];
      this.searchFilters.toDate = utilFun[1];
    }

}
