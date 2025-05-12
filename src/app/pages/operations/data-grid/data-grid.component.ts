import { Component, EventEmitter, Input, Output, ViewChild, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { keyWords } from 'src/app/shared/constant';
import { customizeText, customizeText2, deepClone, isUserHasAccess } from 'src/app/shared/utils';
import { SharedService } from 'src/app/services/shared.service';
import { RowDetailsService } from 'src/app/services/row-details-service.service';
import { ActivatedRoute, Route, Router } from '@angular/router';

import * as $ from "jquery";
import { getTextWidth } from 'get-text-width';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent {
  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGrid: DxDataGridComponent;
  @Input() pageConfig;
  @Input() headerConfig;
  @Input() operationsPageInfo;
  @Input() dataSource;
  @Input() serviceNotResponded;
  @Input() showNoRecords;
  @Input() filters;
  @Input() pageSettings;
  @Input() responseCount;
  @Output() applyFiltersEvent = new EventEmitter();
  pixelWidth = require('string-pixel-width');
  tabIndex: number = 0;
  selectableColumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  rtlEnabled = false;
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  header: any;
  copySelectableColumns: any;
  copySelectableColumnsDetails: any;
  isUserHasAccess: any;
  columns = [];
  pageId: any
  actionClick: Function;
  pageNo:any

  constructor(private store: StoreService, private notification: NotificationService, private translate: TranslateService, private loaderService: LoaderService, private restApiService: RestApiService
    , private clipboard: Clipboard, private sharedService: SharedService, private rowDetailService: RowDetailsService, private router: Router, private activeRoute: ActivatedRoute) {
    this.actionClick = (pageName, data) => this.onActionClick(pageName, data);
    this.cellTemplate = this.cellTemplate.bind(this);
    this.sharedService.refreshGrid.subscribe(o => {
      this.refresh();
    })
  }
  ngOnInit() {
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    this.header = this.headerConfig
    this.selectableColumns = this.pageConfig.selectableColumns;
     this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
    //let copy = deepClone(this.selectableColumns);
    //this.copySelectableColumns = copy
    this.selectableColumnsDetails = this.pageConfig?.selectableColumnsDetails;
  this.pageConfig?.selectableColumnsDetails?  this.copySelectableColumnsDetails = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumnsDetails)):'';
    // this.dataSource != null && this.dataSource != undefined?this.dataSource[0].profileId.trim():'';
    this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
    setTimeout(() => {
      this.columns = [];
      this.setGridColumns();
    }, 10);
    this.store.selectableColumns.subscribe(data => {
      this.columns = [];
      this.pageConfig.selectableColumns = <any>data;
      this.selectableColumns = this.pageConfig?.selectableColumns;
      this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
      //console.log("data",this.pageConfig.selectableColumns)
      this.setGridColumns();
    })

    this.store.selectableColumnsDetails.subscribe(data => {
     
      this.columns = [];
      this.pageConfig.selectableColumnsDetails = <any>data;
      this.selectableColumnsDetails = this.pageConfig?.selectableColumnsDetails;
      this.pageConfig?.selectableColumnsDetails?  this.copySelectableColumnsDetails = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumnsDetails)):'';
      this.setGridColumns();
    })
    this.activeRoute.queryParams.subscribe(data => this.pageId = data.pageId);
  }

  // Setting the grid column header
  setGridColumns() {
    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {

      let hasSorting = o.sorting//this.pageConfig?.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      if (o.flag == keyWords.true) {
        let preview = null
        preview=this.pageConfig.permissions.find((el: any) => el.type== keyWords.preview &&  el.flag == keyWords.true);
        /*
          for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
          no need for on click event from user
        */ 
          if(o.type== keyWords.sensitiveType){
            this.dataSource.map((d:any)=>{
              let key = Object.keys(d).find(key => key == o[keyWords.dataFiledId]);
             if(d[key] != null){
           
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
        if (o[keyWords.dataFiledId].toLowerCase().indexOf(keyWords.transamount) > -1) {//console.log("length of string ",this.pixelWidth(o['name'],{ size: 14,weight: 700 })+20);
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o[keyWords.dataFiledId].toLowerCase().indexOf('transamt') > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o[keyWords.dataFiledId].toLowerCase().indexOf('refundamt') > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == keyWords.amount) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o[keyWords.dataFiledId], alignment: keyWords.allignRight, caption: o[keyWords.captionName], cssClass: keyWords.amountText, width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        }
        else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } });
        }

      }

    });
    this.columns.push({ dataField: '', caption: '', cssClass: 'padding0', adaptive: true, cellTemplate: this.cellTemplate });

  }
  //to select selectable and selectabledetails column 
  tabClicked(index) {
    if (index == 1 && this.selectableColumnsDetails.length == 0) {
      return;
    }
    this.tabIndex = index;
  }

  onChange(event, col) {
    col.flag = event.target.checked.toString();
  }

  onRightClick(e) {
    if (e.target == keyWords.content && e.column != undefined && e.column.caption != '') {
      e.items = [{
        text: this.translate.instant(keyWords.copy),
        onItemClick: () => {
          this.clipboard.copy(e?.targetElement.innerHTML);
        }
      }]
    }
  }

  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }
  onwheel() {
    const container = document.getElementsByClassName(keyWords.dxSubmenu)[0];

    if (container?.querySelector('span')?.innerHTML == 'Copy') {
      container.remove()
    }
    else {
      const show = container?.firstElementChild?.className == keyWords.modalContainer
      show ? container.removeChild(container.firstChild) : ''
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
  onPageChange(pageNumber: string) {
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.applyFiltersEvent.emit(this.filters);
    }
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


  updateSelectableColumns(selectableColumns, selectableColumnsDetails) {
    this.loaderService.show();
    //this.copySelectableColumns = selectableColumns
    let data = keyWords.requestTypeEdit
    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data)

    return this.restApiService.updateSelectableColumns(selectableColumns, selectableColumnsDetails, headerConfig).subscribe(data => {

      this.store.selectableColumns.next(selectableColumns);
      this.store.selectableColumnsDetails.next(selectableColumnsDetails);
      this.loaderService.hide();
    });
  }
cancel(){
 // console.log("cancel",this.copySelectableColumns)
  this.store.selectableColumns.next(this.copySelectableColumns);
  this.store.selectableColumnsDetails.next(this.copySelectableColumnsDetails)
}
  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? div : div.classList.add(keyWords.disabledAccessed)
    let button = document.createElement('button');
    button.classList.add('btn', 'btn-block', "refundBtn")
    let btnLabel = this.translate.instant(keyWords.refund)
    button.innerText = btnLabel;
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? button.onclick = () => this.actionClick(this.operationsPageInfo.pageName, deepClone(options.key)) : '';
    div.append(button);
    return div;
  }
  onActionClick(pageName, data) {
    switch (pageName) {

      case keyWords.operationSubmitPageName:
        this.router.navigate([keyWords.refundprocessUrl], { queryParams: { pageId: this.pageId }, state: { rowData: data, filters: this.filters } })
        break;
    }
  }

  refresh() {
    this.applyFiltersEvent.emit(this.filters);
  }
}
