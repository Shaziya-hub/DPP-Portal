import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { PageConfig } from 'src/app/model/page-config';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, customizeText, customizeText2, doubleClick } from 'src/app/shared/utils';
import { RestApiService } from '../../../services/rest-api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { require } from 'string-pixel-width';
import { TranslateService } from '@ngx-translate/core';
import { keyWords } from 'src/app/shared/constant';
import * as CryptoJS from 'crypto-js';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'detail-grid',
  templateUrl: './detail-grid.component.html',
  styleUrls: ['./detail-grid.component.scss']
})
export class DetailGridComponent implements OnInit {

  @Input() key: number;
  @Input() pageConfig: PageConfig;
  @Input() filters;
  @Input() transactionsPageInfo;
  @Output() instanceIdEvent = new EventEmitter();

  dataSource: DataSource = null;
  pixelWidth = require('string-pixel-width');
  columns: any[] = [];
  loading: boolean

  config = keyWords.config
  showNoDetailRecords: boolean = false;
  serviceNotRespond: boolean = false;
  constructor(private notification: NotificationService, private restApiService: RestApiService, private storeService: StoreService, private clipboard: Clipboard, private datepipe: DatePipe,
    private translate: TranslateService) {
    this.instanceIdCellTemplate = this.instanceIdCellTemplate.bind(this);
  }

  ngOnInit(): void {
    this.storeService.selectableColumnsDetails.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumnsDetails = <any>data;
      this.setColumns(this.dataSource)
    })

    this.loading = true;
    if (this.transactionsPageInfo.pageName == 'payments') {
      let filters = {
        SearchFilters: {
          transId: [
            this.key
          ],
          fromDate: this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss'),
          toDate: this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
        }
      }
      this.restApiService.getTableData(ApiPaths.getPaymentTransactionDetails, filters, this.config).subscribe(data => {
        data?.body ? this.loading = false : this.loading = true
        let dataSource = data?.body?.PaymentTransactionDetails;

        this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
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
        // console.log("columns", this.columns)
        this.setColumns(dataSource);
        dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true
        this.serviceNotRespond = false;
      },
        (err) => {
          this.serviceNotRespond = true;
          this.showNoDetailRecords = false;
        });
    } else if (this.transactionsPageInfo.pageName == 'einvoices') {
      let filters = {
        SearchFilters: {
          transId: this.key,
        }
      }
      this.restApiService.getTableData(ApiPaths.getEInvoiceDetails, filters, this.config).subscribe(data => {
        data?.body ? this.loading = false : this.loading = true
        let dataSource = data?.body?.EInvoiceDetails;
        this.columns = [];
        this.setColumns(dataSource);
        dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true
        this.serviceNotRespond = false;
      },
        (err) => {
          this.serviceNotRespond = true;
          this.showNoDetailRecords = false;
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
        if (o['id'].toLowerCase().indexOf(keyWords.amountKey) > -1) {
          //console.log("length of string ",this.pixelWidth(o['name'],{ size: 14,weight: 700 })+20);
          this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.amountTextCss, width: this.pixelWidth(o['name'], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.amountTextCss, width: this.pixelWidth(o['name'], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o['id'].toLowerCase().indexOf(keyWords.epayInstanceId) > -1) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass: keyWords.instanceIdCss, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.instanceIdCellTemplate });
        } else {
          this.columns.push({ dataField: o['id'], caption: o['name'], allowSorting: false, adaptive: true });
        }
        this.dataSource = new DataSource({
          store: new ArrayStore({
            data: dataSource
          }),
        });
      }
    });
  }

  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }


  completedValue(rowData) {
    return rowData.Status == 'Completed';
  }

  logDetails(option) {
    this.instanceIdEvent.emit(option);
  }
  instanceIdCellTemplate(container, options) {
    //console.log('instancs',options)
    let div = document.createElement('DIV');
    div.setAttribute("data-toggle", "tooltip");
    div.setAttribute("data-placement", "top");
    div.setAttribute("title", options.key.ePayInstanceId);
    let a = document.createElement('A')
    let html = '<span>' + options.key.ePayInstanceId + '</span>'
    //  a.style.color = '#000000'
    //  a.style.pointerEvents = "all"
    a.innerHTML = html
    a.onclick = () => this.logDetails(options)

    div.append(a);
    return div;
  }

}
