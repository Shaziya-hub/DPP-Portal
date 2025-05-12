import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service'; //to make request httpcalls to back-end api and rest end points
import { ApiPaths, constantField, deleteFilters, validateDate } from 'src/app/shared/utils';
import { LoaderService } from '../../services/loader.service';
import { FiltersModel } from "src/app/model/filters.model";
import { deepClone } from "src/app/shared/utils";
import { DatePipe } from "@angular/common";
import { NotificationService } from "src/app/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import { keyWords } from "src/app/shared/constant";
import { ColumnSettingsModalService } from "src/app/components/column-settings/column-settings-modal.service";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-Settlement',
  templateUrl: './settlement.component.html'

})

export class SettlementComponent implements OnInit {

  pageConfig = null;
  settlementPageInfo = null;
  dataSource = null;
  showNoRecords: boolean;
  fromDate: Date;
  toDate: Date;
  responseCount: any
  filters: FiltersModel = new FiltersModel();
  pageSettings: any
  headerConfig: any
  filterss: any
  serviceNotResponded: boolean;
  cardsAttribute: any

  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private datepipe: DatePipe, private notificationService: NotificationService, private translate: TranslateService, private columnService: ColumnSettingsModalService) {
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


  applyFilters(filter: any) {

    if (filter.reset) {
      this.dataSource = null;
      this.showNoRecords = false;
      this.serviceNotResponded = false;
      return;
    }
    this.filterss = deleteFilters(filter)
    //console.log('filters',this.filterss)

    if (this.filterss?.SearchFilters?.fromDate && this.filterss?.SearchFilters?.toDate) {
      let days = validateDate(this.filterss, this.fromDate, this.toDate, this.datepipe) + 1;

      if (days != null && days > +this.pageConfig?.customParams?.SearchDateRange) {
        this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + keyWords.days));
        return;
      }

      if (days != null && days < 0) {
        this.notificationService.showError(this.translate.instant(keyWords.maxDateRange));
        return;
      }

    }

    this.filters = deepClone(this.filterss);

    let url = this.settlementPageInfo.url;
    this.loaderService.show();
    this.restApiService.getTableData(url, this.filterss, this.headerConfig).subscribe(data => {
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
        this.serviceNotResponded = false
      } else {
        this.showNoRecords = false;
        this.serviceNotResponded = false
        this.dataSource = data.body[this.settlementPageInfo.attributeName];
        /*
          for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
          no need for on click event from user
        */
        this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
          if (o.type == 'sensitive') {
            this.dataSource.map((d: any) => {
              let key = Object.keys(d).find(key => key == o[keyWords.dataFiledId]);
              if (d[key] != null) {

                // Same key used in Java
                let cipherToken = keyWords.cipher_Token;
                const bytes = CryptoJS.AES.decrypt(d[key], CryptoJS.enc.Utf8.parse(cipherToken), {
                  mode: CryptoJS.mode.ECB,
                  padding: CryptoJS.pad.Pkcs7
                });

                return d[key] = bytes.toString(CryptoJS.enc.Utf8);

              }
            })
          }

        })

      }
      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
        this.pageSettings.responseCount = this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+data.headers.get('response-count')
        this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt);
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
        if (!data.body) {
          this.cardsAttribute = null
        } else {
          this.cardsAttribute = data.body[this.settlementPageInfo.cardsAttribute]
        }


      }
      this.loaderService.hide();
    }, err => {
      if (err) {
        //this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable))
        this.loaderService.hide();
        this.cardsAttribute = null
        this.dataSource = null;
        this.showNoRecords = false;
        this.serviceNotResponded = true
      }
      if (err == 'Error: Parameter "key" required') {
        this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
      }
    });
  }

  getPageAPIInfo() {
    let obj = {
      url: null,
      pageName: null,
      attributeName: null,
      cardsAttribute: null,
      downloadName: null
    }
    if (location.href.indexOf(keyWords.settlementPmtUrl) > -1) {
      obj.url = ApiPaths.getReport;      //util.ts
      obj.pageName = keyWords.settlementPageName;            //pageName
      obj.attributeName = keyWords.settlementAttributeName; //to display the grid you need the attributeName
      obj.downloadName = this.translate.instant(keyWords.settlementDownloadName) //download File Name
      obj.cardsAttribute = keyWords.settlementCardsAttributeName // cards attribute
    }

    this.settlementPageInfo = obj;

  }

}
