import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, HostListener,TemplateRef } from '@angular/core';
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
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { NgxSpinnerService } from "ngx-spinner";
import dxPopup from 'devextreme/ui/popup';
import ContextMenu from "devextreme/ui/context_menu";
import { colors, keyWords } from 'src/app/shared/constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import { ActivatedRoute } from '@angular/router';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import * as $ from "jquery";
import { getTextWidth } from 'get-text-width';
import { ExcelServicesService } from 'src/app/services/excel.service';
import { DatePipe } from '@angular/common';
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
  @Input() transactionsPageInfo;
  @Input() logVal;
  @Input() actionKey;
  @Input() responseCount
  @Input() serviceNotResponded;
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  @Output() applyFiltersEvent = new EventEmitter();
  @Output() transactionIdEvent = new EventEmitter();
  @Output() instanceIdEvent = new EventEmitter();
  @Output() actionIdEvent = new EventEmitter();
  @Output() applyPmtCards = new EventEmitter();



  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGrid: DxDataGridComponent;

  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGridEInvoice: DxDataGridComponent;

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
  isDropup: boolean = true
  pmtCard: boolean
  modalRef?: BsModalRef;
  selectedLang: any
  menuInstance;
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  userpassword: any
  file: any
  pdfPageName: any
  pdfDataSource: any = [];
  generatePdfDetailsList: any = [];
  totalRecordsCount: any;
  currentTimestamp: any = new (Date)
  pageNo:any

  constructor(private notification: NotificationService, private columnSettingsModalService: ColumnSettingsModalService, private store: StoreService, private restApiService: RestApiService, private downloadManagerService: DownloadManagerService, private clipboard: Clipboard, private translate: TranslateService, private router: Router, private loaderService: LoaderService, private spinner: NgxSpinnerService, private modalServicen: NgbModal, private modalService: BsModalService, private activeRoute: ActivatedRoute, private datepipe: DatePipe, private excelService: ExcelServicesService) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
    this.transactionIdCellTemplate = this.transactionIdCellTemplate.bind(this);
    this.eEnvoiceCellTemplate = this.eEnvoiceCellTemplate.bind(this);
    this.eEnvoiceCellTemplateTotalTax = this.eEnvoiceCellTemplateTotalTax.bind(this)
    this.actionCellTemplateEInvoice = this.actionCellTemplateEInvoice.bind(this);
    this.pdfCellTemplate = this.pdfCellTemplate.bind(this)
  }

  eInvoiceSelectableColumns: any = [
    {
      flag: keyWords.true,
      id: 'taxAmount',
      name: this.translate.instant('Tax Amount'),
    },
    {
      flag: keyWords.true,
      id: 'taxAmountCurrency',
      name: this.translate.instant('Tax Amount Currency'),
    }
  ]

  eInvoiceSelectableColumnsDetails: any = [
    {
      flag: keyWords.true,
      id: 'taxAmount',
      name: this.translate.instant('Tax Amount'),
    },
    {
      flag: keyWords.true,
      id: 'taxAmountCurrency',
      name: this.translate.instant('Tax Amount Currency'),
    },
    {
      flag: keyWords.true,
      id: 'taxCategoryCode',
      name: this.translate.instant('Tax Category Code'),
    },
    {
      flag: keyWords.true,
      id: 'taxCategoryRate',
      name: this.translate.instant('Tax Category Rate'),
    },
    {
      flag: keyWords.true,
      id: 'taxSchemeId',
      name: this.translate.instant('Tax Scheme Id'),
    },
    {
      flag: keyWords.true,
      id: 'taxableAmount',
      name: this.translate.instant('Taxable Amount'),
    },
    {
      flag: keyWords.true,
      id: 'taxableAmountCurrency',
      name: this.translate.instant('Taxable Amount Currency'),
    }
  ]

  ngOnInit(): void {
    this.currentTimestamp = this.datepipe.transform(this.currentTimestamp, 'yyyyMMddTHHmmss');
    let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
    this.rtlEnabled = langArray === this.languages[0];
    this.pmtCard = false

    //isUserHasAccess:any=isUserHasAccess;
    this.header = this.headerConfig
    this.selectableColumns = this.pageConfig.selectableColumns;
    this.copySelectableColumns = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumns));
    this.selectableColumnsDetails = this.pageConfig.selectableColumnsDetails;
    this.pageConfig?.selectableColumnsDetails ? this.copySelectableColumnsDetails = JSON.parse(JSON.stringify(this.pageConfig?.selectableColumnsDetails)) : "";
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
            //console.log('pdfPageName',this.pdfPageName)
          }
        })
      })
    });

  }
  // refundAmount
  setGridColumns() {

    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
      let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == keyWords.true);
      if (o.flag == 'true') {

        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');
        if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        }
        if (o.type == keyWords.amount) {
          this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.refundAmtTextCss, width: getTextWidth(o['name']) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.refundAmtTextCss, width: getTextWidth(o['name']) + 45, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, sortingMethod: () => { return false; } });
        }
        else if (o['id'].toLowerCase().indexOf('sellerid') > -1 || o['id'].toLowerCase().indexOf('buyerid') > -1) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass: 'hyperLink-css', adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.eEnvoiceCellTemplate });
        } else if (o['id'].toLowerCase().indexOf('taxtotal') > -1) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass: 'hyperLinks-css', adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.eEnvoiceCellTemplateTotalTax });
        }

        else if (o['id'].toLowerCase().indexOf(keyWords.transid) > -1 && (this.transactionsPageInfo.pageName == keyWords.pmts || this.transactionsPageInfo.pageName == keyWords.refunds || this.transactionsPageInfo.pageName == keyWords.einvoices || this.transactionsPageInfo.pageName == keyWords.payouts)) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass: keyWords.transIdCss, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.transactionIdCellTemplate });
        } else if (o['id'].toLowerCase().indexOf('batchid') > -1 && (this.transactionsPageInfo.pageName == 'bills' || this.transactionsPageInfo.pageName == keyWords.pmts || this.transactionsPageInfo.pageName == 'payrolls')) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass: keyWords.transIdCss, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.transactionIdCellTemplate });
        } else if (o['id'].toLowerCase().indexOf(keyWords.filelocation) > -1) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.cellTemplate });
        } else if (o['id'].toLowerCase().indexOf(keyWords.extrefdetails) > -1) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], cssClass: keyWords.extRefDetailsCss, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.extRefDetailsCellTemplate, });
        } else if (o['id'].toLowerCase().indexOf(keyWords.processstatus) > -1 && o['id'] != "processStatusCode" && o['id'] != "processStatusDesc") {

          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], width: this.pixelWidth(o['name'], { size: 14, weight: 700 }) + 85, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.createCirclecellTemplate })
        } else if (o['id'].toLowerCase().indexOf(keyWords.refundStatus) > -1) {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'], width: this.pixelWidth(o['name'], { size: 14, weight: 700 }) + 85, adaptive: true, sortingMethod: () => { return false; }, cellTemplate: this.createCirclecellTemplate })
        } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        } else {
          this.columns.push({ dataField: o['id'], allowSorting: hasSorting ? true : false, caption: o['name'],  width: this.pixelWidth(o['name'], { size: 14, weight: 700 }) + 85,adaptive: true, sortingMethod: () => { return false; } });
        }

      }
    });
    this.primaryKey = this.columns[0].dataField;
    if (this.transactionsPageInfo.groupingEnabled) {
      this.primaryKey = keyWords.transIdPrimaryKey;
      this.columns.length && this.columns.unshift({ dataField: keyWords.action, caption: "", cssClass: keyWords.plusIcon, allowSorting: false, cellTemplate: this.actionCellTemplate })
    } else {
      this.columns.length && this.columns.unshift({ dataField: keyWords.action, caption: "", allowSorting: false })
    }

    if (this.transactionsPageInfo.pageName == keyWords.einvoices) {
      this.columns.push({ dataField: '', caption: '', alignment: 'left', width: 50, adaptive: true, cellTemplate: this.pdfCellTemplate });
    }

    let sticky = document.getElementById(keyWords.gridContainer).children[0].children[4];
    sticky.classList.add(keyWords.fixedHeaders);
  }


  optionss: any = null
  actionCellTemplate(container, options) {
    let div = document.createElement('div')
    let a = document.createElement('a');
    a.classList.add('color-blue');
    let html = '<img src="assets/icons/icon_plusDetail.svg">'


    if (this.dataGrid.instance.isRowExpanded(options.key)) {
      html = '<img src="assets/icons/icon_minusDetail.svg">'
      //this.actionKey == options.key
    }
    a.innerHTML = html;
    if (this.actionKey == options.key) {
      // options.component.collapseAll(-1)
      this.dataGrid.instance.expandRow(options.key)

    }
    a.onclick = () => {
      this.actionKey = null

      if (this.dataGrid.instance.isRowExpanded(options.key)) {
        this.dataGrid.instance.collapseRow(options.key)
        this.actionIdEvent.emit(this.optionss);

      } else {
        options.component.collapseAll(-1)
        this.dataGrid.instance.expandRow(options.key)
        this.actionIdEvent.emit(options.key);
      }
    }
    div.append(a);
    return div;
  }

  actionCellTemplateEInvoice(container, options) {
    const key = options.component.getKeyByRowIndex(options.rowIndex);
    // console.log('o',options.component.isRowExpanded(key))
    let div = document.createElement('div')
    // console.log('o',this.dataGridEInvoice.instance.collapseRow(key))
    let a = document.createElement('a');
    a.classList.add('color-blue');
    let html = '<img src="assets/icons/icon_plusDetail.svg">'
    //console.log("this.dataGrid?.instance? is ", this.dataGrid?.instance);
    if (options.component.isRowExpanded(key)) {  //console.log('options ddd',key)
      html = '<img src="assets/icons/icon_minusDetail.svg">'
    }
    a.innerHTML = html;
    a.onclick = () => {
      if (options.component.isRowExpanded(key)) { //console.log('options aaa',key)
        options.component.collapseRow(key)
      } else {//console.log('options ccc',key)
        // options.component.collapseAll(-1)

        options.component.collapseAll(-1);
        options.component.expandRow(key);
        // this.dataGridEInvoice.instance.expandRow(options.key)
      }
    }
    div.append(a);
    return div;
  }

  eEnvoiceCellTemplate(container, options) { //console.log('options e invoice',options)
    let div = document.createElement('DIV');
    div.setAttribute("data-toggle", "tooltip");
    div.setAttribute("data-placement", "top");
    div.setAttribute("title", options?.text);
    let a = document.createElement('A')
    let html = '<span>' + options.text + '</span>'
    a.innerHTML = html
    div.append(a);
    return div;
  }

  eEnvoiceCellTemplateTotalTax(container, options) {
    let div = document.createElement('DIV');
    div.setAttribute("data-toggle", "tooltip");
    div.setAttribute("data-placement", "top");
    div.setAttribute("title", options?.text);
    let a = document.createElement('A')
    let html = '<i class="bi bi-info-circle" ></i>'
    a.innerHTML = html
    div.append(a);
    return div;
  }

  openDetail(o: any) {
    //console.log('o',o)
  }

  modalHeader: any
  noData: boolean = false
  data: any = null;
  taxTotalData: DataSource = null
  eInvoiceColumns: any
  ePrimaryKey: string
  taxTotalDataDetails: DataSource = null
  eInvoiceColumnsDetails: any = []
  eInvoicePrimaryKeyDetails: any
  eInvoice: boolean = true;
  openVerticallyCentered(e: any, content) {//console.log('eEnvoiceing',e)
    let url = e.column.dataField == 'sellerId' ? ApiPaths.getEInvoiceSellerDetails : e.column.dataField == 'buyerId' ? ApiPaths.getEInvoiceBuyerDetails : e.column.dataField == 'taxTotal' ? ApiPaths.getEInvoiceTotalTax : '';
    let filter = e.column.dataField == 'sellerId' ? { "sellerId": e.text, "invoiceTypeName": e.data.invoiceTypeName } : e.column.dataField == 'buyerId' ? { "transId": e.key } : e.column.dataField == 'taxTotal' ? { "transId": e.key } : '';
    this.modalHeader = e.column.dataField == 'sellerId' ? 'Seller Details' : e.column.dataField == 'buyerId' ? 'Buyer Details' : e.column.dataField == 'taxTotal' ? 'Tax Total' : '';

    if (e.column.dataField == 'sellerId' || e.column.dataField == 'buyerId' || e.column.dataField == 'taxTotal') {
      this.loaderService.show()
      this.restApiService.getTableData(url, { SearchFilters: filter }, this.headerConfig).subscribe((val: any) => { //console.log('val',val)
        this.data = val
        this.loaderService.hide()
        this.modalServicen.open(content, { centered: true, size: 'lg' });
        if (val.body == null || val.status == 204) {
          this.noData = true
          // console.log('noData true',this.noData)
        } else {
          this.noData = false
          this.data = e.column.dataField == 'sellerId' ? val.body.SellerDetails : e.column.dataField == 'buyerId' ? val.body.BuyerDetails : e.column.dataField == 'taxTotal' ? val.body.taxTotal : ''

          let arr: any = []
          let details = e.column.dataField == 'taxTotal' ? val.body.taxTotal : '';
          this.taxTotalData = details
          // console.log('details',details)
          this.eInvoiceColumns = []
          this.eInvoiceColumnsDetails = []
          this.setGridEInvoice(this.taxTotalData)
          //  details?.taxSubTotal.forEach((e:any)=>{ console.log('e',e)
          details.forEach((o: any) => {
            // arr.push({o.taxAmount})
            //   arr.push(o.taxAmountCurrency)

            this.taxTotalDataDetails = o?.taxSubTotal //e.column.dataField == 'taxTotal'?val.body.taxTotal.taxSubTotal:'';
          })
          // console.log('taxTotalData',this.taxTotalData)
          //  console.log('taxTotalDataDetails',this.taxTotalDataDetails)
          this.setGridEInvoiceDetails(this.taxTotalDataDetails)
          // })
          // console.log('noData false',this.noData)
        }
      }, err => {
        if (err) {
          this.loaderService.hide();
        }

      })
    }

  }


  setGridEInvoice(data) {
    this.eInvoiceSelectableColumns && this.eInvoiceSelectableColumns.map((o: any) => {
      if (o.flag == 'true') {
        this.eInvoiceColumns.push({ dataField: o['id'], caption: o['name'], allowSorting: false, adaptive: true });
      }

    });
    // console.log('column',this.eInvoiceColumns[0].dataField)
    // this.eInvoicePrimaryKey = this.eInvoiceColumns[0].dataField;
    if (this.transactionsPageInfo.groupingEnabled) {
      this.ePrimaryKey = 'taxAmount';
      this.eInvoiceColumns.length && this.eInvoiceColumns.unshift({ dataField: keyWords.action, caption: "", cssClass: keyWords.plusIcon, allowSorting: false, cellTemplate: this.actionCellTemplateEInvoice })
    } else {
      this.eInvoiceColumns.length && this.eInvoiceColumns.unshift({ dataField: keyWords.action, caption: "", allowSorting: false })
    }

  }

  setGridEInvoiceDetails(data) {
    this.eInvoiceSelectableColumnsDetails && this.eInvoiceSelectableColumnsDetails.map((o: any) => {
      if (o.flag == 'true') {
        this.eInvoiceColumnsDetails.push({ dataField: o['id'], caption: o['name'], allowSorting: false, adaptive: true });
      }
      // this.taxTotalDataDetails = new DataSource({
      //   store: new ArrayStore({
      //     data:  data
      //   }),
      // });
    });
  }

  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.download ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a');
    let html = `<img src='assets/icons/icon-download-row.svg' class="" style="margin-top: 2px; margin-right:5px" alt="download">`;
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.download ? a.onclick = () => {
      this.downloadFile(options);
    } : ''
    div.append(a);
    div.append(options.data[keyWords.fileLocation2]);
    return div;
  }

  pdfCellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.download ? div : div.classList.add(keyWords.disabledAccess)
    let a = document.createElement('a');
    let html = options.data.pdfLocation != null ? `<img src='assets/icons/icon-download-row.svg' class="" style="margin-top: 2px; margin-right:5px" alt="download">` : '';
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.download ? a.onclick = () => {
      options.data.pdfLocation != null ? this.downloadFile(options) : '';
    } : ''
    div.append(a);
    // div.append(options.data[keyWords.fileLocation2]);
    return div;
  }
  detailsButtonMouseEnter() {
    //this.positionOf = `#image${id}`;
  }
  extRefDetailsCellTemplate(container, options) {
    let div = document.createElement('DIV');
    let a = document.createElement('A')
    a.classList.add('color-black')
    let html = '<i class="bi bi-info-circle" ></i>'
    a.style.color = '#000000'
    a.style.pointerEvents = "all"
    // a.onclick = () => this.changeIconColor('infoIcon')
    a.innerHTML = html
    div.append(a);
    return div;

  }

  //for status circle
  createCirclecellTemplate(container, options) {
    let parentSpan = document.createElement('SPAN')
    let span = document.createElement('span');
    span.style.backgroundColor = options.displayValue == keyWords.Completed || options.displayValue == keyWords.processed ? colors.green : options.displayValue == keyWords.rejected || options.displayValue == keyWords.cancelled || options.displayValue == keyWords.failed2 ? '#E53012' : colors.darkYellow;
    let p = document.createElement('P')
    let textNode = document.createTextNode(options.displayValue);
    p.appendChild(textNode)
    parentSpan.appendChild(span);
    parentSpan.appendChild(p)

    return parentSpan;
  }

  transId: any
  logDetails(option) {

  }
  rowtransId: any;
  transID: any;
  transIdCellTemplate(e) {

    if (e.rowType === keyWords.data && e.column.dataField === keyWords.ePayInstanceId) {
      let body = {
        key: e.value,
        columnName: e.column.name
      }
      this.instanceIdEvent.emit(body);

    }
    if (e.rowType === keyWords.data && e.column.dataField === keyWords.extRefDetailsData) {
      //this.viewExtRefDetails(e);
      this.rowtransId = e.key;
      this.transID = e.data.transId
    }
  }

  rowdataCellTemplate(e) {

    if (e.data) {
      this.transID = e.data.transId
    }
  }

  onContentReady(e) {
    let menu = e.element.querySelector(keyWords.dxContextMenu);
    this.menuInstance = ContextMenu.getInstance(menu);

    this.menuInstance.option(keyWords.showEvent, keyWords.dxclick);
  }

  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }

  onCellClick(e) {
    // e.isHighlighted = false;
    // this.notification.showInfo(keyWords.copied)
    this.clipboard.copy(e);

    this.notification.showInfo(this.translate.instant(keyWords.copied))
    //  this.clipboard.copy(e?.text);
  }
  onRightClick(e) {
    if (e.target == keyWords.content && e.column != undefined) {
      e.items = [{
        text: this.translate.instant(keyWords.copy),
        onItemClick: () => {
          this.clipboard.copy(e?.targetElement.innerHTML);
        }
      }]
    }
  }
  onRefIconClick(e) {
    if (e.column.dataField !== keyWords.extRefDetailsData && e.event.type == keyWords.dxclick) {
      setTimeout(() => {
        const container1 = document.getElementsByClassName(keyWords.dxSubmenu)[0];

        container1 != null && container1 != undefined ? container1.removeChild(container1.firstChild) : ''
        return
      }, 10)
    }

    if (e.row.rowType == keyWords.data && e.column.dataField === keyWords.extRefDetailsData && e.event.type == keyWords.dxcontextmenu) {
      setTimeout(() => {
        const container1 = document.getElementsByClassName(keyWords.dxSubmenu)[0];

        container1 != null && container1 != undefined ? container1.removeChild(container1.firstChild) : ''
      }, 10)
    }
    let modalContainer
    if (e.row.rowType == keyWords.data && e.column.dataField === keyWords.extRefDetailsData) {
      e.items = [
        {
          text: this.translate.instant(keyWords.loading)
        },
      ];




      let body = this.transactionsPageInfo.pageName == keyWords.payouts?{
        SearchFilters:  {
            transId: this.transID    
        }
    }:{
        SearchFilters: {
          transId: [
            this.transactionsPageInfo.pageName == keyWords.pmts ? this.rowtransId : this.transID
          ],
          fromDate: this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss'),
          toDate: this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')

        }
      }

      let url = this.transactionsPageInfo.pageName == keyWords.pmts ? ApiPaths.getPaymentTransactionExtRefs :this.transactionsPageInfo.pageName == keyWords.payouts?ApiPaths.getPayoutExtRefs: ApiPaths.getBillExtRefs
      this.restApiService.viewExtRefDetails(url, body, this.headerConfig).then(data => {
        this.extRefDetails = this.transactionsPageInfo.pageName == keyWords.pmts ? data?.PaymentTransactionExtRefs :this.transactionsPageInfo.pageName == keyWords.payouts? data?.PayoutExtRefs:data?.BillExtRefs;
        if (this.extRefDetails == null || this.extRefDetails == undefined || this.extRefDetails.length == 0) {
          setTimeout(() => {
            const errorContainer = document.getElementsByClassName(keyWords.dxSubmenu)[0];
            errorContainer.removeChild(errorContainer.firstChild);
            this.notification.showError("No record to display");
          }, 10)
        }
        modalContainer = document.createElement('DIV');
        modalContainer.classList.add('modalContainer');
        const header = document.createElement('SPAN');
        header.classList.add('extHeading');
        const headerNode = document.createTextNode(this.translate.instant(keyWords.extRefDetails));
        let row1;
        let row2;
        let divContainer
        this.extRefDetails?.forEach((data) => {
          divContainer = document.createElement("DIV");
          const hr = document.createElement("HR")
          row1 = document.createElement("DIV");
          row1.classList.add('row', 'labelRow');
          row2 = document.createElement("DIV");
          row2.classList.add('row', 'dataRow');
          const col1 = document.createElement('DIV');
          col1.classList.add("col-md-6", "textLabel");
          const col2 = document.createElement('DIV');
          col2.classList.add("col-md-6", "textLabel");
          const col3 = document.createElement('DIV');
          col3.classList.add("col-md-6", "dataLabel");
          const col4 = document.createElement('DIV');
          col4.classList.add("col-md-6", "dataLabel");
          const span1 = document.createElement("SPAN");
          const span2 = document.createElement("SPAN");
          const span3 = document.createElement("SPAN");
          const span4 = document.createElement("SPAN")
          const refType = document.createTextNode(this.transactionsPageInfo.pageName == keyWords.payouts?this.translate.instant(keyWords.extRefKey):this.translate.instant(keyWords.extRefType));
          const refId = document.createTextNode(this.transactionsPageInfo.pageName == keyWords.payouts?this.translate.instant(keyWords.extRefValue):this.translate.instant(keyWords.extRefID));
          const refTypeData =this.transactionsPageInfo.pageName == keyWords.payouts?document.createTextNode(data.extRefKey) :document.createTextNode(data.extRefType);
          const refIdData = this.transactionsPageInfo.pageName == keyWords.payouts?document.createTextNode(data.extRefValue) :document.createTextNode(data.extRefId);
          span3.oncontextmenu = () => { this.transactionsPageInfo.pageName == keyWords.payouts?this.onCellClick(data.extRefKey):this.onCellClick(data.extRefType), console.log('content') }
          span4.oncontextmenu = () => { this.transactionsPageInfo.pageName == keyWords.payouts?this.onCellClick(data.extRefValue) :this.onCellClick(data.extRefId), console.log('content') }
          row1?.appendChild(col1);
          row1?.appendChild(col2);
          col1?.appendChild(span1);
          col2?.appendChild(span2);
          span1?.appendChild(refType)
          span2?.appendChild(refId);
          span3.style.wordBreak = 'break-all'

          row2?.appendChild(col3);
          row2?.appendChild(col4);
          col3?.appendChild(span3);
          col4?.appendChild(span4);
          span3?.appendChild(refTypeData);
          span4?.appendChild(refIdData)



          divContainer.appendChild(row1);
          divContainer.appendChild(row2);
          divContainer?.appendChild(hr)
          modalContainer?.appendChild(divContainer);
        })

        header.appendChild(headerNode);
        modalContainer.insertBefore(header, modalContainer.firstChild);

        setTimeout(() => {

          const container1 = document.getElementsByClassName(keyWords.dxSubmenu)[0];
          container1 != null && container1 != undefined ? container1.removeChild(container1.firstChild) : ''
          if (container1) {
            container1.appendChild(modalContainer)
          }
        }, 500)
      }, (err) => this.notification.showError(keyWords.noServiceAvailabe));

    }


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


  onPageChange(pageNumber: any) {
    // console.log('filter pagination',this.filters)
    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss'),
      this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.pmtCard = true

      this.applyPmtCards.emit(this.pmtCard)
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

  cancel() {
    this.store.selectableColumns.next(this.copySelectableColumns);
    this.store.selectableColumnsDetails.next(this.copySelectableColumnsDetails)
  }
  download() {
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
    this.filters = deleteFilters(this.filters)
    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.transactionsPageInfo.url, this.filters, headerConfig).subscribe(data => {
      if (data.type > 0) {
        let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        //let name = this.transactionsPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.transactionsPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate;
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body)
          response = data.body[this.transactionsPageInfo.attributeName]
        if (data.headers)
          totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        this.saveCSVToSession(id, response, name, totalRecordsCount, percent);
      }
    });
  }

  downloadFile(file) { //console.log('file',file )
    let downloadedData = this.transactionsPageInfo.pageName == keyWords.einvoices ? file.data.pdfLocation : file.data.fileLocation
    let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
    let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
    // let name = this.reportPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
    let name = this.lang == 'en' ? this.transactionsPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate + '.pdf' : this.lang == 'ar' ? fromDate + '_' + toDate + '_' + 'DTR' + '_' + this.transactionsPageInfo.downloadName + '.pdf' : '';
    // console.log('download',downloadedData)

    this.restApiService.downloadFile(ApiPaths.downloadFile, downloadedData).subscribe(data => {//console.log('data',data)
      this.transactionsPageInfo.pageName == keyWords.einvoices ? saveAs(data, name) : saveAs(data, file.data.fileName)

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
          if (o.flag == "true" && key == o.id && key != 'extRefDetails') {
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
      //let csv = data.map((row: any) => maindataKeys.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','));
      let csv = data.map((row: any) => maindataKeys.map((fieldName) => fieldName == 'sellerId' || fieldName == 'buyerId' || fieldName == 'extSysRefId' ? "'" + row[fieldName] : JSON.stringify(" " + row[fieldName], replacer)).join(','));
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
      const headers2 = []
      let dataKeys2 = []
      let ex2 = []
      Object.keys(data[0]).forEach(key => {
        this.pageConfig.selectableColumnsDetails?.forEach((e: any) => {
          if (e.flag == "true" && key == e.id) {
            headers2.push('\ufeff' + e.name);
            dataKeys2.push(e.id);
          } else if (e.flag != "true" && key != e.id) {
            ex2.push(e.id)
          }
        })
      })
      let mainHeader = headers.concat(headers2)
      let maindataKeys = dataKeys.concat(dataKeys2)
      let falseKeys = ex.concat(ex2)
      data.map(d => {

        delete d['extRefDetails'];
        // console.log('d', d)
      });
      //console.log('update',update)
      let excelObj = {
        updateData: data,
        mainHeader: mainHeader,
        maindataKeys: maindataKeys,
        falseKeys: falseKeys,
        id: id,
        name: name,
        sheet: this.transactionsPageInfo.pageName,
        totalCount: totalCount,
        blob: null,
        date: new Date(),
        percent: percent,
        pageConfig: this.pageConfig
      }
      this.excelService.exportAsExcelFile(excelObj);
    }
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
    this.filters = deleteFilters(this.filters)
    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.transactionsPageInfo.url, this.filters, headerConfig).subscribe(data => {
      if (data.type > 0) {
        let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        //let name = this.transactionsPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.transactionsPageInfo.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate;
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        let totalRecordsCount;
        if (data.body)
          response = data.body[this.transactionsPageInfo.attributeName]
        if (data.headers)
          totalRecordsCount = data.headers.get(keyWords.ttlRecordsCnt)
        this.sendxlsx(id, response, name, totalRecordsCount, percent);

      }
    });
  }

  /*
  Download PDF Changes adde on all the pages;
  First it was only on Reports page 
*/
  pdfdownload() {
    this.generatePdfDetailsList = []
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
    this.filters = deleteFilters(this.filters)
    // console.log('filterssss',this.filters.SearchFilters)

    this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyy-MM-ddTHH:mm:ss');
    this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyy-MM-ddTHH:mm:ss')
    this.restApiService.downloadTableData(this.transactionsPageInfo.url, this.filters, headerConfig).subscribe(data => {  //console.log('data',data)
      if (data.type > 0) {
        let fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
        let toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
        // let name = this.reportPageInfo.downloadName + '_' + this.filters.SearchFilters.fromDate + '_' + this.filters.SearchFilters.toDate;
        let name = this.lang == 'en' ? this.transactionsPageInfo?.downloadName + '_' + this.currentTimestamp + '_' + 'DTR' + '_' + fromDate + '_' + toDate : this.lang == 'ar' ? fromDate + '_' + toDate + '_' + 'DTR' + '_' + this.transactionsPageInfo.downloadName : '';
        if (data.loaded && data.total) {
          percent = Math.round(data.loaded * 100 / data.total);
        }
        // let totalRecordsCount;
        let totalRecordsCount;
        if (data.body) {
          response = data.body[this.transactionsPageInfo.attributeName]
          // this.pdfDataSource = data.body[this.transactionsPageInfo.attributeName]
          this.pdfDataSource = data.body[this.transactionsPageInfo.attributeName]
          // this.downloadPDF();
          this.filters.SearchFilters.fromDate = this.datepipe.transform(this.filters.SearchFilters.fromDate, 'yyyyMMddTHHmmss');
          this.filters.SearchFilters.toDate = this.datepipe.transform(this.filters.SearchFilters.toDate, 'yyyyMMddTHHmmss');
          let pdfData: any = {
            file: this.file,
            label: this.transactionsPageInfo.downloadName,
            fromdate: this.filters.SearchFilters.fromDate,
            todate: this.filters.SearchFilters.toDate,
            currentTimestamp: this.currentTimestamp,
            pageConfig: this.pageConfig,
            pageName: this.pdfPageName,//this.transactionsPageInfo.pageName,
            totalRecordsCount: this.totalRecordsCount,
            dataSource: this.pdfDataSource,
            selectableColumns: this.pageConfig.selectableColumnsDetails ? this.selectableColumns.concat(this.selectableColumnsDetails) : this.selectableColumns
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



  transactionIdCellTemplate(container, options) { //console.log('options',options)
    let div = document.createElement('DIV');
    div.setAttribute("data-toggle", "tooltip");
    div.setAttribute("data-placement", "top");
    div.setAttribute("title", options?.key);
    let a = document.createElement('A')
    let html = '<span>' + options.value + '</span>'
    a.innerHTML = html
    a.onclick = () => {
      let body = {
        key: options.value,
        columnName: options.column.name
      }
      this.transactionIdEvent.emit(body);
    }

    div.append(a);
    return div;
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
    if (this.selectableColumns.length <= 22) {
      menuHeight = 650
    } else { menuHeight = 750 }
    var $win = $(window);
    if (position > menuHeight && $win.height() - position < buttonHeight + menuHeight) {
      const scroll = document.querySelector<HTMLElement>('.columnScrolling_Dropdown')!;
      if (scroll != null) { //console.log('scroll 1',scroll)
        scroll.style.transform = 'translateY(-697px)';
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
