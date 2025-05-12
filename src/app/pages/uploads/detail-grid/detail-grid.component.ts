import { Component, OnInit, Input } from "@angular/core";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { PageConfig } from 'src/app/model/page-config';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, customizeText, customizeText2, isUserHasAccess } from 'src/app/shared/utils';
import { RestApiService } from '../../../services/rest-api.service';
import { saveAs } from "file-saver";
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from 'src/app/services/notification.service';
import { require } from 'string-pixel-width';
import { TranslateService } from "@ngx-translate/core";
import { keyWords } from "src/app/shared/constant";
import * as CryptoJS from 'crypto-js';


@Component({
  selector: 'detail-grid',
  templateUrl: './detail-grid.component.html',
  styleUrls: ['./detail-grid.component.scss']
})

export class DetailGridComponent implements OnInit {

  @Input() key: number;
  @Input() pageConfig: PageConfig;
  @Input() uploadsPageInfo;
  dataSource: DataSource = null;
  pixelWidth = require('string-pixel-width');
  columns: any[] = [];
  headerConfig: any

  config = keyWords.config;
  showNoDetailRecords: boolean = false;
  serviceNotRespond: boolean = false;
  loading: boolean;
  constructor(private notification: NotificationService, private restApiService: RestApiService, private storeService: StoreService, private clipboard: Clipboard, private translate: TranslateService) {
    this.cellTemplate = this.cellTemplate.bind(this);
  }

  ngOnInit(): void {
    this.headerConfig = keyWords.config
    this.storeService.selectableColumnsDetails.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumnsDetails = <any>data;
      this.setColumns(this.dataSource)
    })
    let filters = {
      SearchFilters: {
        batchId: [
          this.key
        ]
      }
    }
    //("uploads",this.uploadsPageInfo)
    this.loading = true;
    if (this.uploadsPageInfo.pageName == keyWords.uploadsSadadPageName) {
      this.restApiService.getTableData(ApiPaths.getNonSADADPmtConfirmations, filters, this.headerConfig).subscribe(data => {
        data?.body ? this.loading = false : this.loading = true;
        let dataSource = data.body.NonSADADPmtConfDetails;

        /*
      for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
      no need for on click event from user
    */
        this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
          if (o.type == 'sensitive') {
            dataSource.map((d: any) => {
              let key = Object.keys(d).find(key => key == o[keyWords.dataFiledId]);
              if (d[key] != null) {

                // Same key used in Java
                let secretKey = 'ec5582d0fccd6o41';
                const bytes = CryptoJS.AES.decrypt(d[key], CryptoJS.enc.Utf8.parse(secretKey), {
                  mode: CryptoJS.mode.ECB,
                  padding: CryptoJS.pad.Pkcs7
                });

                return d[key] = bytes.toString(CryptoJS.enc.Utf8);

              }
            })
          }

        })

        this.columns = [];
        this.setColumns(dataSource);
        dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true;
      },
        (err) => {
          this.notification.showError(err);
          this.serviceNotRespond = true;
          this.loading = false
        });
    }
    else if (this.uploadsPageInfo.pageName == keyWords.uploadsBillsPageName) {
      this.restApiService.getTableData(ApiPaths.getBillConfirmations, filters, this.headerConfig).subscribe(data => {
        data?.body ? this.loading = false : this.loading = true;
        let dataSource = data?.body?.BillConfDetails;
        this.columns = [];
        this.setColumns(dataSource);
        dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true;
      },
        (err) => {
          this.notification.showError(err);
          this.serviceNotRespond = true;
          this.loading = false
        });
    }
    else {
      this.restApiService.getTableData(ApiPaths.getAccountConfirmations, filters, this.headerConfig).subscribe(data => {
        data?.body ? this.loading = false : this.loading = true;
        let dataSource = data?.body?.AccountConfDetails;
        this.columns = [];
        this.setColumns(dataSource)
        dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true;
      },
        (err) => {
          // this.notification.showError(err);
          this.serviceNotRespond = true;
          this.loading = false
        });
    }
  }

  setColumns(dataSource) {
    this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
      let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == 'true') {
        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');
        if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }
        if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.amount) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        }
        else if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.fileLocation) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.cellTemplate });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.amountTextCss, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false });
        }
        else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        }

        this.dataSource = new DataSource({
          store: new ArrayStore({
            data: dataSource
          }),

        });

      }

    });
  }

  completedValue(rowData) {
    return rowData.Status == keyWords.completed;
  }

  downloadFile(file) {
    this.restApiService.downloadFile(ApiPaths.downloadFile, file.data.fileLocation).subscribe(data => {
      saveAs(data, file.data.fileName)
    });
  }

  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.download ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a');
    let html = keyWords.imgCellTemplate;
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.download ? a.onclick = () => {
      this.downloadFile(options);
    } : ''
    div.append(a);
    div.append(options.data[keyWords.fileLocation]);
    return div;
  }

  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }


}
