import { Component, Input } from '@angular/core';
import { FiltersComponent } from '../filters.component';
import { TranslateService } from '@ngx-translate/core';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { ApiPaths, deepClone, deleteFilters } from 'src/app/shared/utils';
import { RestApiService } from 'src/app/services/rest-api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-refund-process',
  templateUrl: './refund-process.component.html',
  styleUrls: ['./refund-process.component.scss']
})
export class RefundProcessComponent {
  @Input() headerConfig;
  rowData: any;
  comment = null;
  refundAmt: null;
  refundFlag: boolean = false;
  pageId: any;
  date: any;
  receivedDate: any;
  filters: any;
  successMessage = null;
  errorMessage = null;
  refundAmtTooltip = keyWords.refundAmtTooltipTxt;
  constructor(private translate: TranslateService, public filterComponent: FiltersComponent, private restApi: RestApiService, private notificationService: NotificationService, private loader: LoaderService,
    private router: Router, private activateRoute: ActivatedRoute, private sharedService: SharedService, private datePipe: DatePipe) {

    this.activateRoute.queryParams.subscribe(data => this.pageId = data.pageId);
  }

  dropdownSettings = {
    singleSelection: false,
    selectAllText: this.translate.instant(dropdown.selectAllText),
    unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
    enableSearchFilter: true,
    badgeShowLimit: 1,
    searchPlaceholderText: this.translate.instant(dropdown.search),
    text: this.translate.instant(dropdown.allBizService),
    primaryKey: dropdown.serviceId,
    labelKey: dropdown.serviceName,
  }


  ngOnInit() {
    let state = history.state;
    this.rowData = state?.rowData;
    this.filters = deleteFilters(state?.filters)
    this.refundAmt = state?.rowData?.transAmt;
  }

  iniTiateRefund() {
    let datatodisplay = {
      serviceName: null,
      paymentRef: null,
      transAmt: null,
      refundAmt: null,
      receivedDate: null,
      refundReason: null,
      serviceId: null
    };
    datatodisplay.serviceName = this.rowData.serviceName;
    datatodisplay.paymentRef = this.rowData.paymentRef;
    datatodisplay.transAmt = this.rowData.transAmt;
    datatodisplay.refundAmt = String(this.refundAmt);
    datatodisplay.receivedDate = this.rowData.receivedDate;
    datatodisplay.refundReason = this.comment;
    datatodisplay.serviceId = this.rowData.serviceId
 

    let body = {
      InitiateManualRefundRq: datatodisplay
    }
   //this.headerConfig["request-type"] = 'add';
   let initiateRefundConfig = keyWords.initiateRefundConfig;
    body?.InitiateManualRefundRq?.serviceName == null || body?.InitiateManualRefundRq?.serviceName == '' || body?.InitiateManualRefundRq?.serviceName == undefined ? delete body?.InitiateManualRefundRq?.serviceName : '';
    body?.InitiateManualRefundRq?.paymentRef == null || body?.InitiateManualRefundRq?.paymentRef == '' || body?.InitiateManualRefundRq?.paymentRef == undefined ? delete body?.InitiateManualRefundRq?.paymentRef : '';
    body?.InitiateManualRefundRq?.transAmt == null || body?.InitiateManualRefundRq?.transAmt == '' || body?.InitiateManualRefundRq?.transAmt == undefined ? delete body?.InitiateManualRefundRq?.transAmt : '';
    body?.InitiateManualRefundRq?.refundAmt == null || body?.InitiateManualRefundRq?.refundAmt == '' || body?.InitiateManualRefundRq?.refundAmt == undefined ? delete body?.InitiateManualRefundRq?.refundAmt : '';
    body?.InitiateManualRefundRq?.receivedDate == null || body?.InitiateManualRefundRq?.receivedDate == '' || body?.InitiateManualRefundRq?.receivedDate == undefined ? delete body?.InitiateManualRefundRq?.receivedDate : '';
    body?.InitiateManualRefundRq?.refundReason == null || body?.InitiateManualRefundRq?.refundReason == '' || body?.InitiateManualRefundRq?.refundReason == undefined ? delete body?.InitiateManualRefundRq?.refundReason : '';
    body?.InitiateManualRefundRq?.serviceId == null || body?.InitiateManualRefundRq?.serviceName == '' || body?.InitiateManualRefundRq?.serviceName == undefined ? delete body?.InitiateManualRefundRq?.serviceName : '';
    this.loader.show();
    this.restApi.getOrUpdateData(ApiPaths.initiateManualRefund, body, initiateRefundConfig).subscribe(data => {
      this.refundFlag = true;
      this.successMessage = data?.initiateManualRefundRs?.successMessage?.split(":");
      this.errorMessage = data?.initiateManualRefundRs?.errorMessage?.split("<br>");
      this.sharedService.refreshGrid.next();
      this.loader.hide();
    },
      (err) => {
        this.refundFlag = false;
        //this.notificationService.showError(this.translate.instant(err))
        this.loader.hide();
      });
  }

  cancel() {
    this.router.navigate([keyWords.operationSubmitUrl], { queryParams: { pageId: this.pageId }, state: { gridFlag: true, filters: this.filters } })
  }
  navigateTo() {
    this.router.navigate(['dpp/inbox/refunds'], { queryParams: { pageId: keyWords.inboxPageId } })
  }
}