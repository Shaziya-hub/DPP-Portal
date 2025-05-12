import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import { FiltersModel } from 'src/app/model/filters.model';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { keyWords } from 'src/app/shared/constant';
import { ApiPaths, constantField, deepClone, deleteFilters, validateDate } from 'src/app/shared/utils';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  pageConfig = null;
  dataSource = null;
  selectableColumns: any = []
  pageSettings: any
  headerConfig: any;
  inboxPageInfo: any;
  responseCount: any;
  showNoRecords: boolean;
  serviceNotResponded: boolean;
  fromDate: Date;
  toDate: Date;
  searchFilter: any;
  config = keyWords.config;
  filters: FiltersModel = new FiltersModel();

  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private translate: TranslateService, private notificationService: NotificationService, private columnService: ColumnSettingsModalService, private datepipe: DatePipe) {
    this.columnService.reportType = null
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.pageConfig = data.config.pageConfig;
      this.getPageAPIInfo();
    })
    this.headerConfig = keyWords.config
    this.pageSettings = keyWords.pageSettings
  }

  getPageAPIInfo() {
    let obj = {
      url: null,
      downloadName: null,
      attributeName: null,
      pageName: null,
      groupingEnabled: true,
      masterColumn: null
    }

    if (location.href.indexOf(keyWords.inboxUrl) > -1) {
      obj.url = ApiPaths.getManualRefunds;
      obj.pageName = keyWords.inboxPageName;
      obj.attributeName = keyWords.inboxAttriName;
    }
    this.inboxPageInfo = obj;
  }

  applyFilters(filter: any) { //console.log('filters',filter)

    if (filter.reset) {
      this.dataSource = null;
      this.showNoRecords = false;
      this.serviceNotResponded = false;
      return;
    }
    let filters = deleteFilters(filter)


    if (filters?.SearchFilters?.fromDate && filters?.SearchFilters?.toDate) {
      let days = validateDate(filters, this.fromDate, this.toDate, this.datepipe) + 1;

      if (days != null && days > +this.pageConfig?.customParams?.SearchDateRange) {
        this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + keyWords.days));
        return;
      }
      if (days != null && days < 0) {
        this.notificationService.showError(this.translate.instant(keyWords.maxDateRange));
        return;
      }

    }

    this.filters = deepClone(filters);
    this.searchFilter = filters?.SearchFilters;
    let url = this.inboxPageInfo.url;

    this.loaderService.show();

    this.restApiService.getTableData(url, filters, this.config).subscribe(data => {//console.log('data',data)
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
        this.serviceNotResponded = false;
      } else {
        this.showNoRecords = false;
        this.serviceNotResponded = false;
        this.dataSource = data.body[this.inboxPageInfo.attributeName];

      }

      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
        this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+25;//+data.headers.get('response-count')
        this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt);
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt);
      }
      this.loaderService.hide();
    },

      err => {
        if (err) {
          // this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
          this.loaderService.hide();
          this.dataSource = null;
          this.showNoRecords = false;
          this.serviceNotResponded = true;
        }
      });
  }

}
