import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, HostListener } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { saveAs } from "file-saver";
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import { DownloadManagerService } from 'src/app/components/download-manager/download-manager.service';
import { PageConfig } from 'src/app/model/page-config';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, customizeText, customizeText2, deepClone, deleteFilters, haveEnoughSessionStorageSpace, isUserHasAccess } from 'src/app/shared/utils';
import { require } from 'string-pixel-width';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from 'src/app/services/loader.service';
import { keyWords, pdfArabicFonts, pdfKeywords } from 'src/app/shared/constant';
import { DatePipe } from '@angular/common';

import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { getTextWidth } from 'get-text-width';
import { ExcelServicesService } from 'src/app/services/excel.service';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  @Input() dataSource;
  @Input() dataSource2;
  @Input() pageConfig: PageConfig;
  @Input() pageConfig2: PageConfig;
  @Input() headerConfig;
  @Input() filters;
  @Input() pageSettings;
  @Input() showNoRecords;
  @Input() reportPageInfo;
  @Input() fromdate
  @Input() todate
  @Input() bizService
  @Input() merchant
  @Input() responseCount
  @Input() pmtGateways
  @Input() reportId
  @Input() billStatus
  @Input() paymentStatus
  @Input() summaryType
  @Input() reportDate


  @Output() applyFiltersEvent = new EventEmitter();
  @Output() selectedpdf: EventEmitter<any> = new EventEmitter();
  @ViewChild('dropdown') dropdown: BsDropdownDirective;
  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGrid: DxDataGridComponent;
  pixelWidth = require('string-pixel-width');
  columns = [];
  page: 1;
  primaryKey: string;

  showInfo = true;
  showNavButtons = true;
  rtlEnabled = false //will change according to language selection
  isUserHasAccess: any
  heading: any
  generatePdfDetailsList: any = [];
  header: any
  head: boolean = false
  copySelectableColumns: any;
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  tabIndex: number = 0;
  serviceNotResponded: boolean;
  date: any = new Date()
  label: any
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  pdfDataSource: any = [];
  totalRecordsCount: any;
  file: any
  obj: any = {
    file: null,
    label: null,
    fromdate: null,
    todate: null,
    currentTimestamp: null
  }
  selectedLang: any
  pdfPageName: any
  userpassword: any
  currentTimestamp: any = new (Date)
  pageNo:any

  constructor(private notification: NotificationService, private columnSettingsModalService: ColumnSettingsModalService, public datepipe: DatePipe, private store: StoreService, private restApiService: RestApiService, private downloadManagerService: DownloadManagerService, private clipboard: Clipboard,
    private translate: TranslateService, private loaderService: LoaderService, private excelService: ExcelServicesService, private activeRoute: ActivatedRoute) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
  }

  ngOnInit(): void {
    this.currentTimestamp = this.datepipe.transform(this.currentTimestamp, 'yyyyMMddTHHmmss');
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    this.date = this.datepipe.transform(this.date, 'dd/MM/YYYY')
    this.header = this.headerConfig
    this.selectableColumns = this.pageConfig2.selectableColumns;
    if (this.filters.SearchFilters.reportType == 'PMT_UNRECON') {
      this.label = this.translate.instant(keyWords.pmtUnrecon)
    } else if (this.filters.SearchFilters.reportType == 'PMT_RECON') {
      this.label = this.translate.instant(keyWords.pmtRecon)
    }
    this.selectableColumnsDetails = this.pageConfig2.selectableColumnsDetails;
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
    setTimeout(() => {
      this.columns = [];
      this.setGridColumns();
    }, 10);
    this.store.selectableColumns.subscribe(data => {
      this.columns = [];
      this.pageConfig2.selectableColumns = <any>data;
      this.setGridColumns();
    })

    this.selectedLang = localStorage.getItem('selectedLang')

    //pageName from menu
    let pageId
    this.activeRoute.queryParams.subscribe((params) => {
      pageId = params.pageId;
    })
    this.store.sideMenu.subscribe(sideMenu => {
      sideMenu.menuItems.forEach(menu => {

        menu?.subMenu.filter(submenu => {
          if (submenu.pageId == pageId) {
            this.pdfPageName = submenu.text;
            // console.log('pdfPageName',this.pdfPageName)
          }
        })
      })
    });

  }

  setGridColumns() {

    this.pageConfig2.selectableColumns && this.pageConfig2.selectableColumns.map((o: any) => {
      let hasSorting = o.sorting//this.pageConfig2.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == keyWords.true) {
        /*
        for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
        no need for on click event from user
      */
        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);
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

          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }
        if (o.type == keyWords.amount) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: getTextWidth(o[keyWords.captionName]) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == keyWords.numeric) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: getTextWidth(o[keyWords.captionName]) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
          //this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.right,  cssClass: keyWords.amountTotalRevenue, caption: o[keyWords.captionName], allowSorting: hasSorting ? true : false, adaptive: true, sortingMethod: () => { return false; } });
        } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
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
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }
        else if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.fileLocation) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.cellTemplate });
        } else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        }
      }
    });
    this.primaryKey = this.columns[0].dataField;
    if (this.reportPageInfo.groupingEnabled) {
      this.primaryKey = keyWords.primaryKeyBatchId;
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false, cellTemplate: this.actionCellTemplate })
    } else {
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false })
    }

    let sticky = document.getElementById(keyWords.reportGridContainer).children[0].children[4];
    sticky.classList.add(keyWords.fixedHeaders);
  }

  actionCellTemplate(container, options) {
    let div = document.createElement('div')
    let a = document.createElement('a');
    a.classList.add(keyWords.colorBlue)
    let html = keyWords.imgPlusDetail
    if (this.dataGrid.instance.isRowExpanded(options.key)) {
      html = keyWords.imgMinusDetail
    }
    a.innerHTML = html;
    a.onclick = () => {
      if (this.dataGrid.instance.isRowExpanded(options.key)) {
        this.dataGrid.instance.collapseRow(options.key)
      } else {
        options.component.collapseRow(-1)
        this.dataGrid.instance.expandRow(options.key)
      }
    }
    div.append(a);
    return div;
  }

  cellTemplate(container, options) {
    let div = document.createElement('div')
    let a = document.createElement('a');
    let html = keyWords.imgCellTemplate;
    a.innerHTML = html;
    a.onclick = () => {
      this.downloadFile(options);
    }
    div.append(a);
    div.append(options.data[keyWords.fileLocation]);
    return div;
  }

  //On hover row is being highlighted
  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }

  onCellDblClick(e) {
    this.notification.showInfo(this.translate.instant(keyWords.clipboardCopy))
    this.clipboard.copy(e?.text);
  }

  onRightClick(e) {
    if (e.target == keyWords.content) {
      e.items = [{
        text: keyWords.copy,
        onItemClick: () => {
          this.clipboard.copy(e?.targetElement.innerHTML);
        }
      }]
    }
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
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  onPageChange(pageNumber: any) {
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  customizeColumns(cols: any[]) {
    cols.forEach(col => col.headerCellTemplate = keyWords.header);

  }

  selectColumns() {
    this.columnSettingsModalService.getSelectableColumns(this.headerConfig);
  }

  onChange(event, col) {
    col.flag = event.target.checked.toString();
  }

  apply() {
    if (this.tabIndex == 0) {
      let allDeSelected = this.selectableColumns.filter(o => o.flag == keyWords.true).length == 0
      if (allDeSelected) {
        this.notification.showError(this.translate.instant(keyWords.errColumnSelection));
        return;
      }
    } else {
      let allDeSelected = this.selectableColumnsDetails.filter(o => o.flag == keyWords.true).length == 0
      if (allDeSelected) {
        this.notification.showError(this.translate.instant(keyWords.errColumnSelection));
        return;
      }
    }
    this.updateSelectableColumns(this.selectableColumns, this.selectableColumnsDetails)
  }

  tabClicked(index) {
    if (index == 1 && this.selectableColumnsDetails.length == 0) {
      return;
    }
    this.tabIndex = index;
  }

  updateSelectableColumns(selectableColumns, selectableColumnsDetails) {
    this.loaderService.show();
    this.copySelectableColumns = selectableColumns
    let data = {
      'request-type': 'edit'
    }
    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data)

    return this.restApiService.updateSelectableColumns(selectableColumns, selectableColumnsDetails, headerConfig, this.reportId).subscribe(data => {

      this.store.selectableColumns.next(selectableColumns);
      this.store.selectableColumnsDetails.next(selectableColumnsDetails);
      this.loaderService.hide();
    });
  }

  download() {
    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(this.translate.instant(keyWords.exportDownload), keyWords.showInfo)
    let data = {
      "page-number": "1",
      "request-type": "download"
    }

    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data);
    let response = null;
    let id = new Date().getMilliseconds();
    let percent = 0;
    this.filters = deleteFilters(this.filters)
    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.downloadManagerService.isDownloading = true;
    this.restApiService.downloadTableData(this.reportPageInfo.url, this.filters, headerConfig).subscribe(data => {
      if (data.type > 0) {
        this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        //let name = this.reportPageInfo.downloadName+ '_' + this.currentTimestamp + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.lang == 'en' ? this.reportPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate : this.lang == 'ar' ? this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate + '_' + 'DTR' + '_' + this.reportPageInfo.downloadName : '';
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body) {
          if (data?.body?.ReconPmts) {
            response = data.body.ReconPmts[this.reportPageInfo.attributeName]

          } else if (data?.body?.UnreconPmts) {
            response = data.body.UnreconPmts[this.reportPageInfo.attributeName]


          } else {
            response = data.body[this.reportPageInfo.attributeName].Details
          }
        }

        if (data.headers)
          totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        this.saveCSVToSession(id, response, name, totalRecordsCount, percent);

      }
    });
  }

  pdfdownload() {
    this.generatePdfDetailsList = []
    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(this.translate.instant(keyWords.exportDownload), keyWords.showInfo)
    let data = {
      "page-number": "1",
      "request-type": "download"
    }

    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data);
    //let file: any
    let response = null;
    let id = new Date().getMilliseconds();
    let pdfFlag = true;
    let percent = 0;

    this.downloadManagerService.isDownloading = true;
    if (this.reportPageInfo.pageName == keyWords.custReports) {
      this.filters.SearchFilters.serviceId == null ? delete this.filters.SearchFilters.serviceId : '';
      this.filters.SearchFilters.pmtGatewayType == null ? delete this.filters.SearchFilters.pmtGatewayType : '';
      this.filters.SearchFilters.pmtGatewayId == null ? delete this.filters.SearchFilters.pmtGatewayId : '';
      this.filters.SearchFilters.customReportSummaryType == null ? delete this.filters.SearchFilters.customReportSummaryType : '';
    }
    this.filters = deleteFilters(this.filters)

    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')


    this.restApiService.downloadTableData(this.reportPageInfo.url, this.filters, headerConfig).subscribe(data => {  //console.log('data',data)
      if (data.type > 0) {
        let fromDate
        let toDate

        fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');

        // let name = this.reportPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.lang == 'en' ? this.reportPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? fromDate + '_' + toDate + '_' + 'DTR' + '_' + this.reportPageInfo.downloadName : '';
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        // let totalRecordsCount;
        if (data.headers)
          this.totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        if (data?.body) { //console.log('res1',data)
          response = data?.body?.ReconPmts ? data.body.ReconPmts[this.reportPageInfo.attributeName] : data?.body?.UnreconPmts ? data.body.UnreconPmts[this.reportPageInfo.attributeName] : (data?.body?.BillsRpt || data?.body?.PmtsRpt || data?.body?.Summary) ? data.body[this.reportPageInfo.attributeName].Details : '';
          this.pdfDataSource = data?.body?.ReconPmts ? data.body.ReconPmts[this.reportPageInfo.attributeName] : data?.body?.UnreconPmts ? data.body.UnreconPmts[this.reportPageInfo.attributeName] : (data?.body?.BillsRpt || data?.body?.PmtsRpt || data?.body?.Summary) ? data.body[this.reportPageInfo.attributeName].Details : '';

          let pdfData: any = {
            //file: this.file,
            label: this.reportPageInfo.downloadName,
            fromdate: data?.body?.BillsRpt?.Summary ? this.datepipe.transform(data?.body?.BillsRpt?.Summary.fromDate, 'yyyyMMddTHHmmss') : this.filters.SearchFilters.fromDate,
            todate: data?.body?.BillsRpt?.Summary ? this.datepipe.transform(data?.body?.BillsRpt?.Summary.toDate, 'yyyyMMddTHHmmss') : this.filters.SearchFilters.toDate,
            currentTimestamp: this.currentTimestamp,
            pageConfig: this.pageConfig2,
            pageName: this.pdfPageName,//this.reportPageInfo.pageName,
            totalRecordsCount: this.totalRecordsCount,
            dataSource: this.pdfDataSource,
            selectableColumns: this.selectableColumns,
            reportsFlag: true,
            reports: {
              bizService: this.bizService,
              pmtGateways: this.pmtGateways,
              attributeName: this.reportPageInfo.attributeName,
              billStatus: this.billStatus,
              paymentStatus: this.paymentStatus,
              summaryType: this.summaryType,
              fromdate: this.fromdate,
              todate: this.todate,
            }
          }
          this.downloadManagerService.setdocument(pdfData)

        }
        this.sendpdf(pdfFlag, id, response, name, this.totalRecordsCount, percent);
      }
    });
  }

  downloadXlsx() {
    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(this.translate.instant(keyWords.exportDownload), this.translate.instant(keyWords.showInfo))
    let data = keyWords.reqTypeDownload

    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data);
    let response = null;
    let id = new Date().getMilliseconds();
    let percent = 0;
    this.downloadManagerService.isDownloading = true;
    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.filters = deleteFilters(this.filters)
    this.restApiService.downloadTableData(this.reportPageInfo.url, this.filters, headerConfig).subscribe(data => {
      if (data.type > 0) {
        this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        //let name = this.transactionsPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.reportPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        // if (data.body)
        //   response = data.body[this.reportPageInfo.attributeName]
        if (data.body) {
          if (data?.body?.ReconPmts) {
            response = data.body.ReconPmts[this.reportPageInfo.attributeName]

          } else if (data?.body?.UnreconPmts) {
            response = data.body.UnreconPmts[this.reportPageInfo.attributeName]


          } else {
            response = data.body[this.reportPageInfo.attributeName].Details
          }
        }
        if (data.headers)
          totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        this.sendxlsx(id, response, name, totalRecordsCount, percent);

      }
    });
  }

  sendxlsx(id, data: any, name: string, totalCount: string, percent) {
    //Start new changes for selectablecolumndetails download in csv
    if (data) {
      const headers = [];
      let dataKeys = []
      let ex = []
      Object.keys(data[0]).forEach(key => { //console.log('key',key)

        this.pageConfig2.selectableColumns.forEach((o: any) => {  //console.log('o',o)

          if (o.flag == keyWords.true && key == o.id && key != keyWords.extRefDetailsData) {
            headers.push('\ufeff' + o.name);
            dataKeys.push(o.id);

          } else if (o.flag != keyWords.true && key != o.id && key == keyWords.extRefDetailsData) {
            ex.push(o.id, keyWords.extRefDetailsData)
          }
        })
      })
      const headers2 = []
      let dataKeys2 = []
      let ex2 = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig.selectableColumnsDetails?.forEach((e: any) => {
          if (e.flag == keyWords.true && key == e.id) {
            headers2.push('\ufeff' + e.name);
            dataKeys2.push(e.id);
          } else if (e.flag != keyWords.true && key != e.id) {
            ex2.push(e.id)
          }
        })
      })
      let mainHeader = headers.concat(headers2)
      let maindataKeys = dataKeys.concat(dataKeys2)
      let falseKeys = ex.concat(ex2)
      let excelObj = {
        updateData: data,
        mainHeader: mainHeader,
        maindataKeys: maindataKeys,
        falseKeys: falseKeys,
        id: id,
        name: name,
        sheet: this.reportPageInfo.pageName,
        totalCount: totalCount,
        blob: null,
        date: new Date(),
        percent: percent,
        pageConfig: this.pageConfig2
      }
      this.excelService.exportAsExcelFile(excelObj);
    }
  }


  downloadFile(file) {
    this.restApiService.downloadFile(ApiPaths.downloadFile, file.data.fileLocation).subscribe(data => {
      saveAs(data, file.data.fileName)
    });
  }

  saveCSVToSession(id, data: any, name: string, totalCount: string, percent) {
    const replacer = (key: any, value: any) => value === null ? '' : value; // specify how you want to handle null values here
    let csvArray;
    if (data) {
      const headers = [];
      let dataKeys = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig2.selectableColumns.forEach((o: any) => {

          if (o.flag == keyWords.true && key == o.id) {
            headers.push('\ufeff' + o.name);
            dataKeys.push(o.id);
          }
        })
      })
      let csv = data.map((row: any) => dataKeys.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(headers.join(','));
      csvArray = csv.join('\r\n');
    }

    var fileReader = new FileReader();

    fileReader.onload = (evt) => {
      var result = evt.target.result;

      let storeData = {
        id: id,
        name: name,
        totalCount: totalCount,
        blob: result,
        date: new Date(),
        percent: percent
      }

      let index = this.downloadManagerService.exportedFiles.findIndex(o => o.id == id);

      if (index >= 0) {
        this.downloadManagerService.exportedFiles[index] = storeData;
      } else {
        storeData.percent = 0;
        this.downloadManagerService.exportedFiles.push(storeData);
      }


      try {
        sessionStorage.setItem(keyWords.exportFiles, JSON.stringify(this.downloadManagerService.exportedFiles));
      } catch (e) {
        // console.log("Storage failed: " + e);
      }
    };

    fileReader.readAsDataURL(new Blob([csvArray], { type: keyWords.csvText }));

  }

  sendpdf(pdfFlag: boolean, id, data: any, name: string, totalCount: string, percent) {
    pdfFlag = true;
    const replacer = (key: any, value: any) => value === null ? '' : value; // specify how you want to handle null values here
    let pdfArray;
    if (data) {
      const headers = [];
      let dataKeys = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig2.selectableColumns.forEach((o: any) => {
          if (o.flag == "true" && key == o.id) {
            headers.push(o.name);
            dataKeys.push(o.id);
          }
        })
      })
      let pdf = data.map((row: any) => dataKeys.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','));
      pdf.unshift(headers.join(','));
      pdfArray = pdf.join('\r\n');

    }

    var fileReader = new FileReader();

    fileReader.onload = (evt) => {
      var result = evt.target.result;

      let storeData = {
        pdfFlag: pdfFlag,
        id: id,
        name: name,
        totalCount: totalCount,
        blob: result,
        date: new Date(),
        percent: percent
      }

      let index = this.downloadManagerService.exportedFiles.findIndex(o => o.id == id);

      if (index >= 0) {
        this.downloadManagerService.exportedFiles[index] = storeData;
      } else {
        storeData.percent = 0;
        this.downloadManagerService.exportedFiles.push(storeData);
      }


      try {
        sessionStorage.setItem(keyWords.exportFiles, JSON.stringify(this.downloadManagerService.exportedFiles));
      } catch (e) {

      }
    };

    fileReader.readAsDataURL(new Blob([pdfArray], { type: keyWords.pdfText }));
  }

  // Making selectable column dropdown change position dynamically accordingly to browser window ( Start )
  @HostListener('mousewheel', ['$event'])
  onMousewheel(event) { //console.log(window)
    if (this.dropdown.isOpen == true) {
      this.togglePosition();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) { //console.log(window)
    if (this.dropdown.isOpen == true) {
      this.togglePosition();
    }
  }

  togglePosition() { //console.log('toggle')
    var dropdownContainer = document.querySelector(".column-dropdown")
    var position = dropdownContainer.getBoundingClientRect().top;
    var buttonHeight = dropdownContainer.getBoundingClientRect().height;
    var menuHeight
    menuHeight = 350
    var $win = $(window);
    if (position > menuHeight && $win.height() - position < buttonHeight + menuHeight) {
      const scroll = document.querySelector<HTMLElement>('.columnScrolling_Dropdown')!;
      if (scroll != null) { //console.log('scroll 1',scroll)
        scroll.style.transform = 'translateY(-446px)';
      }
    } else if (position < menuHeight && $win.height() - position > buttonHeight + menuHeight) {
      const scroll = document.querySelector<HTMLElement>('.columnScrolling_Dropdown')!;
      if (scroll != null) { //console.log('scroll 2',scroll)
        scroll.style.transform = 'translateY(0px)';
      }
    }
  }
  // Making selectable column dropdown change position dynamically accordingly to browser window ( End )

}