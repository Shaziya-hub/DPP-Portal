import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ColumnSettingsModalService } from "src/app/components/column-settings/column-settings-modal.service";
import { FiltersModel } from "src/app/model/filters.model";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { keyWords } from "src/app/shared/constant";
import { ApiPaths } from "src/app/shared/utils";

@Component({
  selector: 'app-dashboard',
  //templateUrl: './dashboard.component.html',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  pageConfig = null;
  dashboardPageInfo = null;
  dataSource = null;
  showNoRecords: boolean;
  fromDate: Date;
  toDate: Date;
  filters: FiltersModel = new FiltersModel();
  pmtGaugeData;
  pmtCardData;
  pmtReportData;
  pmtDoughnutData;
  pmtLineData;

  billReportData;
  billCardData;
  billDoughnutData;
  billBarData;
  billLineData;

  pageSettings = {
    responseCount: 0,
    totalRecordsCount: 0,
    ttlPagesCnt: 0
  };

  config = {
    'page-number': "1",
    'ttl-recs-cnt-req': 'TRUE',
    'ttl-pages-cnt-req': 'TRUE',

  }
  filter = {
    organizationId: ["0001"],
    serviceId: ['125', '101', '102', '106', '107', '119'],
    //interval:'day',
    fromDate: '2020-01-01T00:00:00',
    toDate: '2022-12-30T23:00:00'
  }

  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private datepipe: DatePipe, private notificationService: NotificationService,
    private translate: TranslateService, private columnService: ColumnSettingsModalService) {
    this.columnService.reportType = null
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.pageConfig = data.config.pageConfig;
      this.getPageAPIInfo();
    })

  }


  getPageAPIInfo() {
    let obj = {
      urlPmtStats: null,
      urlPmtRatio: null,
      pageName: null,
      attributeNamePmtStats: null,
      attributeNamePmtRatio: null,
      downloadName: null
    }
    if (location.href.indexOf(keyWords.dashboardPmtUrl) > -1) {
      obj.urlPmtStats = ApiPaths.getPmtStats;      //util.ts
      obj.pageName = keyWords.dashboardPmtPageName;            //pageName
      obj.attributeNamePmtStats = "PmtStats"; //to display the grid you need the attributeName
      // obj.downloadName="Payments_Settlement" //download File Name    
    }

    if (location.href.indexOf(keyWords.dashboardBillsUrl) > -1) {
      obj.urlPmtStats = ApiPaths.getPmtStats;      //util.ts
      obj.pageName = keyWords.dashboardBillsPageName;            //pageName
      obj.attributeNamePmtStats = "PmtStats"; //to display the grid you need the attributeName
      // obj.downloadName="Payments_Settlement" //download File Name    
    }

    this.dashboardPageInfo = obj;


  }
}
