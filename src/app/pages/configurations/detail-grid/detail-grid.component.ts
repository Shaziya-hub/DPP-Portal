import { Component, Input, OnInit } from "@angular/core";
import { Clipboard } from '@angular/cdk/clipboard';
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { PageConfig } from "src/app/model/page-config";
import { RestApiService } from "src/app/services/rest-api.service";
import { StoreService } from "src/app/services/store.service";
import { ApiPaths, customizeText, customizeText2, deepClone, isUserHasAccess } from "src/app/shared/utils";
import { ProcessorconfigDetailModalService } from "../processorconfigdetail-modal/processorconfigdetail-modal.service";
import { require } from 'string-pixel-width';
import { keyWords } from "src/app/shared/constant";
import { NotificationService } from "src/app/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'detail-grid',
  templateUrl: './detail-grid.component.html',
  styleUrls: ['./detail-grid.component.scss']
})
export class DetailGridComponent implements OnInit {

  @Input() key: number;
  @Input() pageConfig: PageConfig;
  @Input() configurationsPageInfo;
  //@Input() columns;
  dataSource: DataSource = null;
  actionClick: Function;
  //  columns: any[] = [];
  pixelWidth = require('string-pixel-width');
  loading: boolean
  columns: any[] = [];
  headerConfig: any
  serviceNotRespond: boolean = false;
  showNoDetailRecords: boolean = false;
  constructor(private restApiService: RestApiService, private storeService: StoreService, private processorconfigDetailModalService: ProcessorconfigDetailModalService, private clipboard: Clipboard, private notification: NotificationService, private translate: TranslateService) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.actionClick = (pageName, data) => this.onActionClick(pageName, data);
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
        configId:
          this.key

      }
    }
    this.loading = true
    this.restApiService?.getTableData(ApiPaths.getProcessorConfigDetails, filters, this.headerConfig)?.subscribe(data => {
      data.body ? this.loading = false : this.loading = true
      let dataSource = data?.body?.ProcessorConfigDetails;
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
      this.columns = [];
      this.setColumns(dataSource)
      dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true
    },
      (err) => {
        this.serviceNotRespond = true
        this.notification.showError(this.translate.instant(keyWords.serviceNotAvailable));
      });
  }


  setColumns(dataSource) {
    this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {

      if (o.flag == 'true') {
        let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
        let preview = this.pageConfig.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);
        if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.amount) > -1) {//console.log("length of string ",this.pixelWidth(o[keyWords.captionName],{ size: 14,weight: 700 })+20);
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          // console.log("lenght", this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }))
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        } else if (o.type == keyWords.numeric) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: false, adaptive: true });
        }
        this.dataSource = new DataSource({
          store: new ArrayStore({
            data: dataSource
          }),
        });
      }
    });
    this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.cellTemplate });
  }

  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a');
    a.classList.add(keyWords.colorBlue)
    let html = keyWords.imgIdentityCell
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? a.onclick = () => this.actionClick(this.configurationsPageInfo.pageName, deepClone(options.key)) : '';
    div.append(a);
    return div;
  }

  onActionClick(pageName, data) {
    // console.log(data, "pageName", pageName);
    switch (pageName) {
      case keyWords.configProcessorPageName:
        // console.log("pageName", keyWords.configProcessorPageName);
        this.processorconfigDetailModalService.open(this.pageConfig, data, this.headerConfig);
        break;

      default:
        break;
    }
  }
  completedValue(rowData) {
    return rowData.Status == keyWords.completed;
  }

}

