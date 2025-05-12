
import { DatePipe } from "@angular/common";
import { Component, Inject, Input, OnInit, ViewChild, ElementRef, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ColumnSettingsModalService } from "src/app/components/column-settings/column-settings-modal.service";
import { FiltersModel } from "src/app/model/filters.model";
import { ReportsFilterModel } from "src/app/model/reportsFilter.model";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { keyWords, pdfKeywords } from "src/app/shared/constant";
import { ApiPaths, constantField, deepClone, deleteFilters, validateDate } from "src/app/shared/utils";
import { FiltersComponent } from "./filters/filters.component";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})

export class ReportComponent implements OnInit {

  @ViewChild('htmlData') htmlData: any = ElementRef;


  pageConfig = null;
  pageConfig2 = null;
  reportPageInfo = null;
  url: any

  dataSource = null;
  dataSource2 = null;
  showNoRecords: boolean;
  fromDate: Date;
  toDate: Date;
  reportId: any
  fromdate: any
  todate: any
  searchFilter: any;
  searchFilters: boolean = true
  responseCount: any
  filters: FiltersModel = new FiltersModel();
  headerConfig: any;
  pageSize: any
  pageSettings = {
    responseCount: 0,
    totalRecordsCount: 0,
    ttlPagesCnt: 0
  };
  serviceNotResponded: boolean;
  bizService: any;
  billStatus: any;
  paymentStatus: any;
  summaryType: any
  merchant: any
  modalRef?: BsModalRef;
  pmtGateways: any;
  reportDate: any = new Date();

  constructor(private router: Router, private route: ActivatedRoute, private loaderService: LoaderService, private restApiService: RestApiService, private notificationService: NotificationService, private service: RestApiService, private datepipe: DatePipe, private columnService: ColumnSettingsModalService,
    private translate: TranslateService, private modalService: BsModalService) { }


  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.pageConfig = data.config.pageConfig;
      this.getPageAPIInfo();

    })
    this.headerConfig = keyWords.config
    //this.pageSettings=keyWords.pageSettings
    const para = document.createElement("p");
    para.setAttribute("id", "para");
    para.innerText = "This is a paragraph";
    //console.log('para',para)
  }



  onUrlChange(pageAPIInfo: any) {
    this.loaderService.show();
    this.columnService.setdocument(pageAPIInfo)
    this.reportId = pageAPIInfo
    this.service.getPageConfig(this.route.queryParams, pageAPIInfo).subscribe(data => {
      this.url = data
      this.pageConfig2 = this.url.pageConfig;
      this.pageSize = this.url.pageConfig?.customParams?.PageSize
      this.getPageAPIInfo();
      this.loaderService.hide();
    });

    this.searchFilter = new ReportsFilterModel();
    this.dataSource = null
    this.showNoRecords = false;
    this.serviceNotResponded = false;


  }


  bsValueChange(data: any) {
    data = this.datepipe.transform(data, keyWords.fromDateFromat)
  }

  onMonthlyChange(data2: any) {
    data2 = this.datepipe.transform(data2, keyWords.toDateFormat)

  }

  org: any = keyWords.organization
  bizservice: any
  filtertext() {
    if (this.pageConfig2?.listOfValues?.organizations) {
      this.org = keyWords.organizations
    }
    else if (this.pageConfig2?.listOfValues?.bizServices) {
      this.bizservice = keyWords.businessService
    }
  }


  applyFilters(filter: any) {

    if (filter.reset) {
      this.dataSource = null;
      this.dataSource2 = null;
      this.showNoRecords = false;
      this.serviceNotResponded = false;
      //filters.SearchFilters.organizationId=null;
      return;
    }
    let filters = deleteFilters(filter)
    if (filters?.SearchFilters?.fromDate && filters?.SearchFilters?.toDate) {
      let days = validateDate(filters, this.fromDate, this.toDate, this.datepipe) +1;

      if (days != null && days > +this.pageConfig2?.customParams?.SearchDateRange) {
        this.notificationService.showError(constantField.dateRangeMsg + this.pageConfig2?.customParams?.SearchDateRange + keyWords.days);
        return;
      }
      if (days != null && days < 0) {
        this.notificationService.showError(keyWords.maxDateRange);
        return;
      }

    }
    if (filters?.SearchFilters?.fromDate && filters?.SearchFilters?.toDate) {
      let days = validateDate(filters, this.fromDate, this.toDate, this.datepipe);

      if (days != null && days > +this.pageConfig?.customParams?.SearchDateRange) {
        this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + keyWords.days));
        return;
      }

    }

    this.filters = deepClone(filters);

    this.searchFilter = filters?.SearchFilters;
    //this.fromdate=filters?.SearchFilters.fromDate;
    //this.todate=filters?.SearchFilters?.toDate;
    //this.bizService=filters?.SearchFilters?.serviceId;
    //this.merchant=filters?.SearchFilters?.merchantId;

    this.pageConfig2?.listOfValues.bizServices.forEach((serviceName) => {
      //console.log('serviceName',serviceName)
      if (this.searchFilter.serviceId == serviceName.serviceId) {
        this.bizService = serviceName.serviceName
        // console.log('bizservice',this.bizService)
      }
    })

    this.pageConfig2?.listOfValues.merchants.forEach((merchant) => {
      //console.log('merchant',merchant)
      if (this.searchFilter.merchantId == merchant.merchantId) {
        this.merchant = merchant.merchantName
        // console.log('merchant',this.merchant)
      }
    })

    this.pageConfig2?.listOfValues.pmtGateways.forEach((pmtGateways) => {
      //console.log('merchant',merchant)
      if (this.searchFilter.pmtGatewayId == pmtGateways.pmtGatewayId) {
        this.pmtGateways = pmtGateways.pmtGatewayName
        // console.log('merchant',this.merchant)
      }
    })

    let url = this.reportPageInfo.url;
    this.loaderService.show();
    this.restApiService.getTableData(url, filters, this.headerConfig).subscribe(data => { //console.log('responseCnt',+data.headers.get(keyWords.responseCount))
      if (!data.body) {
        this.dataSource = null;
        this.dataSource2 = null;
        this.showNoRecords = true;
      }
      else {
        this.showNoRecords = false;
        if (data.body.ReconPmts != null && !data.body.UnreconPmts) {
          // console.log('recon',data)
          this.dataSource = data.body.ReconPmts[this.reportPageInfo.attributeName]
          this.dataSource2 = data.body.ReconPmts[this.reportPageInfo.summattributeName]
          this.fromdate = this.datepipe.transform(filters.SearchFilters.fromDate, this.pageConfig2.customParams.DownloadReportDateFormat);
          this.todate = this.datepipe.transform(filters.SearchFilters.toDate, this.pageConfig2.customParams.DownloadReportDateFormat);
          this.reportDate = this.datepipe.transform(this.reportDate, this.pageConfig2.customParams.DownloadReportDateFormat)
          // this.fromdate = data.body.ReconPmts.Summary.fromDate;
          //this.todate = data.body.ReconPmts.Summary.toDate;
          //this.reportDate = data.body.ReconPmts.Summary.reportDate
          // console.log('reportDate',this.reportDate)
        } else if (data.body.UnreconPmts != null) {
          data.body.ReconPmts == null
          //console.log('unrecon',data)
          this.dataSource = data.body.UnreconPmts[this.reportPageInfo.attributeName]
          this.dataSource2 = data.body.UnreconPmts[this.reportPageInfo.summattributeName];
          //console.log('fromDate',)
          this.fromdate = this.datepipe.transform(filters.SearchFilters.fromDate, this.pageConfig2.customParams.DownloadReportDateFormat);
          this.todate = this.datepipe.transform(filters.SearchFilters.toDate, this.pageConfig2.customParams.DownloadReportDateFormat);
          this.reportDate = this.datepipe.transform(this.reportDate, this.pageConfig2.customParams.DownloadReportDateFormat) //data.body.UnreconPmts.Summary.reportDate
          //console.log('reportDate',this.reportDate)
        }
      }
      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
        this.pageSettings.responseCount = this.pageSettings.responseCount = +this.pageConfig2?.customParams?.PageSize;//+data.headers.get('response-count')
        this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)

      }

      this.loaderService.hide();
    }, err => {
      if (err) {
        // this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
        this.loaderService.hide();
        this.dataSource = null;
        this.dataSource2 = null;
        this.showNoRecords = false;
        this.serviceNotResponded = true;
      }
      if (err == 'Error: Parameter "key" required') {
        this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
      }
    });
  }


  getPageAPIInfo() {
    let obj = {
      url: null,
      urll: null,
      pageName: null,
      attributeName: null,
      downloadName: null,
      summattributeName: null

    }

    if (location.href.indexOf(keyWords.standardReportsUrl) > -1) {
      // if(this.searchFilter.reportType== 'PMT_RECON'){
      //   obj.url = ApiPaths.getReconPmtsRpt;
      // }else if(this.searchFilter.reportType== 'PMT_UNRECON'){
      //   obj.url = ApiPaths.getUnreconPmtsRpt;
      // }
      if (this.reportId == keyWords.reportPmtRecon) {
        obj.url = ApiPaths.getReconPmtsRpt;
        obj.downloadName = this.translate.instant(keyWords.stdRpt_Recon)//download File Name
      }
      else if (this.reportId == keyWords.reportPmtUnrecon) {
        obj.url = ApiPaths.getUnreconPmtsRpt;
        obj.downloadName = this.translate.instant(keyWords.stdRpt_Unrecon)//download File Name
      }
      obj.pageName = keyWords.standardReportsPageName;

      obj.attributeName = keyWords.standardReportsAttributeName;
      obj.summattributeName = keyWords.standardReportsSummaryName;


    }
    this.reportPageInfo = obj;

  }

  openModal(template: TemplateRef<any>) {
    // this.approved=true
    // this.rejected=false
    // this.comment=null
    //this.modalRef = this.modalService.show(template);
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
    //}
  }

  generatePDF() {
    var doc = new jsPDF()
    var elementHTML: any = document.querySelector("#convertPDF");

    doc.html(elementHTML, {
      callback: function (doc) {

        doc.save('doc-html.pdf');
      },


      margin: [10, 0, 10, 0],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: 210,
      windowWidth: 675,



    })
  }

}