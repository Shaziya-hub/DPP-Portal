import { Component, OnInit } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { RestApiService } from "src/app/services/rest-api.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpHeaders } from "@angular/common/http";
import { ChannelHandlerService } from "src/app/services/channel-handler.service";
import { NotificationService } from "src/app/services/notification.service";
import { DatePipe } from "@angular/common";
import { ApiPaths } from "src/app/shared/utils";
import { LoaderService } from "src/app/services/loader.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-arbSuccess',
  templateUrl: './arbSuccess.component.html',
  styleUrls: ['./arbSuccess.component.scss']
})

export class ArbSuccessComponent implements OnInit {

  // constructor(private restApiService:RestApiService,private loaderService: LoaderService){
  constructor(private router: Router, private restApiService: RestApiService, private loaderService: LoaderService, private datepipe: DatePipe, private spinner: NgxSpinnerService) {

  }
  ePayTransId: any;
  totalAppliedAmount: any
  paymentRef: any
  success: any
  reasonDesc: any
  data: any
  ngOnInit(): void {

    let body = {
      UpdatePaymentRq: {
        Header: {
          messageId: "123",
          businessServiceName: "LICENSES",
          channelId: "DPP-PORTAL",
          senderId: "DPPPORTAL",
          timestamp: "2023-11-27T19:05:53",
          language: "ENGLISH"
        },
        UpdatePaymentRecRq: {
          ePayTransId: "37d3b808-8100-4798-9dae-22b5e0df1763"

        }
      }
    }

    let epay = localStorage.getItem('epayTransId');
    body.UpdatePaymentRq.UpdatePaymentRecRq.ePayTransId = epay
    let timeStemp: any = this.datepipe.transform(new Date(), 'yyyy-MM-ddThh:mm:ss');
    //console.log("timeStemp is ",timeStemp);
    //console.log("card payment and billResponse to utilize in createpayment",this.billResponse);
    //console.log("this.dataOfSelectedRow is ",this.dataOfSelectedRow);
    let selectedLang = localStorage.getItem("selectedLang");
    //creatRequest.CreatePaymentRq.Header.businessServiceName=this.dataOfSelectedRow.businessServiceName;//this.billResponse.GetCustomerBillsRs.Header.businessServiceName
    body.UpdatePaymentRq.Header.timestamp = timeStemp
    body.UpdatePaymentRq.Header.messageId = "" + new Date().getTime();//this.billResponse.GetCustomerBillsRs.Header.messageId;
    body.UpdatePaymentRq.Header.language = selectedLang != null && selectedLang != undefined && selectedLang != "" && selectedLang == 'en' ? "ENGLISH" : "ARABIC"
    let url = ApiPaths.updatePayment
    this.spinner.show();
    this.restApiService.createPayments(url, body).subscribe(data => {
      console.log('data', data)
      // this.success=data.UpdatePaymentRs.UpdatePaymentRecRs
      // this.loaderService.hide();
      this.data = data
      if (data && data?.UpdatePaymentRs?.UpdatePaymentRecRs?.Status.status == "SUCCESS") {

        this.ePayTransId = data.UpdatePaymentRs?.UpdatePaymentRecRs.ePayTransId;
        //localStorage.setItem("epayTransId", this.epayTransId);
        this.totalAppliedAmount = data.UpdatePaymentRs?.UpdatePaymentRecRs.totalRequestedAmount;
        this.paymentRef = data.UpdatePaymentRs?.UpdatePaymentRecRs.paymentRef

        //localStorage.setItem("epayId",epayTransId)
        //   localStorage.setItem("bizName",businessServiceName)

        this.reasonDesc = data.UpdatePaymentRs?.UpdatePaymentRecRs.Status.reasonDesc

        this.spinner.hide();
      } else if (data && data.UpdatePaymentRs?.UpdatePaymentRecRs?.Status.status == "ERROR") {
        //this.notificationService.showError(data && data.CreatePaymentRs?.CreatePaymentRecRs?.Status.DisplayLabel.label)
        //this.serviceNotResponded=true;
        //this.closee=false;
        //this.errorDisplayedFromService=data && data.CreatePaymentRs?.CreatePaymentRecRs?.Status.DisplayLabel.label;
        this.reasonDesc = data.UpdatePaymentRs?.UpdatePaymentRecRs.Status.reasonDesc
        this.spinner.hide();
      } else {
        //this.notificationService.showError("Something went wrong please try again in Some time")

      }

      localStorage.removeItem('epayTransId');
    },

    )
  }

  goBack() {
    this.router.navigate(['/arb-checkout'])
  }
}