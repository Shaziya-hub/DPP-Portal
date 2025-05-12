import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { FiltersComponent } from '../filters.component';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { changeDateRange, deepClone } from 'src/app/shared/utils';
import { PayrollFilter } from 'src/app/model/payrollFilter.model';

@Component({
  selector: 'app-payrolls',
  templateUrl: './payrolls.component.html',
  styleUrls: ['./payrolls.component.scss']
})
export class PayrollsComponent implements OnInit {
  @Input() pageConfig: PageConfig;
  @Input() transactionsPageInfo;
  @Input() cardServiceAttribute;
  @Input() cardAttriute;
  @Input() cardsUrl;
  @Input() searchFilter;
  @Input() dataSource;
  @Input() logVal;

  // Flags
  daterangepickerFlag = false;
  fromdateInputFlag = true;
  todateInputFlag = true;
  additionalFilter = false;
  timeChange = false;
  isFromReset = false;
  isToReset = false;
  isCollapsed = true;
  reset = false;
  reset3 = false;

  // Variables
  landingDateRange: any;
  bsdateRange: any = [];
  latestDateRange = [];
  latestTime = [];

  // Search Filters
  searchFilters: PayrollFilter = new PayrollFilter();

  dropdownSettings = {
    singleSelection: false,
    selectAllText: '',
    unSelectAllText: '',
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: ''
  };

  constructor(
    private translate: TranslateService,
    private service: RestApiService,
    private notificationService: NotificationService,
    public filtersComponent: FiltersComponent,
    dateTimeAdapter: DateTimeAdapter<any>,
    private route: ActivatedRoute,
    public datepipe: DatePipe,
    private sidemenu: SideMenuService,
    private eRef: ElementRef
  ) {
    dateTimeAdapter.setLocale(this.translate.currentLang);
  }

  ngOnInit(): void {
    this.initializeDropdownSettings();
    this.reset3 = false;
    this.landingDateRange = this.pageConfig.customParams.LandingDateRange;
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];

    if (this.logVal === keyWords.backFromLogger) {
          this.setSearchFiltersFromLogger();
          setTimeout(() => {
            this.setSelectedListFromLogger();
          }, 100);
    }
  }

   /*
    Back from logger logic
  */
    private setSearchFiltersFromLogger(): void {
      const searchFilter = this.searchFilter[0];
      if (searchFilter.beneficiaryAccountNumber) {
        this.searchFilters.beneficiaryAccountNumber = searchFilter.beneficiaryAccountNumber;
      }
      if (searchFilter.extSysRefId) {
        this.searchFilters.extSysRefId = searchFilter.extSysRefId;
      }
      if (searchFilter.payrollTransId) {
        this.searchFilters.payrollTransId = searchFilter.payrollTransId;
      }
    }
  
    private setSelectedListFromLogger(): void {
      const searchFilter = this.searchFilter[0];
      if (searchFilter.payrollSrcAccount) {
        this.searchFilters.payrollSrcAccount = this.getSelectedList(searchFilter.payrollSrcAccount, this.pageConfig.listOfValues.payrollSrcAccount);
      }
      if (searchFilter.processStatus) {
        this.searchFilters.processStatus = this.getSelectedList(searchFilter.processStatus, this.pageConfig.listOfValues.payrollStatus);
      }
      if (searchFilter.accrualMonth) {
        this.searchFilters.accrualMonth = this.getSelectedList(searchFilter.accrualMonth, this.pageConfig.listOfValues.payrollAccrualMonth);
      }
    }
  
    private getSelectedList(filterValues: any[], listOfValues: any[]): any[] {
      return listOfValues.filter(el => filterValues.includes(el.value));
    }

  private initializeDropdownSettings(): void {
    this.dropdownSettings.selectAllText = this.translate.instant(dropdown.selectAllText);
    this.dropdownSettings.unSelectAllText = this.translate.instant(dropdown.unSelectAllText);
    this.dropdownSettings.searchPlaceholderText = this.translate.instant(dropdown.search);
  }

  private getDropdownSettings(textKey: string, primaryKey: string, labelKey: string): any {
    const commonSettings = deepClone(this.dropdownSettings);
    const specificSettings = {
      text: this.translate.instant(textKey),
      primaryKey,
      labelKey,
      classes: dropdown.classes
    };
    return Object.assign(commonSettings, specificSettings);
  }

  getSourceAccounts() {
    return this.getDropdownSettings(dropdown.allSourceAccounts, dropdown.value, dropdown.name);
  }

  getProcessStatuses() {
    return this.getDropdownSettings(dropdown.allProcessStatuses, dropdown.value, dropdown.name);
  }

  getAccrualMonths() {
    return this.getDropdownSettings(dropdown.allAccrualMonths, dropdown.value, dropdown.name);
  }

  search() {
    this.cardsUrl = false;
    this.filtersComponent.applyPmtCards.emit(this.cardsUrl);
    this.reset = false;
    this.additionalFilter = true
    //this.filtersComponent.headerConfig['page-number'] = String(1);

    const preparedFilters = this.prepareFilters(deepClone(this.searchFilters));
    this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  private prepareFilters(filters: PayrollFilter): PayrollFilter {
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (Array.isArray(value)) {
        filters[key] = value.map(item => key === 'invoiceType' ? item['value'] : item[key] || item['value']);
      }
      if (key.includes('Date')) {
        const date = new Date(filters[key]);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        filters[key] = date.toISOString().substring(0, 19);
      }
    });
    return filters;
  }

  resetForm() {
    this.cardAttriute = null;
    this.cardServiceAttribute = null;
    this.searchFilters = new PayrollFilter();
    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];
    this.reset3 = true;
   
    if (this.landingDateRange) {
      this.searchFilters.fromDate.setMinutes(this.searchFilters.fromDate.getMinutes() - this.landingDateRange);
    }

    this.bsdateRange = [this.searchFilters.fromDate, this.searchFilters.toDate];
    this.isFromReset = true;
    this.isToReset = true;
    this.filtersComponent.applyFiltersEvent.emit({ reset: true });
  }

  onFromDateChange(data: any) {
    this.searchFilters.fromDate = data;
  }

  onMonthlyChange(data: any) {
    this.searchFilters.toDate = data;
  }

  dateRangeChange(rangedate: any) {
    const [fromDate, toDate] = changeDateRange(
      rangedate,
      this.searchFilters.fromDate,
      this.searchFilters.toDate,
      this.latestDateRange,
      this.latestTime,
      this.timeChange,
      this.datepipe
    );
    this.searchFilters.fromDate = fromDate;
    this.searchFilters.toDate = toDate;
  }
}
