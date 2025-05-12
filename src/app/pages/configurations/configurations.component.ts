import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigFilter } from 'src/app/model/configuration-filter.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import { keyWords } from 'src/app/shared/constant';
import { ApiPaths, deepClone, deleteFilters } from 'src/app/shared/utils';
import { LoaderService } from '../../services/loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/services/notification.service';
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html'
})
export class ConfigurationsComponent implements OnInit {

  pageConfig = null;
  dataSource = null;
  selectableColumns: any = []
  pageSettings: any
  headerConfig: any

  filters: any;
  configurationsPageInfo;
  responseCount: any;

  showNoRecords: boolean;
  serviceNotResponded: boolean;
  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private translate: TranslateService, private notificationService: NotificationService, private columnService: ColumnSettingsModalService) {
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
    this.filters = deepClone(filters);

    Object.entries(filters?.SearchFilters).forEach((values: any) => {

      if (typeof (values[1]) != 'string' && !Array.isArray(values[1])) {
        delete filters?.SearchFilters[values[0]]
      }
    })
    let url = this.configurationsPageInfo.url;
    this.loaderService.show();
    if (this.configurationsPageInfo.pageName != 'limitslocks') {
      this.restApiService.getTableData(url, filters, this.headerConfig).subscribe(data => {
        if (!data.body) {
          this.dataSource = null;
          this.showNoRecords = true;
          this.serviceNotResponded = false;
        } else {
          this.showNoRecords = false;
          this.serviceNotResponded = false;
          this.dataSource = data.body[this.configurationsPageInfo.attributeName];
          /*
            for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
            no need for on click event from user
          */
          this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
            if (o.type == keyWords.sensitiveType) {
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
          if (this.configurationsPageInfo.pageName == keyWords.configMasterPageName) {
            this.displayColumn()
            this.getPageAPIInfo()
          }

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
          // this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
          this.dataSource = null;
          this.showNoRecords = false;
          this.loaderService.hide();
          this.serviceNotResponded = true;
        }
        if (err == 'Error: Parameter "key" required') {
          this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
        }
      });
    }

  }

  limitLocksService(limitlock) {
    let url = this.configurationsPageInfo.url;
    this.loaderService.show();
    this.restApiService.getLimitLockTableData(url, this.headerConfig).subscribe(data => {
      // console.log(data)
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
        this.serviceNotResponded = false;
      } else {
        this.showNoRecords = false;
        this.serviceNotResponded = false;
        this.dataSource = data.body[keyWords.configLimitLockAttribute];
        //console.log(this.dataSource)
      }
      this.loaderService.hide();
    }, err => {
      if (err) {
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
      downloadName: null,
      attributeName: null,
      pageName: null,
      groupingEnabled: true,
      masterColumn: null
    }
    if (location.href.indexOf(keyWords.configAccessUrl) > -1) {
      obj.url = ApiPaths.getAccessControls;
      obj.pageName = keyWords.configAccessPageName
    }
    if (location.href.indexOf(keyWords.configParameterUrl) > -1) {
      obj.url = ApiPaths.getParameters;
      obj.attributeName = keyWords.configParameterAttribute
      obj.pageName = keyWords.configParameterPageName
      obj.downloadName = this.translate.instant(keyWords.configParameterDownload)
    }
    if (location.href.indexOf(keyWords.configLimitLockUrls) > -1) {
      obj.url = ApiPaths.getLimitAndLocks;
      obj.attributeName = keyWords.configLimitLockAttribute
      obj.pageName = keyWords.configLimitLockPageName
      obj.downloadName = this.translate.instant(keyWords.configLimitLockDownload)
    }
    if (location.href.indexOf(keyWords.configProcessorUrl) > -1) {
      obj.url = ApiPaths.getProcessorConfig;
      obj.attributeName = keyWords.configProcessorAttribute
      obj.pageName = keyWords.configProcessorPageName
      obj.groupingEnabled = true;
      obj.downloadName = this.translate.instant(keyWords.configProcessorDownload)
    }
    if (location.href.indexOf(keyWords.configEndPointUrl) > -1) {
      obj.url = ApiPaths.getEndPoints;
      obj.attributeName = keyWords.configEndPointAttribute
      obj.pageName = keyWords.configEndPointPageName
      obj.downloadName = this.translate.instant(keyWords.configEndPointDownload)
    }
    if (location.href.indexOf(keyWords.configAdvanceUrl) > -1) {
      obj.url = ApiPaths.getAdvancedAccessControls;
      obj.pageName = keyWords.configAdvancePageName;
    }
    if (location.href.indexOf(keyWords.configMasterUrl) > -1) {
      obj.masterColumn = null
      obj.url = ApiPaths.getMasterData;
      obj.attributeName = keyWords.configMasterAttribute
      obj.pageName = keyWords.configMasterPageName;
      obj.masterColumn = this.selectableColumns
      obj.downloadName = keyWords.configMasterDownload
    }

    this.configurationsPageInfo = obj;
  }
  displayColumn() {
    this.selectableColumns = []
    this.dataSource.find((obj) => {
      Object.keys(obj).find(key => {
        this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {

          if (key == o.id) {
            let displayedColumn = { flag: o.flag, id: o.id, name: o.name }

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
