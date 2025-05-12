import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from "@angular/core";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { PageConfig } from "src/app/model/page-config";
import { RestApiService } from "src/app/services/rest-api.service";
import { StoreService } from "src/app/services/store.service";
import { ApiPaths, customizeText, customizeText2, deepClone, deleteFilters, isUserHasAccess } from "src/app/shared/utils";
import { DxDataGridComponent } from "devextreme-angular";
import { require } from 'string-pixel-width';
import { Clipboard } from '@angular/cdk/clipboard';
import { keyWords } from "src/app/shared/constant";
import { LoaderService } from "src/app/services/loader.service";
import { getTextWidth } from 'get-text-width';
import { DatePipe } from '@angular/common';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'detail-grid',
  templateUrl: './detail-grid.component.html',
  styleUrls: ['./detail-grid.component.scss']
})
export class DetailGridComponent implements OnInit {

  @Input() dataSource;
  @Input() key: number;
  @Input() pageConfig: PageConfig;
  @Input() reconciliationPageInfo;
  @Input() filters;
  @Output() downloadEvent = new EventEmitter();
  loading: boolean

  headerConfig: any
  paginationFilters: any
  commondataSource: DataSource = null;
  dataSource2: any;
  actionClick: Function;
  el: any
  pixelWidth = require('string-pixel-width');
  columns: any[] = [];
  onPageLoad: boolean = true;
  responseCount: any
  responseColumn: any
  selectableColumnsDetails: any = []
  reconciliationPageInfodetail: any
  @ViewChild(DxDataGridComponent, {
    static: false
  })
  dataGrid: DxDataGridComponent;

  detailGriddownloadInfo: any
  pageSettings: any
  showNoDetailRecords: boolean = false;
  serviceNotRespond: boolean = false;
  pageNo:any

  constructor(private restApiService: RestApiService, private storeService: StoreService, private clipboard: Clipboard, private loaderService: LoaderService, private datepipe: DatePipe) {
    this.cellTemplate = this.cellTemplate.bind(this);
  }



  ngOnInit(): void {
    // this.getPageAPIInfo();
    // keyWords.recondetailConfig[keyWords.pageNumber]="1"
    this.headerConfig = keyWords.recondetailConfig
    this.pageSettings = keyWords.recondetailPageSetting
    //console.log('dataSource',this.dataSource2,this.headerConfig,this.pageSettings)
    // console.log('config',this.filters)
    //console.log('pageconfig',this.pageConfig.selectableColumnsDetails)
    this.storeService.selectableColumnsDetails.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumnsDetails = <any>data;

      this.setColumns(this.commondataSource)
    })
    let filter = {
      SearchFilters: {
        batchId: this.key,
        pmtGatewayType: this.filters.SearchFilters.pmtGatewayType,
        logType: this.filters.SearchFilters.logType
      }
    }
    let filters = deleteFilters(filter)
    this.paginationFilters = filters
    this.getdetailInfo();
    //this.displayColumn()
    this.loading = true
    this.callingService();

  }

  getdetailInfo() {
    let obj = {
      url: null,
      attributeName: null,
      responseColumn: null,
      paginationFilters: null,
      downloadName: null,
      header: null,
      fromDate: null,
      toDate: null,
      commondataSource: null
    }

    if (location.href.indexOf(keyWords.reconLogsUrl) > -1) {
      // obj.responseColumn=null
      obj.url = ApiPaths.getPaymentGWBatchDetails;      //utils.ts Api path
      obj.attributeName = keyWords.reconLogsDetailAttribute;   //To display the grid you need the attribute name
      obj.responseColumn = this.selectableColumnsDetails
      obj.paginationFilters = this.paginationFilters,
        obj.downloadName = 'PaymentGWBatchDetails',
        obj.header = this.headerConfig,
        obj.fromDate = this.filters.SearchFilters.fromDate,
        obj.toDate = this.filters.SearchFilters.toDate,
        obj.commondataSource = this.commondataSource
    }
    this.detailGriddownloadInfo = obj
    this.downloadEvent.emit(this.detailGriddownloadInfo)
  }

  callingService() {
    this.restApiService.getTableData(ApiPaths.getPaymentGWBatchDetails, this.paginationFilters, this.headerConfig).subscribe(data => {

      data.body ? this.loading = false : this.loading = true
      let commondataSource = data?.body?.PaymentGWBatchDetails;
      commondataSource != null && commondataSource != undefined && commondataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true;
      this.dataSource2 = data.body.PaymentGWBatchDetails;

      /*
         for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
         no need for on click event from user
       */
      this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
        if (o.type == keyWords.sensitiveType) {
          this.dataSource2.map((d: any) => {
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

      this.displayColumn()
      this.columns = [];
      this.setColumns(commondataSource)

      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (this.onPageLoad != false) {
        this.responseCount = +data.headers.get(keyWords.responseCount)
        if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
          this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+data.headers.get('response-count')
          this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
          this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
        }

      }
      // this.loaderService.hide()
    },
      (err) => {
        this.serviceNotRespond = true;
      }
    );
  }

  getPageAPIInfo() {
    let obj = {
      url: null,
      attributeName: null,
      responseColumn: null
    }

    if (location.href.indexOf(keyWords.reconLogsUrl) > -1) {
      obj.responseColumn = null
      obj.url = ApiPaths.getPaymentGWBatchDetails;      //utils.ts Api path
      obj.attributeName = keyWords.reconLogsAttributeName;   //To display the grid you need the attribute name
      obj.responseColumn = this.selectableColumnsDetails
    }

    this.reconciliationPageInfodetail = obj;

  }

  setColumns(commondataSource) {
    this.dataSource2.find((element) => {
      this.el = Object.keys(element)
    })

    let obj = {
      url: null,
      attributeName: null,
      responseColumn: null,
      paginationFilters: null,
      downloadName: null,
      header: null,
      fromDate: null,
      toDate: null,
      commondataSource: null,

    }

    if (location.href.indexOf(keyWords.reconLogsUrl) > -1) {
      // obj.responseColumn=null
      obj.url = ApiPaths.getPaymentGWBatchDetails;      //utils.ts Api path
      obj.attributeName = keyWords.reconLogsDetailAttribute;   //To display the grid you need the attribute name
      obj.responseColumn = this.selectableColumnsDetails
      obj.paginationFilters = this.paginationFilters,
        obj.downloadName = keyWords.reconLogsDetailDownload,
        obj.header = this.headerConfig,
        obj.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
      obj.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
      obj.commondataSource = commondataSource
    }
    this.detailGriddownloadInfo = obj
    this.downloadEvent.emit(this.detailGriddownloadInfo)

    this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
      // let hasSorting = this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == keyWords.true) {
        this.columns = []
        this.selectableColumnsDetails && this.selectableColumnsDetails.map((o: any) => { //console.log('o', o)
          let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
          let preview = this.pageConfig.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);
          if (o.flag == keyWords.true) {
            if (o.type == keyWords.amount ) {
              this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.srefundAmtCss, width: getTextWidth(o[keyWords.captionName]) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
            } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) { //console.log("lenght",this.pixelWidth(o[keyWords.captionName],{ size: 14,weight: 700 }))
              this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
            } else if (o.type == keyWords.numeric) { //console.log('hasSorting', hasSorting)
              this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.right, caption: o[keyWords.captionName], cssClass: keyWords.amountTextCss, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false });
            }

            else {
              this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true });
            }
          }

        })
        this.commondataSource = new DataSource({
          store: new ArrayStore({
            data: commondataSource
          }),
        });
      }
    });
  }

  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a');
    a.classList.add(keyWords.colorBlue)
    let html = keyWords.imgCellTemplate;
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? a.onclick = () => this.actionClick(this.reconciliationPageInfo.pageName, deepClone(options.key)) : '';
    div.append(a);
    return div;
  }

  completedValue(rowData) {
    return rowData.Status == keyWords.completed;
  }

  getSortedColumn() {
    const instance = this.dataGrid.instance;
    const allColumns = Array.from(Array(instance.columnCount()).keys()).map(index => instance.columnOption(index));
    return allColumns.find(col => col.sortIndex != null);
  }

  onOptionChanged(e) {
    if (e.fullName.endsWith(keyWords.sortOrder)) {
      let el = this.getSortedColumn();
      this.headerConfig[keyWords.sortingColumn] = el.name;
      this.headerConfig[keyWords.sortingOrder] = el.sortOrder.toUpperCase()
      this.headerConfig[keyWords.pageNumber] = this.pageNo ? this.pageNo : String(1);
      this.callingService();
    }
  }

  onPageChange(pageNumber: any) {
    this.onPageLoad = false
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.callingService();
    }
  }

  onCellDetailDblClick(e) {
    this.clipboard.copy(e?.text);
  }

  displayColumn() {
    this.selectableColumnsDetails = []
    this.dataSource2.find((obj) => {
      Object.keys(obj).find(key => {
        this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
          if (key == o.id) {
            let displayedColumn = {  flag: o.flag, id: o.id, name: o.name,  type : o.type, reportFlag: o.reportFlag, sorting:o.sorting }
            this.selectableColumnsDetails.push(displayedColumn)
          }

        }
        )
      });
    })
    this.selectableColumnsDetails = this.removeDuplicatesColumns(this.selectableColumnsDetails, keyWords.dataFiledId);
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
