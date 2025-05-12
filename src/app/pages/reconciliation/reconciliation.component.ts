import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service'; //to make request httpcalls to back-end api and rest end points
import { ApiPaths, constantField, deleteFilters, validateDate } from 'src/app/shared/utils';
import { LoaderService } from '../../services/loader.service';
import { FiltersModel } from "src/app/model/filters.model";
import { deepClone } from "src/app/shared/utils";
import { ReconciliationFilterModel } from "src/app/model/reconciliation-filter.model";
import { DatePipe } from "@angular/common";
import { NotificationService } from "src/app/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import { keyWords } from "src/app/shared/constant";
import { ColumnSettingsModalService } from "src/app/components/column-settings/column-settings-modal.service";


@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss'],

})

export class ReconciliationComponent implements OnInit {

  pageConfig = null;
  reconciliationPageInfo = null;
  dataSource = null;
  summaryDataSource = null
  logsdataSource = null;
  showNoRecords: boolean;
  fromDate: Date;
  toDate: Date;
  responseCount: any
  headerConfig: any;
  pageSettings: any
  selectableColumns: any = []
  dataLoading: boolean = true
  cardsUrl: boolean = false
  reasonPharse: any
  serviceNotResponded: boolean;
  primaykeydata: any
  searchFilter: any;
  filters: FiltersModel = new FiltersModel();

  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private datepipe: DatePipe,
    private notificationService: NotificationService, private translate: TranslateService, private columnService: ColumnSettingsModalService
  ) {
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

  batchId: any
  batchIdEvent(key) {
    this.batchId = key;
  }

  actionKey: any
  actionIdEvent(value) {
    this.actionKey = value
  }

  logVal: any
  LoggerEvent(logVal) {
    //console.log('logVall', logVal)
    this.logVal = logVal
  }

  pmtCards(cardsUrl) {
    this.cardsUrl = cardsUrl
  }

  applyFilters(filter: any) {

    if (filter.reset) {
      this.dataSource = null;
      this.showNoRecords = false;
      this.summaryDataSource = null;
      this.dataLoading = true
      this.serviceNotResponded = false;
      return;
    }
    let filters = deleteFilters(filter)
    if (filters?.SearchFilters?.fromDate && filters?.SearchFilters?.toDate) {
      let days = validateDate(filters, this.fromDate, this.toDate, this.datepipe) + 1;

      if (days != null && days > +this.pageConfig?.customParams?.SearchDateRange) {
        this.notificationService.showError(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + keyWords.days);
        return;
      }
      if (days != null && days < 0) {
        this.notificationService.showError(this.translate.instant(keyWords.maxDateRange));
        return;
      }
    }

    this.filters = deepClone(filters);
    this.searchFilter = filters?.SearchFilters;
    Object.entries(filters?.SearchFilters).forEach((values: any) => {

      if (typeof (values[1]) != 'string' && !Array.isArray(values[1])) {
        delete filters?.SearchFilters[values[0]]
      }
    })
    this.loaderService.show();
    let url = this.reconciliationPageInfo.url;
    this.restApiService.getTableData(url, filters, this.headerConfig).subscribe(data => {
      if (!data.body) {
        this.dataSource = null;
        this.serviceNotResponded = false;
        this.showNoRecords = true;
      } else {
        this.showNoRecords = false;
        this.serviceNotResponded = false;
        this.dataSource = data.body[this.reconciliationPageInfo.attributeName];
        let key
        this.dataSource.forEach(o => {
          key = o
          let keys = Object.keys(key)
          this.primaykeydata = keys[0]
        })

        if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
          this.displayColumn()
          this.getPageAPIInfo()
        }
      }
      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get('ttl-records-cnt') != 'na') {
        this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+data.headers.get('response-count')
        this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
      }
      if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName || this.cardsUrl == true || this.reconciliationPageInfo.pageName == keyWords.reconEnterpriceLogsName) {
        this.loaderService.hide();
      }
    },
      err => {
        if (err) {
          // this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
          this.loaderService.hide();
          this.dataSource = null;
          this.showNoRecords = false;
          this.serviceNotResponded = true;
        }
        if (err == 'Error: Parameter "key" required') {
          this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
        }
      }
    );

    let urll = this.reconciliationPageInfo.urll;
    if (this.cardsUrl == false && this.reconciliationPageInfo.pageName == keyWords.reconPmtsPageName) {
      this.dataLoading = true
      this.restApiService.getSummaryTableData(urll, filters, this.headerConfig).subscribe(data => {
        if (!data.body) {
          this.summaryDataSource = null;
        } else {
          this.summaryDataSource = data.body[this.reconciliationPageInfo.sattributeName]
          this.reasonPharse = data.headers.get(keyWords.reasonpharse)
          this.dataLoading = false
        }
        this.loaderService.hide();

      }, err => {
        if (err) {
          this.dataLoading = false
          this.summaryDataSource = null;
        }

      })
    }
  }



  getPageAPIInfo() {
    let obj = {
      url: null,
      urll: null,
      pageName: null,
      attributeName: null,
      downloadName: null,
      sattributeName: null,
      groupingEnabled: false,
      responseColumn: null
    }

    if (location.href.indexOf(keyWords.reconPmtsUrl) > -1) {
      obj.url = ApiPaths.getReconciliationDetails;
      obj.urll = ApiPaths.getReconciliationSummary;
      obj.pageName = keyWords.reconPmtsPageName;

      obj.attributeName = keyWords.reconPmtsAttributeName;
      obj.sattributeName = keyWords.reconPmtsSummaryName;
      obj.downloadName = this.translate.instant(keyWords.reconPmtsDownloadName) //download File Name
    }

    if (location.href.indexOf(keyWords.reconLogsUrl) > -1) {
      obj.responseColumn = null
      obj.url = ApiPaths.getPaymentGWBatch;      //utils.ts Api path
      obj.pageName = keyWords.reconLogsPageName;                 //pageName
      obj.attributeName = keyWords.reconLogsAttributeName;   //To display the grid you need the attribute name
      obj.downloadName = this.translate.instant(keyWords.reconLogsDownloadName)         //download File name
      obj.groupingEnabled = true;
      obj.responseColumn = this.selectableColumns
    }

    if (location.href.indexOf(keyWords.reconEnterpriceLogs) > -1) {
      obj.pageName = keyWords.reconEnterpriceLogsName;
      obj.url = ApiPaths.getEnterpriseBatch;
      obj.attributeName = 'EnterpriseBatchLogs';   //To display the grid you need the attribute name


    }

    this.reconciliationPageInfo = obj;

  }

  displayColumn() {
    this.selectableColumns = []
    this.dataSource.find((obj) => {
      Object.keys(obj).find(key => {
        this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
          let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
          if (key == o.id) {
            let displayedColumn = { flag: o.flag, id: o.id, name: o.name, type: o?.type, sorting: hasSorting ? true : false }

            this.selectableColumns.push(displayedColumn)


          }

        })
      });
    })
    this.selectableColumns = this.removeDuplicatesColumns(this.selectableColumns, keyWords.dataFiledId);
  }


  removeDuplicatesColumns(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }


}