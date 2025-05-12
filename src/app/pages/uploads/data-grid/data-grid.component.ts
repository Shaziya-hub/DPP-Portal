
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DROPDOWN_CONTROL_VALIDATION } from 'angular2-multiselect-dropdown/lib/multiselect.component';
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
import { doubleClick } from '../../../shared/utils';
import { DxTooltipComponent } from 'devextreme-angular';
import { on } from "devextreme/events"
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';

import * as $ from "jquery";
import { getTextWidth } from 'get-text-width';
import { DatePipe } from '@angular/common';
import { ExcelServicesService } from 'src/app/services/excel.service';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  @Input() dataSource;
  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  @Input() filters;
  @Input() pageSettings;
  @Input() showNoRecords;
  @Input() uploadsPageInfo;
  @Input() responseCount;
  @Input() serviceNotResponded;
  @Input() primaykeydata
  @Output() applyFiltersEvent = new EventEmitter();
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
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  extRefDetails: any[] = [];
  tabIndex: number = 0;
  logdetails: any
  header: any
  head: boolean = false
  copySelectableColumns: any
  copySelectableColumnsDetails: any
  obj: any
  pdfPageName: any
  selectedLang: any
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  currentTimestamp: any = new (Date)
  pageNo:any


  constructor(private notification: NotificationService, private activeRoute: ActivatedRoute, private columnSettingsModalService: ColumnSettingsModalService, private store: StoreService, private restApiService: RestApiService, private downloadManagerService: DownloadManagerService, private clipboard: Clipboard, private translate: TranslateService, private router: Router, private loaderService: LoaderService, private datepipe: DatePipe, private excelService: ExcelServicesService) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
    // this.extRefDetailsCellTemplate = this.extRefDetailsCellTemplate.bind(this);
  }

  ngOnInit(): void {
    this.currentTimestamp = this.datepipe.transform(this.currentTimestamp, 'yyyyMMddTHHmmss');
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    //isUserHasAccess:any=isUserHasAccess;
    this.header = this.headerConfig
    this.selectableColumns = this.pageConfig.selectableColumns;
    this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
    this.selectableColumnsDetails = this.pageConfig.selectableColumnsDetails;
    this.pageConfig?.selectableColumnsDetails ? this.copySelectableColumnsDetails = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumnsDetails)) : "";
    //this.dataSource[0].profileId.trim();
   // this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
   this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
   setTimeout(() => {
     this.columns = [];
     this.setGridColumns();
   }, 10);
   this.store.selectableColumns.subscribe(data => {
     this.columns = [];
     this.pageConfig.selectableColumns = <any>data;
     this.selectableColumns = this.pageConfig?.selectableColumns;
     this.pageConfig?.selectableColumnsDetails ? this.copySelectableColumnsDetails = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumnsDetails)) : "";
     this.setGridColumns();
   })
   this.store.selectableColumnsDetails.subscribe(data => {

     this.columns = [];
     this.pageConfig.selectableColumnsDetails = <any>data;
     this.selectableColumnsDetails = this.pageConfig?.selectableColumnsDetails;
     this.pageConfig?.selectableColumnsDetails ? this.copySelectableColumnsDetails = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumnsDetails)) : "";
     this.setGridColumns();
   })
   this.selectedLang = localStorage.getItem('selectedLang')

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

  ngOnChanges(): void {
    setTimeout(() => {
      this.columns = [];
      this.setGridColumns();
    }, 10);
    this.store.selectableColumns.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumns = <any>data;
      this.setGridColumns();
    })
  }

  setGridColumns() {

    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
      let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == 'true') {
        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');
        if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }
        if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.amount) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.fileLocation) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.cellTemplate });
        } else if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.processstatus) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 85, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.createCirclecellTemplate })
        } else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        }

      }
    });
    // this.primaryKey = this.columns[0].dataField;

    if (this.uploadsPageInfo.groupingEnabled) {
      //this.primaryKey = 'transId';
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false, cellTemplate: this.actionCellTemplate })
    } else {
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false })
    }

    let sticky = document.getElementById(keyWords.uploadsgridContainer).children[0].children[4];
    sticky.classList.add(keyWords.fixedHeaders);
  }



  actionCellTemplate(container, options) {
    let div = document.createElement('div')
    let a = document.createElement('a');
    a.classList.add(keyWords.colorBlue);
    let html = keyWords.imgPlusDetail
    if (this.dataGrid.instance.isRowExpanded(options.key)) {
      html = keyWords.imgMinusDetail
    }
    a.innerHTML = html;
    a.onclick = () => {
      if (this.dataGrid.instance.isRowExpanded(options.key)) {
        this.dataGrid.instance.collapseRow(options.key)
      } else {
        options.component.collapseAll(-1)
        this.dataGrid.instance.expandRow(options.key)
      }
    }
    div.append(a);
    return div;
  }





  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.download ? div : div.classList.add(keyWords.disabledAccessed)
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
    cols.forEach(col => col.headerCellTemplate = keyWords.header

    );

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

    return this.restApiService.updateSelectableColumns(selectableColumns, selectableColumnsDetails, headerConfig).subscribe(data => {

      this.store.selectableColumns.next(selectableColumns);
      this.store.selectableColumnsDetails.next(selectableColumnsDetails);
      //this.close();
      this.loaderService.hide();
    });
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

    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data);
    let response = null;
    let id = new Date().getMilliseconds();
    let percent = 0;
    this.downloadManagerService.isDownloading = true;
    this.filters = deleteFilters(this.filters);
    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.uploadsPageInfo.url, this.filters, headerConfig).subscribe(data => {
      if (data.type > 0) {
        this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        //let name = this.transactionsPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.uploadsPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body)
          response = data.body[this.uploadsPageInfo.attributeName]
        if (data.headers)
          totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        this.saveCSVToSession(id, response, name, totalRecordsCount, percent);
      }
    });
  }

  downloadFile(file) {
    this.restApiService.downloadFile(ApiPaths.downloadFile, file.data.fileLocation).subscribe(data => {
      saveAs(data, file.data.fileName)
    });
  }

  saveCSVToSession(id, data: any, name: string, totalCount: string, percent) {
    const replacer = (key: any, value: any) => value === null ? '' : value; // specify how you want to handle null values here
    let csvArray;

    //Start new changes for selectablecolumndetails download in csv
    if (data) {
      const headers = [];
      let dataKeys = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig.selectableColumns.forEach((o: any) => {
          if (o.flag == "true" && key == o.id) {
            headers.push('\ufeff' + o.name);
            dataKeys.push(o.id);
          }
        })
      })
      const headers2 = []
      let dataKeys2 = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig.selectableColumnsDetails?.forEach((e: any) => {
          if (e.flag == "true" && key == e.id) {
            headers2.push('\ufeff' + e.name);
            dataKeys2.push(e.id);
          }
        })
      })
      let mainHeader = headers.concat(headers2)
      let maindataKeys = dataKeys.concat(dataKeys2)
      // console.log('maindataKeys',maindataKeys)
      // console.log('mainheaders',mainHeader)
      let csv = data.map((row: any) => maindataKeys.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(mainHeader.join(','));
      csvArray = csv.join('\r\n');
    }
    //End new changes for selectablecolumndetails download in csv

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


    if (this.uploadsPageInfo.pageName == keyWords.reconLogsPageName) {
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
      this.restApiService.downloadTableData(this.uploadsPageInfo.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
          let name = this.lang == 'en' ? this.uploadsPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate + '_' + this.uploadsPageInfo.downloadName : '';
          //let name = this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate + '_' + this.uploadsPageInfo.downloadName;
          // console.log("fromdate", name)
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body)
            response = data.body[this.uploadsPageInfo.attributeName]
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
        if (this.uploadsPageInfo.pageName == keyWords.reconLogsPageName) {
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
        sheet: this.uploadsPageInfo.pageName,
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


    if (this.uploadsPageInfo.pageName == keyWords.reconLogsPageName) {
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
            response = data.body[this.uploadsPageInfo.attributeName]
            // this.pdfDataSource = data.body[this.transactionsPageInfo.attributeName]
            this.pdfDataSource = data.body[this.obj.attributeName]
            // console.log('pdfDataSource',this.pdfDataSource);
            // this.downloadPDF();
            // this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
            // this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
            let pdfData: any = {
              //file: this.file,
              label: this.uploadsPageInfo.downloadName,
              fromdate: this.obj?.fromDate,//this.filters.SearchFilters.fromDate,
              todate: this.obj?.toDate,
              currentTimestamp: this.currentTimestamp,
              pageConfig: this.pageConfig,
              pageName: this.pdfPageName,//this.uploadsPageInfo.pageName,
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
      this.restApiService.downloadTableData(this.uploadsPageInfo.url, this.filters, headerConfig).subscribe(data => {
        if (data.type > 0) {
          let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');

          let name = this.lang == 'en' ? this.uploadsPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate + '_' + this.uploadsPageInfo.downloadName : '';

          //  console.log("fromdate", name)
          if (data.loaded && data.total) {
            percent = Math.round(data.loaded * 100 / data.total);
          }
          let totalRecordsCount;
          if (data.body) {
            response = data.body[this.uploadsPageInfo.attributeName]
            this.pdfDataSource = data.body[this.uploadsPageInfo.attributeName]
            // this.downloadPDF();
            this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
            this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
            let pdfData: any = {
              file: this.file,
              label: this.uploadsPageInfo.downloadName,
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

  //for status circle
  createCirclecellTemplate(container, options) {
    //console.log('container',container,options)
    let parentSpan = document.createElement('SPAN')
    let span = document.createElement('span');
    span.style.backgroundColor = options.displayValue == keyWords.completedUpperCase || options.displayValue == keyWords.processed ? '#09B39C' : options.displayValue == keyWords.failed2 || options.displayValue == keyWords.rejected || options.displayValue == keyWords.cancelled ? '#E53012' : '#F59D1A';
    let p = document.createElement('P')
    let textNode = document.createTextNode(options.displayValue);
    p.appendChild(textNode)
    parentSpan.appendChild(span);
    parentSpan.appendChild(p)

    return parentSpan;
  }

  cancel() {
 
      this.store.selectableColumns.next(this.copySelectableColumns);
      this.store.selectableColumnsDetails.next(this.copySelectableColumnsDetails)
    
  }

  // // Making selectable column dropdown change position dynamically accordingly to browser window ( Start )
  // @HostListener('mousewheel', ['$event'])
  // onMousewheel(event) { //console.log(window)
  //   if (this.dropdown.isOpen == true) {
  //     this.togglePosition();
  //   }
  // }

  // @HostListener('document:click', ['$event'])
  // clickout(event) { //console.log(window)
  //   if (this.dropdown.isOpen == true) {
  //     this.togglePosition();
  //   }
  // }
  // togglePosition() { //console.log('toggle')
  //   var dropdownContainer = document.querySelector(".column-dropdown")
  //   var position = dropdownContainer.getBoundingClientRect().top;
  //   var buttonHeight = dropdownContainer.getBoundingClientRect().height;
  //   var menuHeight
  //   menuHeight = 350
  //   var $win = $(window);
  //   if (position > menuHeight && $win.height() - position < buttonHeight + menuHeight) {
  //     const scroll = document.querySelector<HTMLElement>('.columnScrolling_Dropdown')!;
  //     if (scroll != null) { //console.log('scroll 1',scroll)
  //       scroll.style.transform = 'translateY(-455px)';
  //     }
  //   } else if (position < menuHeight && $win.height() - position > buttonHeight + menuHeight) {
  //     const scroll = document.querySelector<HTMLElement>('.columnScrolling_Dropdown')!;
  //     if (scroll != null) { //console.log('scroll 2',scroll)
  //       scroll.style.transform = 'translateY(0px)';
  //     }
  //   }
  // }
  // Making selectable column dropdown change position dynamically accordingly to browser window ( End )

}
