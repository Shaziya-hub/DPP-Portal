import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular'; //it is like bootstrap which makes web app responsive
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import { PageConfig } from 'src/app/model/page-config';
import { NotificationService } from 'src/app/services/notification.service';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, customizeText, customizeText2, deepClone, deleteFilters, haveEnoughSessionStorageSpace, isUserHasAccess } from 'src/app/shared/utils';
import { EndPointModalService } from '../endpoints-modal/endpoints-modal.service';
import { LimitslocksModalService } from '../limitslocks-modal/limitslocks-modal.service';
import { ParametersModalService } from '../parameters-modal/parameters-modal.service';
import { ProcessorConfigModalService } from '../processorconfig-modal/processorconfig-modal.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { require } from 'string-pixel-width';
import { saveAs } from "file-saver";
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from 'src/app/services/loader.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { DownloadManagerService } from 'src/app/components/download-manager/download-manager.service';
import { keyWords } from 'src/app/shared/constant';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";
import { getTextWidth } from 'get-text-width';
import { DatePipe } from '@angular/common';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'configurations-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  @Input() dataSource;
  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  @Input() filters;
  @Input() pageSettings;
  @Input() configurationsPageInfo;
  @Input() columns;
  @Input() primaryKey: string;
  @Input() showNoRecords;
  @Input() responseCount
  @Input() serviceNotResponded;
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  @Output() applyFiltersEvent = new EventEmitter();
  @Output() limitLocksService = new EventEmitter();

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;// it is a part f devExtreme dataGrid used for expanding ,collapsing etc data grid rows
  // columns=[]
  actionClick: Function;
  pixelWidth = require('string-pixel-width');
  page: 1;
  limitsLockServiceCall: boolean = false
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  tabIndex: number = 0;
  copySelectableColumns: any
  showInfo = true;
  showNavButtons = true;
  rtlEnabled = false //will change according to language selection
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  password: any;
  currentTimestamp: any = new (Date)
  pageNo:any

  constructor(private store: StoreService, private columnSettingsModalService: ColumnSettingsModalService, private parametersModalService: ParametersModalService, private limitslocksModalService: LimitslocksModalService, private processorConfigModalService: ProcessorConfigModalService, private endPointModalService: EndPointModalService, private sharedService: SharedService,
    private notification: NotificationService, private clipboard: Clipboard, private translate: TranslateService, private loaderService: LoaderService, private restApiService: RestApiService, private downloadManagerService: DownloadManagerService, private datepipe: DatePipe) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
    this.actionClick = (pageName, data) => this.onActionClick(pageName, data);

    this.sharedService.refreshGrid.subscribe(o => {
      this.refresh();
    })
  }

  ngOnInit(): void {
    this.currentTimestamp = this.datepipe.transform(this.currentTimestamp, 'yyyyMMddTHHmmss');
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    //console.log('serviceNotResponded',this.serviceNotResponded,this.showNoRecords)
    this.selectableColumns = this.pageConfig.selectableColumns;
    let copy = deepClone(this.selectableColumns);
    this.copySelectableColumns = copy
    this.selectableColumnsDetails = this.pageConfig.selectableColumnsDetails;
    setTimeout(() => {
      this.columns = [];
      this.setGridColumns();
    }, 10);

    this.store.selectableColumns.subscribe(data => {   //for custom column setting grid
      this.columns = [];
      this.pageConfig.selectableColumns = <any>data;
      this.setGridColumns();
    })

  }
  ngOnChanges() {

    if (this.configurationsPageInfo.pageName == keyWords.configMasterPageName) {
      this.columns = []
      this.configurationsPageInfo.masterColumn && this.configurationsPageInfo.masterColumn.map((o: any) => {
        this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: false, caption: o['name'], adaptive: true });

      })
    }
  }
  //getiing dynamic column header from service
  setGridColumns() {
    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {

      if (o.flag == keyWords.true ) { 
        let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');

        let customize = preview == null ? customizeText2 : customizeText
        /*
         for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
         no need for on click event from user
       */

        if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        } else if (o.type == keyWords.amount) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        }
        else if (o.id == keyWords.pmtMethodName && this.configurationsPageInfo.pageName == keyWords.configLimitLockPageName) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true });
        } else if (o.id == keyWords.dailyTrxsDetails || o.id == keyWords.weeklyTrxsDetails || o.id == keyWords.monthlyTrxsDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: hasSorting ? true : false, adaptive: true, encodeHtml: false });

        } else if (this.configurationsPageInfo.pageName == keyWords.configLimitLockPageName) {
          this.columns.push({ dataField: keyWords.pmtMethodId, caption: '', adaptive: true, encodeHtml: false, visible: false });
        }
        // else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) { 
        //   this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName],cssClass:'passwordCss', width:this.pixelWidth(o[keyWords.captionName],{ size: 14,weight: 700 })+75, allowSorting: hasSorting ? true : false, adaptive: true,  allowColumnResizing:false, cellTemplate:customize});
        // }

        else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        }

      }
      else if (o.flag == 'true') {
        this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: false, caption: o[keyWords.captionName], adaptive: true });
      }
    });

    if (this.configurationsPageInfo.pageName == keyWords.configLimitLockPageName) {
      this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.cellTemplate });
    }

    if (this.configurationsPageInfo.pageName == keyWords.configParameterPageName) {
      this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.cellTemplate });
    }

    if (this.configurationsPageInfo.pageName == keyWords.configEndPointPageName) {
      this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.cellTemplate });
    }

    if (this.configurationsPageInfo.pageName == keyWords.configProcessorPageName) {
      if (this.configurationsPageInfo.groupingEnabled) {
        // this.primaryKey = 'configId';
        this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false, cellTemplate: this.actionCellTemplate })
      } else {
        this.columns.length && this.columns.unshift({ dataField: keyWords.dataFieldAction, caption: "", allowSorting: false })
      }
      this.columns.push({ dataField: '', caption: '', adative: true, cellTemplate: this.cellTemplate })
    }

    if (this.configurationsPageInfo.pageName == keyWords.paymentchannels) {
      this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.cellTemplate });
      this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.deletecellTemplate });
    }
    if (this.configurationsPageInfo.pageName == keyWords.configMasterPageName) {
      this.columns = []
      this.configurationsPageInfo.masterColumn && this.configurationsPageInfo.masterColumn.map((o: any) => {
        this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: false, caption: o[keyWords.captionName], adaptive: true });
      })
    }

    let sticky = document.getElementById(keyWords.gridContainerConfig).children[0].children[4];
    sticky.classList.add(keyWords.fixedHeaders);
  }



  actionCellTemplate(container, options) {
    let div = document.createElement('div')

    let a = document.createElement('a');
    a.classList.add(keyWords.colorBlue)
    let html = keyWords.imgPlusDetail
    //console.log("this.dataGrid?.instance? is ", this.dataGrid?.instance);
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
    let div = document.createElement('div'); //isUserHasAccess(this.pageConfig?.permissions)?.edit ? document.createElement('div'):document.createElement('div class="disabled-access"')
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a');
    a.classList.add(keyWords.editIconUrl)
    let html = keyWords.imgIdentityCell
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? a.onclick = () => this.actionClick(this.configurationsPageInfo.pageName, deepClone(options.key)) : '';
    div.append(a);
    //div=isUserHasAccess(this.pageConfig?.permissions).edit?div.getElementsByClassName("").item.name ("class","disabled-access"):div//  classList.add("disabled-access"):div;
    return div;
  }

  deletecellTemplate(container, options) {
    let div = document.createElement('div');
    isUserHasAccess(this.pageConfig?.permissions)?.delete ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a')
    a.classList.add(keyWords.colorRed)
    let html = keyWords.imgDeleteCell
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.delete ? a.onclick = () => this.actionClick(this.configurationsPageInfo.pageName, deepClone(options.key)) : '';
    div.append(a);
    return div;
  }

  onFocusedCellChanging(e) {
    e.isHighlighted = false;

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
      if (this.configurationsPageInfo.pageName != keyWords.configLimitLockPageName) {
        this.applyFiltersEvent.emit(this.filters);
      }
      else {
        this.limitLocksService.emit(this.limitsLockServiceCall)
      }
    }
  }

  onPageChange(pageNumber: string) {
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  //this method is for selecting customize column 
  customizeColumns(cols: any[]) {
    cols.forEach(col => col.headerCellTemplate = keyWords.header);
  }

  //this method is for etting data of selected column
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



  refresh() {
    if (this.configurationsPageInfo.pageName != keyWords.configLimitLockPageName) {
      this.applyFiltersEvent.emit(this.filters);
    }
    else {
      this.limitLocksService.emit(this.limitsLockServiceCall)
    }
  }


  //edit modal
  onActionClick(pageName, data) {
    switch (pageName) {
      case keyWords.configParameterPageName:
        this.headerConfig=keyWords.updateRefundConfig//["request-type"] = 'edit';
        this.parametersModalService.open(this.pageConfig, data, this.headerConfig);
        break;

      case keyWords.configLimitLockPageName:
        this.limitslocksModalService.open(this.pageConfig, data, this.headerConfig);
        break;

      case keyWords.configProcessorPageName:
        this.processorConfigModalService.open(this.pageConfig, data, this.headerConfig);
        break;
      case keyWords.configEndPointPageName:
        this.endPointModalService.open(this.pageConfig, data, this.headerConfig);
        break;

      default:
        break;
    }
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
    if (container?.querySelector('span')?.innerHTML == 'Copy') {
      container.remove()
    }
  }
  download() {
    if (!haveEnoughSessionStorageSpace()) {
      this.notification.showWarning(this.translate.instant(keyWords.maxDownloadLimit));
      return;
    }
    this.notification.showInfo(keyWords.exportDownload, keyWords.showInfo)
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
    this.filters = deleteFilters(this.filters)
    this.restApiService.downloadTableData(this.configurationsPageInfo.url, this.filters, headerConfig).subscribe(data => {
      if (data.type > 0) {
        this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        //let name = this.transactionsPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.configurationsPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        //console.log('name',name)
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body)
          response = data.body[this.configurationsPageInfo.attributeName]
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
    if (data) {
      const headers = [];
      let dataKeys = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig.selectableColumns.forEach((o: any) => {
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
      }
    };

    fileReader.readAsDataURL(new Blob([csvArray], { type: keyWords.csvText }));
  }

  // Making selectable column dropdown change position dynamically accordingly to browser window ( Start )
  @HostListener('mousewheel', ['$event'])
  onMousewheel(event) { //console.log(window)
    if (this.dropdown?.isOpen == true) {
      this.togglePosition();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) { //console.log(window)
    if (this.dropdown?.isOpen == true) {
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
    //console.log('position',position,'------','buttonHeight',buttonHeight,'------','menuHeight',menuHeight,'----------','$win.height() - position',$win.height() - position,'-----------',' buttonHeight + menuHeight', buttonHeight + menuHeight)
    if (position > menuHeight && $win.height() - position < buttonHeight + menuHeight) {
      const scroll = document.querySelector<HTMLElement>('.columnScrolling_Dropdown')!;
      if (scroll != null) { //console.log('scroll 1',scroll)
        scroll.style.transform = 'translateY(-405px)';
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
