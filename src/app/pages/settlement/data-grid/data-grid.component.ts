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
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from 'src/app/services/loader.service';
import { keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from 'jquery';
import { DatePipe } from '@angular/common';
import { ExcelServicesService } from 'src/app/services/excel.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  @Input() dataSource;
  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  @Input() filterss;
  @Input() pageSettings;
  @Input() showNoRecords;
  @Input() settlementPageInfo;
  @Input() responseCount;
  @Input() serviceNotResponded;
  @Output() applyFiltersEvent = new EventEmitter();
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGrid: DxDataGridComponent;
  pixelWidth = require('string-pixel-width');
  columns = [];
  page: 1;
  primaryKey: string;
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  tabIndex: number = 0;
  copySelectableColumns: any
  currentTimestamp: any = new (Date)
  showInfo = true;
  showNavButtons = true;
  rtlEnabled = false //will change according to language selection
  isUserHasAccess: any;
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  pdfDataSource: any = [];
  generatePdfDetailsList: any = [];
  totalRecordsCount: any;
  pdfPageName: any
  pageNo:any

  constructor(private notification: NotificationService, private columnSettingsModalService: ColumnSettingsModalService, private clipboard: Clipboard, //private extRefDetailsModalService: ExtRefDetailsModalService,
    private store: StoreService, private restApiService: RestApiService, private downloadManagerService: DownloadManagerService, private translate: TranslateService, private loaderService: LoaderService, private datepipe: DatePipe, private excelService: ExcelServicesService, private activeRoute: ActivatedRoute) {
    this.cellTemplate = this.cellTemplate.bind(this);
  }

  ngOnInit(): void {
    this.currentTimestamp = this.datepipe.transform(this.currentTimestamp, 'yyyyMMddTHHmmss');
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    // console.log('filters',this.filterss)
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
    this.selectableColumns = this.pageConfig.selectableColumns;
    this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
    setTimeout(() => {
      this.columns = [];
      this.setGridColumns();
    }, 10);
    this.store.selectableColumns.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumns = <any>data;
      this.selectableColumns = this.pageConfig?.selectableColumns
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

          }
        })
      })
    });
  }

  setGridColumns() {
    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {

      let hasSorting = o.sorting//this.pageConfig?.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == 'true') {

        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');
        if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }
        if (o.type == keyWords.amount) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, width: 144, cssClass: keyWords.amountTotalRevenue, caption: o[keyWords.captionName], allowSorting: hasSorting ? true : false, adaptive: true, sortingMethod: () => { return false; } });

        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, width: 144, cssClass: keyWords.amountTotalRevenue, caption: o[keyWords.captionName], allowSorting: hasSorting ? true : false, adaptive: true, sortingMethod: () => { return false; } });

        } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }

        else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        }

      }

    });
    this.primaryKey = this.columns[0].dataField;
    if (this.settlementPageInfo.groupingEnabled) {
      this.primaryKey = keyWords.primaryKeyDate;

      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false, })
    } else {
      this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false })
    }

    let sticky = document.getElementById(keyWords.settlementGridContainer).children[0].children[4];
    sticky.classList.add(keyWords.fixedHeaders);
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
      this.applyFiltersEvent.emit(this.filterss);
    }
  }

  onPageChange(pageNumber: any) {
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.applyFiltersEvent.emit(this.filterss);
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

  onwheel() {
    const container = document.getElementsByClassName(keyWords.dxSubmenu)[0];
    if (container?.querySelector('span')?.innerHTML == 'Copy') {
      container.remove()
    }
  }
  apply() {
    if (this.tabIndex == 0) {
      let allDeSelected = this.selectableColumns.filter(o => o.flag == "true").length == 0
      if (allDeSelected) {
        this.notification.showError(this.translate.instant(keyWords.errColumnSelection));
        return;
      }
    } else {
      let allDeSelected = this.selectableColumnsDetails.filter(o => o.flag == "true").length == 0
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

  cancel() {
    this.store.selectableColumns.next(this.copySelectableColumns)
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
    this.filterss = deleteFilters(this.filterss)
    this.filterss.SearchFilters.fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filterss.SearchFilters.toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.settlementPageInfo.url, this.filterss, headerConfig).subscribe(data => {
      if (data.type > 0) {
        this.filterss.SearchFilters.fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filterss.SearchFilters.toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        let name = this.settlementPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.filterss.SearchFilters.fromDate + '_' + this.filterss.SearchFilters.toDate;
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body)
          response = data.body[this.settlementPageInfo.attributeName]
        if (data.headers)
          totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        this.saveCSVToSession(id, response, name, totalRecordsCount, percent);
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
    this.filterss = deleteFilters(this.filterss)
    this.filterss.SearchFilters.fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filterss.SearchFilters.toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.settlementPageInfo.url, this.filterss, headerConfig).subscribe(data => {
      if (data.type > 0) {
        this.filterss.SearchFilters.fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filterss.SearchFilters.toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        let name = this.settlementPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.filterss.SearchFilters.fromDate + '_' + this.filterss.SearchFilters.toDate;
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body)
          response = data.body[this.settlementPageInfo.attributeName]
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

        this.pageConfig.selectableColumns.forEach((o: any) => {  //console.log('o',o)

          if (o.flag == "true" && key == o.id && key != 'extRefDetails') {
            headers.push('\ufeff' + o.name);
            dataKeys.push(o.id);

          } else if (o.flag != "true" && key != o.id && key == 'extRefDetails') {
            ex.push(o.id, 'extRefDetails')
          }
        })
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
        sheet: this.settlementPageInfo.pageName,
        totalCount: totalCount,
        blob: null,
        date: new Date(),
        percent: percent,
        pageConfig: this.pageConfig
      }
      this.excelService.exportAsExcelFile(excelObj);
    }
  }

  pdfdownload() {

    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(this.translate.instant(keyWords.exportDownload), keyWords.showInfo)
    let data = keyWords.reqTypeDownload

    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data);
    //let file: any
    let response = null;
    let id = new Date().getMilliseconds();
    let pdfFlag = true;
    let percent = 0;
    this.downloadManagerService.isDownloading = true;
    this.filterss = deleteFilters(this.filterss)
    // console.log('filterssss',this.filters.SearchFilters)

    this.filterss.SearchFilters.fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filterss.SearchFilters.toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.settlementPageInfo.url, this.filterss, headerConfig).subscribe(data => {  //console.log('data',data)
      if (data.type > 0) {
        let fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        let toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        // let name = this.reportPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.lang == 'en' ? this.settlementPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? fromDate + '_' + toDate + '_' + 'DTR' + '_' + this.settlementPageInfo.downloadName : '';
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        // let totalRecordsCount;
        let totalRecordsCount;
        if (data.body) {
          response = data.body[this.settlementPageInfo.attributeName]
          // this.pdfDataSource = data.body[this.transactionsPageInfo.attributeName]
          this.pdfDataSource = data.body[this.settlementPageInfo.attributeName]
          // this.downloadPDF();
          this.filterss.SearchFilters.fromDate = this.datepipe.transform(this.filterss.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          this.filterss.SearchFilters.toDate = this.datepipe.transform(this.filterss.SearchFilters.toDate, 'yyyyMMddTHHmmss');
          let pdfData: any = {
            //file: this.file,
            label: this.settlementPageInfo.downloadName,
            fromdate: this.filterss.SearchFilters.fromDate,
            todate: this.filterss.SearchFilters.toDate,
            currentTimestamp: this.currentTimestamp,
            pageConfig: this.pageConfig,
            pageName: this.pdfPageName,//this.settlementPageInfo.pageName,
            totalRecordsCount: this.totalRecordsCount,
            dataSource: this.pdfDataSource,
            selectableColumns: this.selectableColumns
          }
          this.downloadManagerService.setdocument(pdfData)
        }
        if (data.headers) {
          this.totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        }
        //this.sendpdf(id,pdfFlag,response,name,totalRecordsCount,percent)
        this.sendpdf(pdfFlag, id, response, name, this.totalRecordsCount, percent);
      }
    });

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
          if (o.flag == "true" && key == o.id && key != 'extRefDetails') {
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
        this.pageConfig.selectableColumns.forEach((o: any) => {
          if (o.flag == "true" && key == o.id) {
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
      }
    };

    fileReader.readAsDataURL(new Blob([csvArray], { type: keyWords.csvText }));
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
        scroll.style.transform = 'translateY(-455px)';
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
