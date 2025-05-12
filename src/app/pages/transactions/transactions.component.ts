import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FiltersModel } from 'src/app/model/filters.model';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { keyWords } from 'src/app/shared/constant';
import { ApiPaths, constantField, deepClone, deleteFilters, validateDate } from 'src/app/shared/utils';
import { LoaderService } from '../../services/loader.service';
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  pageConfig = null;
  dataSource = null;
  cardAttriute = null;
  cardServiceAttribute = null
  pageSize: any
  pageSettings = {
    responseCount: 0,
    totalRecordsCount: 0,
    ttlPagesCnt: 0
  };
  filters: FiltersModel = new FiltersModel();
  transactionsPageInfo;
  searchFilter: any;
  logger: boolean = false
  responseCount: any;
  cardsUrl: boolean = false

  config:any 
  showNoRecords: boolean;
  serviceNotResponded: boolean = false;
  fromDate: Date;
  toDate: Date
  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, public datepipe: DatePipe, private notificationService: NotificationService, private translate: TranslateService, private columnService: ColumnSettingsModalService) {
    this.columnService.reportType = null
  }

  ngOnInit(): void {  
    this.route.data.subscribe(data => {
      this.pageConfig = data.config.pageConfig;
      // this.pageConfig.customParams.PageSize=this.pageSize
      this.pageSize = data.config.pageConfig?.customParams?.PageSize
      this.getPageAPIInfo();
    })
  }

  transactionId: any
  transactionIdEvent(key) {

    this.transactionId = key;
  }

  instanceid: any
  instanceIdEvent(value) {
    this.instanceid = value;

  }

  actionKey: any
  actionIdEvent(value) {
    this.actionKey = value
  }

  logVal: any
  LoggerEvent(logVal) {
    this.logVal = logVal
  }


  pmtCards(cardsUrl) {
    this.cardsUrl = cardsUrl
  }

  responceCnt: any
  applyFilters(filter: any) {

    this.config = keyWords.config;
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
        this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + ' days'));
        return;
      }
      if (days != null && days < 0) {
        this.notificationService.showError(this.translate.instant('ToDate should be greater than FromDate'));
        return;
      }

    }

    this.filters = deepClone(filters);
    this.searchFilter = filters?.SearchFilters;
    let url = this.transactionsPageInfo.url;
    let url2 = this.transactionsPageInfo.url2

    this.loaderService.show();

    this.restApiService.getTableData(url, filters, this.config).subscribe(data => {
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
        this.cardAttriute = null;
        this.serviceNotResponded = false;
      } else {
        this.showNoRecords = false;
        this.serviceNotResponded = false;
        this.dataSource = data.body[this.transactionsPageInfo.attributeName];

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


        if (data.body[this.transactionsPageInfo.cardAttriute]) {
          this.cardAttriute = data.body[this.transactionsPageInfo.cardAttriute];
        }
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

    if (this.cardsUrl == false && (this.transactionsPageInfo.pageName == 'payments' || this.transactionsPageInfo.pageName == 'bills' || this.transactionsPageInfo.pageName == 'payrolls')) {
      this.restApiService.getTableData(url2, filters, this.config).subscribe(data => {
        if (!data.body) {
          this.cardServiceAttribute = null
        } else {
          this.cardServiceAttribute = data.body[this.transactionsPageInfo.cardAttributeName];

        }
        if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
          this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+25;//+data.headers.get('response-count')
          this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt);
          this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
        }

      }, err => {
        if (err) {
          this.cardServiceAttribute = null;
        }
        if (err == 'Error: Parameter "key" required') {
          this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
        }
      });
    }
  }

  getPageAPIInfo() {
    let obj = {
      url: null,
      url2: null,
      downloadName: null,
      attributeName: null,
      pageName: null,
      groupingEnabled: false,
      cardAttriute: null,
      cardAttributeName: null
    }
    if (location.href.indexOf('trx/payments') > -1) {
      obj.url = ApiPaths.getPaymentTransactions;
      obj.url2 = ApiPaths.getPmtTrxCards
      obj.downloadName = this.translate.instant(keyWords.trx_pmts);
      obj.attributeName = "PaymentTransactions";
      obj.pageName = "payments"
      obj.groupingEnabled = true;
      obj.cardAttriute = "PaymentCards";
      obj.cardAttributeName = "PaymentCards"
    }
    if (location.href.indexOf('trx/bills') > -1) {
      obj.url = ApiPaths.getBills;
      obj.url2 = ApiPaths.getBillCards
      obj.downloadName = this.translate.instant(keyWords.trx_Bills);
      obj.attributeName = "BillDetails";
      obj.pageName = "bills"
      obj.cardAttriute = "BillCards";
      obj.cardAttributeName = "BillCards"
    }
    if (location.href.indexOf('trx/nonsadadpmt') > -1) {
      obj.url = ApiPaths.getNonSADADPmts;
      obj.downloadName = this.translate.instant(keyWords.trx_Sadad);
      obj.attributeName = "nonSadadPmts";
      obj.pageName = "nonsadad"
    }
    if (location.href.indexOf('trx/accounts') > -1) {
      obj.url = ApiPaths.getAccounts;
      obj.downloadName = this.translate.instant(keyWords.trx_Accnt);
      obj.attributeName = "AccountDetails";
      obj.pageName = "accounts"
    }
    if (location.href.indexOf('trx/refunds') > -1) {
      obj.url = ApiPaths.getRefunds;
      obj.downloadName = this.translate.instant(keyWords.trx_refunds);
      obj.attributeName = "RefundDetails";
      obj.pageName = "refunds"
    }
    if (location.href.indexOf('trx/batches') > -1) {
      obj.url = ApiPaths.getPaymentBatches;
      obj.downloadName = this.translate.instant(keyWords.trx_Batches);
      obj.attributeName = "PaymentBatches";
      obj.pageName = "batches"
    }
    if (location.href.indexOf('trx/einvoices') > -1) {
      obj.url = ApiPaths.getEInvoices;
      obj.downloadName = this.translate.instant(keyWords.trx_Invoices);
      obj.attributeName = "EInvoices";
      obj.pageName = "einvoices";
      obj.groupingEnabled = true;
    }
    if (location.href.indexOf('trx/payouts') > -1) {
      obj.url = ApiPaths.getPayouts;
      obj.downloadName = this.translate.instant(keyWords.trx_Payouts);
      obj.attributeName = "Payouts";
      obj.pageName = "payouts";
      obj.groupingEnabled = false;
    }
    if (location.href.indexOf('trx/payrolls') > -1) {
      obj.url = ApiPaths.getPayrolls;
      obj.url2 = ApiPaths.getPayrollCards;
      obj.downloadName = this.translate.instant(keyWords.trx_Payrolls);
      obj.attributeName = "Payrolls";
      obj.pageName = "payrolls";
      obj.groupingEnabled = false;
      obj.cardAttriute = "PayrollCards";
      obj.cardAttributeName = "PayrollCards"
    }
    this.transactionsPageInfo = obj;
  }

}
