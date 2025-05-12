import { Component, OnInit } from "@angular/core";
import { ApiPaths, constantField, deleteFilters, validateDate } from "src/app/shared/utils";
import { ActivatedRoute } from "@angular/router";
import { RestApiService } from "src/app/services/rest-api.service";
import { LoaderService } from "src/app/services/loader.service";
import { FiltersModel } from "src/app/model/filters.model";
import { deepClone } from "src/app/shared/utils";
import { DatePipe } from "@angular/common";
import { NotificationService } from "src/app/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import { keyWords } from "src/app/shared/constant";
import { ColumnSettingsModalService } from "src/app/components/column-settings/column-settings-modal.service";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-Uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})

export class UploadsComponent implements OnInit {

  dataSource = null;
  pageConfig = null;
  uploadsPageInfo = null;
  showNoRecords: boolean;
  fromDate: Date;
  toDate: Date;
  responseCount: any
  pageSettings: any
  headerConfig: any
  serviceNotResponded: boolean;
  filters: FiltersModel = new FiltersModel();
  primaykeydata: any



  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private datepipe: DatePipe, private notificationService: NotificationService,
    private translate: TranslateService, private columnService: ColumnSettingsModalService) {
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
    let filters = deleteFilters(filter)

    if (filters?.SearchFilters?.fromDate && filters?.SearchFilters?.toDate) {
      let days = validateDate(filters, this.fromDate, this.toDate, this.datepipe) + 1;

      if (days != null && days > +this.pageConfig?.customParams?.SearchDateRange) {
        this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange));
        return;
      }

      if (days != null && days < 0) {
        this.notificationService.showError(this.translate.instant(keyWords.maxDateRange));
        return;
      }

    }

    this.filters = deepClone(filters);
    let url = this.uploadsPageInfo.url;
    this.loaderService.show();
    this.restApiService.getTableData(url, filters, this.headerConfig).subscribe(data => {
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
      } else {
        this.showNoRecords = false;
        this.dataSource = data.body[this.uploadsPageInfo.attributeName];

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

        let key
        this.dataSource.forEach(o => {
          key = o
          let keys = Object.keys(key)

          this.primaykeydata = keys[0]
        })
      }
      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
        this.pageSettings.responseCount = this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+data.headers.get('response-count')
        this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt);
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
      }
      this.loaderService.hide();
    }, err => {
      if (err) {
        //this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
        this.loaderService.hide();
        this.dataSource = null;
        this.showNoRecords = false;
        this.serviceNotResponded = true;
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
      downloadName: null,
      groupingEnabled: false
    }
    if (location.href.indexOf(keyWords.uploadsSadadUrl) > -1) {
      obj.url = ApiPaths.getNonSADADPmtUploads;   //utils.ts Api path
      obj.pageName = keyWords.uploadsSadadPageName;              //pageName
      obj.attributeName = keyWords.uploadsSadadAttributeName //To display the grid you need the attribute name
      obj.downloadName = this.translate.instant(keyWords.uploadsSadadDownloadName)      //download File name
      obj.groupingEnabled = true;
    }
    if (location.href.indexOf(keyWords.uploadsBillsUrl) > -1) {
      obj.url = ApiPaths.getBillUploads;   //utils.ts Api path
      obj.pageName = keyWords.uploadsBillsPageName;               //pageName
      obj.attributeName = keyWords.uploadsBillsAttributeName  //To display the grid you need the attribute name
      obj.downloadName = this.translate.instant(keyWords.uploadsBillsDownloadName)     //download File name
      obj.groupingEnabled = true;
    }
    if (location.href.indexOf(keyWords.uploadsAccountUrl) > -1) {
      obj.url = ApiPaths.getAccountUploads;      //utils.ts Api path
      obj.pageName = keyWords.uploadsAccountPageName;                 //pageName
      obj.attributeName = keyWords.uploadsAccountAttributeName;   //To display the grid you need the attribute name
      obj.downloadName = this.translate.instant(keyWords.uploadsAccountDownloadName)         //download File name
      obj.groupingEnabled = true;

    }

    this.uploadsPageInfo = obj;
  }
}