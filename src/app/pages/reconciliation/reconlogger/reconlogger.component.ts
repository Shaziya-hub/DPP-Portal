import { Component, EventEmitter, OnInit, Output, ViewChild, TemplateRef, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { RestApiService } from "src/app/services/rest-api.service";
import { StoreService } from "src/app/services/store.service";
import { ApiPaths, deleteFilters } from "src/app/shared/utils";
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from "src/app/services/notification.service";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { template } from "lodash";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as events from "events";
import { PageConfig } from "src/app/model/page-config";
import { LoaderService } from "src/app/services/loader.service";
import { keyWords } from "src/app/shared/constant";
import * as vkbeautify from 'vkbeautify';


@Component({
  selector: 'app-reconlogger',
  templateUrl: './reconlogger.component.html',
  styleUrls: ['./reconlogger.component.scss']
})

export class ReconLoggerComponent implements OnInit {

  @Output() applyFiltersEvent = new EventEmitter();
  @Output() batchIdEvent = new EventEmitter();
  @Output() LoggerEvent = new EventEmitter();
  // @Output() instanceIdEvent = new EventEmitter();
  @Output() actionKeyEvent = new EventEmitter();
  @Input() batchId;
  // @Input() instanceid;
  @Input() actionKey
  //@Input() pageConfig: PageConfig;
  @Input() filters;
  @Input() transactionsPageInfo;

  modalRef?: BsModalRef;
  dataSource: DataSource = null;
  dataSource2: any
  columns: any[] = [];
  primaryKey: string;
  showNoRecords: boolean;
  serviceNotResponded: boolean;
  rtlEnabled = false //will change according to language selection
  batchid: any
  //  instanceId:any
  request: any;
  onPageLoad: boolean = true;
  page: 1;
  headerConfig: any
  loggerfilters: any
  responseCount: any;

  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private storeService: StoreService, private notification: NotificationService, private translate: TranslateService, private clipboard: Clipboard, private router: Router, private modalService: BsModalService, private modalServicen: NgbModal, private loaderService: LoaderService) { }

  selectableColumns: any = [
    {
      flag: keyWords.true,
      id: keyWords.systemNameId,
      name: this.translate.instant(keyWords.systemName),
    },
    {
      flag: keyWords.true,
      id: keyWords.ipAddressId,
      name: this.translate.instant(keyWords.ipAddressName),
    },
    {
      flag: keyWords.true,
      id: keyWords.processDateId,
      name: this.translate.instant(keyWords.processDateName),
    },
    {
      flag: keyWords.true,
      id: keyWords.serviceNameId,
      name: this.translate.instant(keyWords.serviceNameL),
    },
    {
      flag: keyWords.true,
      id: keyWords.requestDataId,
      name: this.translate.instant(keyWords.requestDataName),
    },
    {
      flag: keyWords.true,
      id: keyWords.replyDataId,
      name: this.translate.instant(keyWords.replyDataName)
    },
    {
      flag: keyWords.true,
      id: keyWords.durationId,
      name: this.translate.instant(keyWords.durationName)
    }
  ]


  config = keyWords.config;

  pageSettings = {
    responseCount: 0,
    totalRecordsCount: 0,
    ttlPagesCnt: 0
  };

  req: any
  ngOnInit(): void {
    this.headerConfig = this.config
    this.batchid = this.batchId;
    this.storeService.selectableColumns.subscribe(data => {
      this.columns = [];
      this.selectableColumns = <any>data;
      this.setGridColumns(this.dataSource)
    })




    let filters = {
      SearchFilters: {
        batchId: this.batchId,
      }
    }
    this.loggerfilters = filters


    this.logsDetailService();


  }

  logsDetailService() {
    let filter = deleteFilters(this.loggerfilters)
    this.loaderService.show();
    this.restApiService.getTableData(ApiPaths.getLogDetails, filter, this.config).subscribe(data => {
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
      } else {
        this.showNoRecords = false
        let dataSource = data.body.LogDetails
        this.columns = [];
        this.setGridColumns(dataSource)
        this.dataSource2 = dataSource

      }
      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get('ttl-records-cnt') != 'na') {
        this.pageSettings.responseCount = +data.headers.get(keyWords.responseCount),//+this.pageConfig?.customParams?.PageSize; 
          this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
      }
      this.loaderService.hide();
    }, err => {
      if (err) {
        this.serviceNotResponded = true
        this.dataSource = null;
        this.showNoRecords = false;
        this.loaderService.hide();
      }
    });
  }

  pageId: any = "RES002"
  navigation(val) {
    this.batchId = null
    val = this.batchId
    this.batchIdEvent.emit(val);
    this.LoggerEvent.emit(keyWords.backFromLogger);
    // this.instanceid=null
    // this.instanceIdEvent.emit(this.instanceid);
    this.actionKeyEvent.emit(this.actionKey)


  }

  setGridColumns(dataSource) {

    this.selectableColumns && this.selectableColumns.map((o: any) => {
      if (o.flag == keyWords.true) {
        if (o[keyWords.dataFiledId].toLowerCase().indexOf('requestdata') > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: false, adaptive: true, cssClass: "requestdata-css", cellTemplate: "requestCellTemplate" });
        } else if (o[keyWords.dataFiledId].toLowerCase().indexOf('replydata') > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: false, adaptive: true, cssClass: "replydata-css", cellTemplate: "replyCellTemplate" });
        } else {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: false, adaptive: true });
        }

      }
      this.dataSource = new DataSource({
        store: new ArrayStore({
          data: dataSource
        }),

      });
    });

  }


  customizeColumns(cols: any[]) {
    cols.forEach(col => col.headerCellTemplate = 'header',
    );
  }

  //On hover row is being highlighted
  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }

  requestData: any
  xmlString: string
  requestCellTemplate(e) {
    this.requestData = e.value
    this.xmlString = vkbeautify.xml(this.requestData)
  }

  openModalWithClass(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  openVerticallyCentered(content) {
    this.modalServicen.open(content, { centered: true });
  }

  clipboardCopy() {
    this.notification.showInfo(this.translate.instant('Text copied to clipboard.'))
    this.clipboard.copy(this.requestData);
  }

  onCellDetailDblClick(e) {
    this.notification.showInfo(this.translate.instant('Text copied to clipboard.'))
    this.clipboard.copy(e?.text);
  }

  onPageChange(pageNumber: any) {
    if (this.headerConfig['page-number'] != pageNumber) {
      this.headerConfig['page-number'] = pageNumber;
      this.logsDetailService();
    }
  }



}