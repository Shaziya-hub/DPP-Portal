import { Component, OnInit } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { RestApiService } from "src/app/services/rest-api.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpHeaders } from "@angular/common/http";
import { ChannelHandlerService } from "src/app/services/channel-handler.service";
import { NotificationService } from "src/app/services/notification.service";
import { DatePipe } from "@angular/common";
import { ApiPaths } from "src/app/shared/utils";
import { DataGridComponent } from "./datagrid/data-grid.component";
import { LoaderService } from "src/app/services/loader.service";
@Component({
  selector: 'app-arbCheckout',
  templateUrl: './arbCheckout.component.html',
  styleUrls: ['./arbCheckout.component.scss']
})

export class ArbCheckoutComponent implements OnInit {

  constructor(private restApiService: RestApiService, private loaderService: LoaderService) { }

  dataSource: any
  showNoRecords: boolean;
  serviceNotResponded: boolean = false;
  arbCheckoutPageInfo: any
  body = {
    GetBillDetailsRq: {
      Header: {
        messageId: null,
        businessServiceName: null,
        organizationId: null,
        channelId: null,
        senderId: null,
        functionId: null,
        timestamp: null,
        language: null
      },
      GetBillDetailsRecRq: {
        Request: {
          profileId: null
        }
      }
    }
  }
  ngOnInit(): void {


    // let body={
    //     GetBillDetailsRq: {
    //         Header: {
    //           messageId: "93284719743192830012",
    //           businessServiceName: "LICENSES",
    //           organizationId: "MT",
    //           channelId: "DPP-PORTAL",
    //           senderId: "DPPPORTAL",
    //           functionId: "GetBillDetails",
    //           timestamp: "2022-11-19T11:11:11",
    //           language: "ENGLISH"
    //         },
    //         GetBillDetailsRecRq: {
    //           Request: {
    //             profileId:"1075135473"
    //           }
    //         }
    //       }
    //   }

    this.body.GetBillDetailsRq.Header.messageId = "93284719743192830012";
    this.body.GetBillDetailsRq.Header.businessServiceName = "LICENSES";
    this.body.GetBillDetailsRq.Header.organizationId = "MT";
    this.body.GetBillDetailsRq.Header.channelId = "DPP-PORTAL";
    this.body.GetBillDetailsRq.Header.senderId = "DPPPORTAL";
    this.body.GetBillDetailsRq.Header.functionId = "GetBillDetails";
    this.body.GetBillDetailsRq.Header.timestamp = "2022-11-19T11:11:11";
    this.body.GetBillDetailsRq.Header.language = "ENGLISH";
    this.body.GetBillDetailsRq.GetBillDetailsRecRq.Request.profileId = "1075135473"

    this.serviceCall();
  }

  serviceCall() {
    let url = ApiPaths.getBillDetails
    this.loaderService.show();
    this.restApiService.getArbCheckout(url, this.body).subscribe(data => {
      console.log('data', data)
      if (data.GetBillDetailsRs.GetBillDetailsRecRs.Status.status == 'ERROR') {
        this.dataSource = null;
        this.showNoRecords = true;
        this.serviceNotResponded = false;
        this.loaderService.hide();
      } else {
        this.showNoRecords = false;
        this.serviceNotResponded = false;
        this.dataSource = data.GetBillDetailsRs.GetBillDetailsRecRs.Response.Bills
        console.log('dataSource', this.dataSource)


      }
      this.loaderService.hide();
    },
      err => {
        if (err) {
          // this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
          this.loaderService.hide();
          this.dataSource = null;
          this.showNoRecords = false;
          this.serviceNotResponded = true;
        }
      }
    );
  }
}
