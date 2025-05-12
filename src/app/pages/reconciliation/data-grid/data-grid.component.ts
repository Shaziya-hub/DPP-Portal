import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { saveAs } from "file-saver";
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import { DownloadManagerService } from 'src/app/components/download-manager/download-manager.service';
import { PageConfig } from 'src/app/model/page-config';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, customizeText2, deepClone, deleteFilters, haveEnoughSessionStorageSpace, isUserHasAccess } from 'src/app/shared/utils';
import { ActivatedRoute } from '@angular/router';
import { doubleClick } from '../../../shared/utils';
import { Clipboard } from '@angular/cdk/clipboard';
import { require } from 'string-pixel-width';
import { ReconciliationComponent } from '../reconciliation.component';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from 'src/app/services/loader.service';
import { colors, dropdown, keyWords } from 'src/app/shared/constant';
import { getTextWidth } from 'get-text-width';
import { DatePipe } from '@angular/common';
import { customizeText } from 'src/app/shared/utils';
import { ExcelServicesService } from 'src/app/services/excel.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit, OnChanges {
  @Input() dataSource;
  @Input() logsdataSource
  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  @Input() filters;
  @Input() pageSettings;
  @Input() showNoRecords;
  @Input() reconciliationPageInfo;
  @Input() responseCount;
  @Input() serviceNotResponded;
  @Input() primaykeydata
  @Output() applyFiltersEvent = new EventEmitter();
  @Output() applyPmtCards = new EventEmitter();
  @Output() batchIdEvent = new EventEmitter();
  @Output() actionIdEvent = new EventEmitter();

  @ViewChild(DxDataGridComponent, {
    static: false
  })
  dataGrid: DxDataGridComponent;
  pixelWidth = require("string-pixel-width");
  dppcolumnDetails = [];
  merchatncolumns = []
  page: 1;
  primaryKey: string;
  commondetails = [];
  comm = [];
  columns = [];
  showInfo = true;
  showNavButtons = true;
  rtlEnabled = false //will change according to language selection
  commondataSource = [];
  topheader = []
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  tabIndex: number = 0;
  copySelectableColumns: any;
  pmtCard: boolean
  obj: any
  pdfPageName: any
  showDownLoad: boolean = false;
  isUserHasAccess: any;
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  currentTimestamp: any = new (Date)
  pageNo:any

  constructor(private route: ActivatedRoute, private notification: NotificationService, private columnSettingsModalService: ColumnSettingsModalService, private activeRoute: ActivatedRoute,
    private store: StoreService, private restApiService: RestApiService, private downloadManagerService: DownloadManagerService, private clipboard: Clipboard, private reconciliationComponent: ReconciliationComponent, private loaderService: LoaderService,
    private translate: TranslateService, private datepipe: DatePipe, private excelService: ExcelServicesService) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
    this.batchIdCellTemplate = this.batchIdCellTemplate.bind(this);
    //this.extRefDetailsCellTemplate = this.extRefDetailsCellTemplate.bind(this);
  }

  ngOnInit(): void {
    this.currentTimestamp = this.datepipe.transform(this.currentTimestamp, 'yyyyMMddTHHmmss');
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    this.pmtCard = false
    this.selectableColumns = this.pageConfig.selectableColumns;
    this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
    let width = getTextWidth("Total Unrecon Amount");
    // console.log('Total Unrecon Amount',width,'************************','Total Trans Fees',getTextWidth("Total Trans Fees"))
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
            //  console.log('pdfPageName',this.pdfPageName)
          }
        })
      })
    });

  }
  ngOnChanges(): void { //console.log('primaykey',this.primaykeydata)
    this.pmtCard = false
    setTimeout(() => {
      //this.columns = [];
      // this.merchatncolumns = [];
      // this.dppcolumnDetails = [];
      this.columns = [];
      this.setGridColumns();
    }, 10);
    this.store.selectableColumns.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumns = <any>data;
      this.selectableColumns = this.pageConfig?.selectableColumns;
      this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
      this.setGridColumns();
    })
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
    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => { //console.log('o',o)
      /* sortingColumns [] is not getting passed in pageConfig,
         instead sorting flag is being passed in selectableColumns 
       */
      let hasSorting = o.sorting //this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == keyWords.true) { //console.log('columns',this.columns)

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

        if (o.type == keyWords.amount) { //console.log('Trx Amount',getTextWidth('Trx Amount'),'------------','Applied Amount',getTextWidth('Applied Amount'));

          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.appliedAmtTextCss, width: getTextWidth(o[keyWords.captionName]) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == keyWords.numeric) { //console.log('pixelWidth',getTextWidth('Total Unrecon Amount'),'-----------------------',getTextWidth('Total trans fees'))
          this.columns.push({ dataField: o[keyWords.dataFiledId], name: o[keyWords.captionName], alignment: keyWords.allignRight, cssClass: keyWords.appliedAmtTextCss, caption: o[keyWords.captionName], width: getTextWidth(o[keyWords.captionName]) + 50, allowSorting: o.sorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        }
        else if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.reconstatus) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.cellTemplate });
        }
        else if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.fileLocation) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.cellTemplate });

        } else if (o.type == keyWords.numeric) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.right, caption: o[keyWords.captionName], cssClass: keyWords.amountTextCss, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false });
        }
        else if (o[keyWords.dataFiledId].toLowerCase().indexOf('pmt') > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, cssClass: keyWords.pmtText, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        } else if (o[keyWords.dataFiledId].toLowerCase().indexOf('batchid') > -1 && (this.reconciliationPageInfo.pageName == keyWords.reconEnterpriceLogsName)) {
          // this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass:keyWords.transIdCss, adaptive: true, sortingMethod: () => { return false; },cellTemplate : this.batchIdCellTemplate});
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], cssClass: keyWords.transIdCss, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.batchIdCellTemplate });
        } else if (o.type == keyWords.amount) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], name: o[keyWords.captionName], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: 'ttlFees-text', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: o.sorting, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o[keyWords.dataFiledId], name: o['name'], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: 'ttlFees-text', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: o.sorting, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        }

        else {
          // this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
          if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
            let preview = null
            preview = this.pageConfig.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);
            this.columns = []
            this.reconciliationPageInfo.responseColumn && this.reconciliationPageInfo.responseColumn.map((o: any) => {//console.log('o',o)

              /*
                      for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
                      no need for on click event from user
                    */
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
              else if (o.type == keyWords.amount) { //console.log('pixelWidth',getTextWidth('Total Unrecon Amount'),'-----------------------',getTextWidth('Total trans fees'))
                this.columns.push({ dataField: o[keyWords.dataFiledId], name: o[keyWords.captionName], alignment: keyWords.allignRight, cssClass: keyWords.appliedAmtTextCss, caption: o[keyWords.captionName], width: getTextWidth(o[keyWords.captionName]) + 50, allowSorting: o.sorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
              }
              else if (o.type == keyWords.numeric) { //console.log('pixelWidth',getTextWidth('Total Unrecon Amount'),'-----------------------',getTextWidth('Total trans fees'))
                this.columns.push({ dataField: o[keyWords.dataFiledId], name: o[keyWords.captionName], alignment: keyWords.allignRight, cssClass: keyWords.appliedAmtTextCss, caption: o[keyWords.captionName], width: getTextWidth(o[keyWords.captionName]) + 50, allowSorting: o.sorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
              }

              else {
                this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: o.sorting ? true : false, caption: o[keyWords.captionName], adaptive: true });
              }
            })
          }
          else {
            this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true });
          }

        }

      }
      else if (o.flag == keyWords.true && !this.pageConfig.sortingColumns) {
        this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: false, caption: o[keyWords.captionName], adaptive: true });
      }
    });

    if (this.reconciliationPageInfo.groupingEnabled) {
      // console.log('datasource',this.dataSource)
      this.primaryKey = this.primaykeydata;
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false, cellTemplate: this.actionCellTemplate })
    }
    else {
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false })
    }

    let sticky = document.getElementById(keyWords.reconcilationGridContainer)?.children[0].children[4];
    sticky?.classList.add(keyWords.fixedHeaders);

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
    // this.copySelectableColumns = selectableColumns
    let data = keyWords.requestTypeEdit
    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data)

    return this.restApiService.updateSelectableColumns(selectableColumns, selectableColumnsDetails, headerConfig).subscribe(data => {

      this.store.selectableColumns.next(selectableColumns);
      this.store.selectableColumnsDetails.next(selectableColumnsDetails);
      //this.close();
      this.loaderService.hide();
    });
  }

  cancel() {
    this.store.selectableColumns.next(this.copySelectableColumns)
  }


  // download icon
  cellTemplate(container, options) {
    //console.log('option',options)
    let parentSpan = document.createElement('SPAN')
    let p = document.createElement('P')
    p.style.color = options.displayValue == dropdown.mismatchesOnly ? '#E53012' : '';
    let textNode = document.createTextNode(options.displayValue);
    p.appendChild(textNode)
    parentSpan.appendChild(p)

    return parentSpan;
  }


  actionCellTemplate(container, options) {
    keyWords.recondetailConfig[keyWords.pageNumber] = "1"
    let div = document.createElement('div')
    let a = document.createElement('a');
    a.classList.add(keyWords.colorBlue)
    // let html = '<i class="fa fa-plus"></i>'
    let html = keyWords.imgPlusDetail
    if (this.dataGrid.instance.isRowExpanded(options.key)) {
      //html = '<i class="fa fa-minus"></i>'
      html = keyWords.imgMinusDetail
      this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName ? this.showDownLoad = true : this.showDownLoad = false
    }
    a.innerHTML = html;
    a.onclick = () => {
      if (this.dataGrid.instance.isRowExpanded(options.key)) {
        this.dataGrid.instance.collapseRow(options.key);
        this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName ? this.showDownLoad = false : ''

      } else {
        options.component.collapseAll(-1)
        this.dataGrid.instance.expandRow(options.key);
      }
    }
    div.append(a);
    return div;
  }

  batchIdCellTemplate(container, options) { //console.log('options',options)
    let div = document.createElement('DIV');
    div.setAttribute("data-toggle", "tooltip");
    div.setAttribute("data-placement", "top");
    div.setAttribute("title", options?.key);
    let a = document.createElement('A')
    let html = '<span>' + options.key.batchId + '</span>'
    //  a.style.color = '#000000'
    //  a.style.pointerEvents = "all"
    a.innerHTML = html
    a.onclick = () => {
      this.batchIdEvent.emit(options.key.batchId);
    }

    div.append(a);
    return div;
  }

  //On hover row is being highlighted
  onFocusedCellChanging(e) {
    e.isHighlighted = false;
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
  onwheel() {
    const container = document.getElementsByClassName(keyWords.dxSubmenu)[0];
    if (container?.querySelector('span')?.innerHTML == keyWords.copy) {
      container.remove()
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
      this.headerConfig[keyWords.sortingColumn] = el.dataField;
      this.headerConfig[keyWords.sortingOrder] = el.sortOrder.toUpperCase()
      this.headerConfig[keyWords.pageNumber] = this.pageNo ? this.pageNo : String(1);
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  onPageChange(pageNumber: any) {
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.pmtCard = true

      this.applyPmtCards.emit(this.pmtCard)
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  selectColumns() {
    this.columnSettingsModalService.getSelectableColumns(this.headerConfig);
  }

  customizeColumns(cols: any[]) {
    cols.forEach(col => col.headerCellTemplate = keyWords.header);
  }

  customheader(cols: any[]) {
    cols[0].map(col => col.headerCellTemplate = keyWords.topHeader);
  }
  downloadEvent(obj: any) {
    this.obj = obj
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


    if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
      let headerConfig = deepClone(this.obj?.header);
      Object.assign(headerConfig, data);
      let response = null;
      let id = new Date().getMilliseconds();
      let percent = 0;
      this.downloadManagerService.isDownloading = true;
      this.filters = deleteFilters(this.obj?.paginationFilters)
      this.restApiService.downloadTableData(this.obj?.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
          //let name = this.obj?.downloadName+'_' +this.currentTimestamp + '_' + this.obj?.fromDate  + '_' + this.obj?.toDate;
          let name = this.lang == 'en' ? this.obj?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.obj?.fromDate + '_' + this.obj?.toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + this.obj?.fromDate + '_' + this.obj?.toDate + '_' + this.obj?.downloadName : '';
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body)
            response = data.body[this.obj?.attributeName]
          if (data.headers)
            totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
          this.saveCSVToSession(id, response, name, totalRecordsCount, percent);
        }
      });
    } else {
      let headerConfig = deepClone(this.headerConfig);
      Object.assign(headerConfig, data);
      let response = null;
      let id = new Date().getMilliseconds();
      let percent = 0;
      this.downloadManagerService.isDownloading = true;
      this.filters = deleteFilters(this.filters)
      this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
      this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
      this.restApiService.downloadTableData(this.reconciliationPageInfo.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
          //let name = this.reconciliationPageInfo?.downloadName+'_' +this.currentTimestamp + '_' + this.filters.SearchFilters.fromDate  + '_' + this.filters.SearchFilters.toDate;
          let name = this.lang == 'en' ? this.reconciliationPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate + '_' + this.reconciliationPageInfo.downloadName : '';
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body)
            response = data.body[this.reconciliationPageInfo.attributeName]
          if (data.headers)
            totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
          this.saveCSVToSession(id, response, name, totalRecordsCount, percent);
        }
      });
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
        if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
          this.pageConfig.selectableColumnsDetails.forEach((o: any) => {
            if (o.flag == "true" && key == o.id) {
              headers.push('\ufeff' + o.name);
              dataKeys.push(o.id);
            }
          })
        } else {
          this.pageConfig.selectableColumns.forEach((o: any) => {
            if (o.flag == "true" && key == o.id) {
              headers.push('\ufeff' + o.name);
              dataKeys.push(o.id);
            }
          })
        }

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
      }
    };

    fileReader.readAsDataURL(new Blob([csvArray], { type: keyWords.csvText }));
  }


  downloadXlsx() {
    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(this.translate.instant(keyWords.exportDownload), keyWords.showInfo)
    let data = {
      "page-number": "1",
      "request-type": "download"
    }


    if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
      let headerConfig = deepClone(this.obj?.header);
      Object.assign(headerConfig, data);
      let response = null;
      let id = new Date().getMilliseconds();
      let percent = 0;
      this.downloadManagerService.isDownloading = true;
      this.filters = deleteFilters(this.obj?.paginationFilters)
      this.restApiService.downloadTableData(this.obj?.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let name = this.lang == 'en' ? this.obj?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.obj?.fromDate + '_' + this.obj?.toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + this.obj?.fromDate + '_' + this.obj?.toDate + '_' + this.obj?.downloadName : '';
          // let name = this.obj?.downloadName+'_' +this.currentTimestamp + '_' + this.obj?.fromDate + '_' + this.obj?.toDate;
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body)
            response = data.body[this.obj?.attributeName]
          if (data.headers)
            totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
          this.sendxlsx(id, response, name, totalRecordsCount, percent);
        }
      });
    } else {
      let headerConfig = deepClone(this.headerConfig);
      Object.assign(headerConfig, data);
      let response = null;
      let id = new Date().getMilliseconds();
      let percent = 0;
      this.downloadManagerService.isDownloading = true;
      this.filters = deleteFilters(this.filters)
      this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
      this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
      this.restApiService.downloadTableData(this.reconciliationPageInfo.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
          let name = this.lang == 'en' ? this.reconciliationPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate + '_' + this.reconciliationPageInfo.downloadName : '';
          //let name = this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate + '_' + this.reconciliationPageInfo.downloadName;
          // console.log("fromdate", name)
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body)
            response = data.body[this.reconciliationPageInfo.attributeName]
          if (data.headers)
            totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
          this.sendxlsx(id, response, name, totalRecordsCount, percent);
        }
      });
    }
  }

  sendxlsx(id, data: any, name: string, totalCount: string, percent) {
    //Start new changes for selectablecolumndetails download in csv
    if (data) {
      const headers = [];
      let dataKeys = []
      let ex = []

      Object.keys(data[0]).forEach(key => {
        if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
          this.pageConfig.selectableColumnsDetails.forEach((o: any) => {
            if (o.flag == keyWords.true && key == o.id) {
              headers.push('\ufeff' + o.name);
              dataKeys.push(o.id);
            } else if (o.flag != "true" && key != o.id) {
              ex.push(o.id)
            }
          })
        } else {
          this.pageConfig.selectableColumns.forEach((o: any) => {
            if (o.flag == keyWords.true && key == o.id) {
              headers.push('\ufeff' + o.name);
              dataKeys.push(o.id);
            } else if (o.flag != keyWords.true && key != o.id) {
              ex.push(o.id)
            }
          })
        }
      })

      let mainHeader = headers
      let maindataKeys = dataKeys
      let falseKeys = ex
      let excelObj = {
        updateData: data,
        mainHeader: mainHeader,
        maindataKeys: maindataKeys,
        falseKeys: falseKeys,
        id: id,
        name: name,
        sheet: this.reconciliationPageInfo.pageName,
        totalCount: totalCount,
        blob: null,
        date: new Date(),
        percent: percent,
        pageConfig: this.pageConfig
      }
      this.excelService.exportAsExcelFile(excelObj);
    }
  }

  pdfDataSource: any = [];
  file: any
  pdfdownload() {
    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(this.translate.instant(keyWords.exportDownload), keyWords.showInfo)
    let data = {
      "page-number": "1",
      "request-type": "download"
    }


    if (this.reconciliationPageInfo.pageName == keyWords.reconLogsPageName) {
      let headerConfig = deepClone(this.obj?.header);
      Object.assign(headerConfig, data);
      let response = null;
      let id = new Date().getMilliseconds();
      let pdfFlag = true;
      let percent = 0;
      this.downloadManagerService.isDownloading = true;
      this.filters = deleteFilters(this.obj?.paginationFilters)
      this.restApiService.downloadTableData(this.obj?.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let name = this.lang == 'en' ? this.obj?.downloadName + '_' + this.currentTimestamp + '_' + this.obj?.fromDate + '_' + this.obj?.toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + this.obj?.fromDate + '_' + this.obj?.toDate + '_' + this.obj?.downloadName : '';
          // let name = this.obj?.downloadName+'_' +this.currentTimestamp + '_' + this.obj?.fromDate + '_' + this.obj?.toDate;
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          // if (data.body)
          //   response = data.body[this.obj?.attributeName]
          if (data.body) {
            response = data.body[this.reconciliationPageInfo.attributeName]
            // this.pdfDataSource = data.body[this.transactionsPageInfo.attributeName]
            this.pdfDataSource = data.body[this.obj.attributeName]
            // console.log('pdfDataSource',this.pdfDataSource);
            // this.downloadPDF();
            // this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
            // this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
            let pdfData: any = {
              //file: this.file,
              label: this.reconciliationPageInfo.downloadName,
              fromdate: this.obj?.fromDate,//this.filters.SearchFilters.fromDate,
              todate: this.obj?.toDate,
              currentTimestamp: this.currentTimestamp,
              pageConfig: this.pageConfig,
              pageName: this.pdfPageName,//this.reconciliationPageInfo.pageName,
              totalRecordsCount: data.headers.get(keyWords.ttlRecordsCnt),
              dataSource: this.pdfDataSource,//this.obj.commondataSource,
              selectableColumns: this.obj.responseColumn
            }
            this.downloadManagerService.setdocument(pdfData)
          }
          if (data.headers)
            totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
          this.sendpdf(pdfFlag, id, response, name, totalRecordsCount, percent);
        }
      });
    } else {
      let headerConfig = deepClone(this.headerConfig);
      Object.assign(headerConfig, data);
      let response = null;
      let id = new Date().getMilliseconds();
      let percent = 0;
      let pdfFlag = true;
      this.downloadManagerService.isDownloading = true;
      this.filters = deleteFilters(this.filters)
      this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
      this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
      this.restApiService.downloadTableData(this.reconciliationPageInfo.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');

          let name = this.lang == 'en' ? this.reconciliationPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate + '_' + this.reconciliationPageInfo.downloadName : '';

          //  console.log("fromdate", name)
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body) {
            response = data.body[this.reconciliationPageInfo.attributeName]
            this.pdfDataSource = data.body[this.reconciliationPageInfo.attributeName]
            // this.downloadPDF();
            this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
            this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
            let pdfData: any = {
              file: this.file,
              label: this.reconciliationPageInfo.downloadName,
              fromdate: this.filters.SearchFilters.fromDate,
              todate: this.filters.SearchFilters.toDate,
              currentTimestamp: this.currentTimestamp,
              pageConfig: this.pageConfig,
              pageName: this.pdfPageName,//this.transactionsPageInfo.pageName,
              totalRecordsCount: data?.headers?.get(keyWords.ttlRecordsCnt),
              dataSource: this.pdfDataSource,
              selectableColumns: this.selectableColumns
            }
            this.downloadManagerService.setdocument(pdfData)
          }

          if (data.headers)
            totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
          this.sendpdf(pdfFlag, id, response, name, totalRecordsCount, percent);
        }
      });
    }
  }

  sendpdf(pdfFlag: boolean, id, data: any, name: string, totalCount: string, percent) {
    pdfFlag = true;
    const replacer = (key: any, value: any) => value === null ? '' : value; // specify how you want to handle null values here
    let pdfArray;
    if (data) {
      const headers = [];
      let dataKeys = [];

      Object.keys(data[0]).forEach(key => {
        this.pageConfig.selectableColumns.forEach((o: any) => {
          // if (o.flag == "true" && key == o.id) {
          //   headers.push(o.name);
          //   dataKeys.push(o.id);
          // }
          if (o.flag == keyWords.true && key == o.id && key != keyWords.extrefdetails) {
            headers.push('\ufeff' + o.name);
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

  getKeyByValue(object, value) {

    return object[value] //Object.keys(object).find(key =>object[key] === value?object[value]:"" );

  }

  applyFilters() {
    //this.filters=filters
    this.reconciliationComponent.applyFilters(this.filters);
  }


}
