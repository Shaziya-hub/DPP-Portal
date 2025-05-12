import { Component, OnInit, ElementRef, Inject, Input, Renderer2, SecurityContext, ViewChild } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { RestApiService } from "src/app/services/rest-api.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpHeaders } from "@angular/common/http";
import { ChannelHandlerService } from "src/app/services/channel-handler.service";
import { NotificationService } from "src/app/services/notification.service";
import { DOCUMENT, DatePipe } from "@angular/common";
import { ApiPaths } from "src/app/shared/utils";
import { LoaderService } from "src/app/services/loader.service";
import { Router } from "@angular/router";
@Component({
    selector: 'app-createPayment',
    templateUrl: './createPayment.component.html',
    styleUrls: ['./createPayment.component.scss']
})

export class CreatePaymentsComponent implements OnInit {
    htmlPage: any;
    htmlData: any;
    hideMethod: boolean = false;

    constructor(private router: Router, private restApiService: RestApiService, private loaderService: LoaderService, private sanitizer: DomSanitizer,
        private renderer2: Renderer2, @Inject(DOCUMENT) private _document: Document, private datepipe: DatePipe) {

    }

    ngOnInit(): void {

        let body = {
            CreatePaymentRq: {
                Header: {
                    messageId: "{{$guid}}",
                    businessServiceName: "LICENSES",
                    channelId: "DPP-PORTAL",
                    senderId: "DPPPORTAL",
                    timestamp: "2023-11-13T12:37:00",
                    language: "ENGLISH"
                },
                CreatePaymentRecRq: {
                    profileId: "1075136473",
                    paymentMethod: "eCom-Pmts",
                    transactionType: "SALE",
                    Request: [
                        {
                            amount: "10",
                            Recipient: {
                                billNumber: "331111111111242",
                                serviceType: "TOURIST_ACCOM_FAC"
                            },
                            currencyCode: "SAR",
                            ExternalReference: {
                                Reference: [
                                    {
                                        id: "http://122.170.2.166:9071/arbservice/api/getPaymentRedirectParameters",
                                        type: "CHANNEL_RETURN_URL"
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }


        let timeStemp: any = this.datepipe.transform(new Date(), 'yyyy-MM-ddThh:mm:ss');
        //console.log("timeStemp is ",timeStemp);
        //console.log("card payment and billResponse to utilize in createpayment",this.billResponse);
        //console.log("this.dataOfSelectedRow is ",this.dataOfSelectedRow);
        let selectedLang = localStorage.getItem("selectedLang");
        //creatRequest.CreatePaymentRq.Header.businessServiceName=this.dataOfSelectedRow.businessServiceName;//this.billResponse.GetCustomerBillsRs.Header.businessServiceName
        body.CreatePaymentRq.Header.timestamp = timeStemp
        body.CreatePaymentRq.Header.messageId = "" + new Date().getTime();//this.billResponse.GetCustomerBillsRs.Header.messageId;
        body.CreatePaymentRq.Header.language = selectedLang != null && selectedLang != undefined && selectedLang != "" && selectedLang == 'en' ? "ENGLISH" : "ARABIC"
        //console.log("card payment and billResponse to utilize in createpayment",this.billResponse);
        //creatRequest.CreatePaymentRq.CreatePaymentRecRq.paymentMethod=paymentMethod;
        //creatRequest.CreatePaymentRq.CreatePaymentRecRq.Request[0].Recipient.billNumber=this.dataOfSelectedRow.billNumber;
        //creatRequest.CreatePaymentRq.CreatePaymentRecRq.Request[0].amount=this.dataOfSelectedRow.amount;
        //creatRequest.CreatePaymentRq.CreatePaymentRecRq.profileId=this.dataOfSelectedRow.profileId;
        let url = ApiPaths.createPayment
        this.loaderService.show();
        this.restApiService.createPayments(url, body).subscribe(data => {
            console.log('data', data)
            console.log("response got from create payment :", data);
            if (data && data?.CreatePaymentRs?.CreatePaymentRecRs?.Status.status == "SUCCESS") {
                let formDetail = data.CreatePaymentRs?.CreatePaymentRecRs.requestForm;
                let myForm = this.parse(formDetail);
                let epayTransId = data.CreatePaymentRs?.CreatePaymentRecRs.ePayTransId;
                localStorage.setItem("epayTransId", epayTransId);
                let businessServiceName = data.CreatePaymentRs?.Header.businessServiceName;
                //localStorage.setItem("epayId",epayTransId)
                localStorage.setItem("bizName", businessServiceName)
                console.log("myForm is ", myForm);

                this.htmlPage = formDetail;//response.CreatePaymentRs.CreatePaymentRecRs?.paymentPage;
                this.htmlPage = this.parse(this.htmlPage);
                this.loadUrl(this.htmlPage);

                this.htmlData = this.sanitizer.bypassSecurityTrustHtml(this.htmlPage)
                this.loaderService.hide();
            } else if (data && data.CreatePaymentRs?.CreatePaymentRecRs?.Status.status == "ERROR") {
                //this.notificationService.showError(data && data.CreatePaymentRs?.CreatePaymentRecRs?.Status.DisplayLabel.label)
                //this.serviceNotResponded=true;
                //this.closee=false;
                //this.errorDisplayedFromService=data && data.CreatePaymentRs?.CreatePaymentRecRs?.Status.DisplayLabel.label;

            } else {
                //this.notificationService.showError("Something went wrong please try again in Some time")

            }
        },

        )

    }


    parse(htmlInput: any): any {
        let parser = new DOMParser();
        let parsedDocument = parser.parseFromString(htmlInput, "text/html");
        // console.log(parsedDocument);
        //console.log("parsedDocument.all[0].textContent",parsedDocument.all[0].textContent);
        return parsedDocument.all[0].textContent;
    }
    loadUrl(htmlpage: string) {

        //<html><script>var reqBody={"contextPath" : "https://securepayments.alrajhibank.com.sa/pg/","paymentId" : "600202333155895554","merchantResponseURL" : "http://localhost:4200/mtapp/successpayment"}</script><script src="https://securepayments.alrajhibank.com.sa/pg/payment-widget/js/functions.js"></script><script src="https://securepayments.alrajhibank.com.sa/pg/payment-widget/js/tom-select.complete.min.js"></script><script type="text/javascript">payload();</script><body><div id="payment-widget-container" class="col-6 payment-widget-container"></div></body></html>
        //to read url from string 
        let el = document.createElement('html');
        el.innerHTML = this.htmlPage
        el.querySelector("head")
        let header = el.querySelector("head");
        header?.getElementsByTagName("script")[0]
        let body = header?.getElementsByTagName("script")[0];
        console.log("body is ", body);
        setTimeout(() => {
            this.loadSessionScript(body);
        }, 300)
        console.log("body is ", body);
        var paylod = header?.getElementsByTagName("script")[3];
        setTimeout(() => {
            let url = header?.getElementsByTagName("script")[1].src
            let url2 = header?.getElementsByTagName("script")[2].src
            var script = this.renderer2.createElement('script');
            script = this.renderer2.createElement('script');

            var script2 = this.renderer2.createElement('script');
            script2 = this.renderer2.createElement('script');
            // script.src = 'https://ncbtest.mtf.gateway.mastercard.com/form/version/56/merchant/TEST601000756/session.js';
            script.src = url
            script2.src = url2
            this.renderer2.appendChild(this._document.body, script);
            this.renderer2.appendChild(this._document.body, script2);

        }, 750)
        console.log("paylod is ", paylod);
        setTimeout(() => {
            this.loadPayloadScript(paylod);
        }, 1300)

        console.log("body 1 ",);


    }


    loadSessionScript(body: any) {
        var script2 = this.renderer2.createElement('script');
        script2.type = 'text/javascript';
        // script2.text = `console.log("testing");if (self === top) { var antiClickjack = document.getElementById("antiClickjack"); antiClickjack.parentNode.removeChild(antiClickjack); } else { top.location = self.location; } PaymentSession.configure({ fields: { card: { number: "#card-number", securityCode: "#security-code", expiryMonth: "#expiry-month", expiryYear: "#expiry-year" } }, frameEmbeddingMitigation: ["javascript"], callbacks: { initialized: function(response) { }, formSessionUpdate: function(response) { if (response.status) { if ("ok" == response.status) { console.log("Session updated with data: " + response.session.id); if (response.sourceOfFunds.provided.card.securityCode) { console.log("Security code was provided."); } } else if ("fields_in_error" == response.status) { console.log("Session update failed with field errors."); if (response.errors.cardNumber) { console.log("Card number invalid or missing."); } if (response.errors.expiryYear) { console.log("Expiry year invalid or missing."); } if (response.errors.expiryMonth) { console.log("Expiry month invalid or missing."); } if (response.errors.securityCode) { console.log("Security code invalid."); } } else if ("request_timeout" == response.status) { console.log("Session update failed with request timeout: " + response.errors.message); } else if ("system_error" == response.status) { console.log("Session update failed with system error: " + response.errors.message); } } else { console.log("Session update failed: " + response); } } }, interaction: { displayControl: { formatCard: "EMBOSSED", invalidFieldCharacters: "REJECT" } } }); function pay() { PaymentSession.updateSessionFromForm('card'); }`;
        script2.text = body.textContent;//`var reqBody={"contextPath" : "https://securepayments.alrajhibank.com.sa/pg/","paymentId" : "600202333148569574","merchantResponseURL" : "http://localhost:4200/mtapp/successpayment"}`
        console.log("body 2 ",);
        this.renderer2.appendChild(this._document.body, script2);
    }
    loadPayloadScript(payload: any) {
        var script3 = this.renderer2.createElement('script');
        script3.type = 'text/javascript';
        // script2.text = `console.log("testing");if (self === top) { var antiClickjack = document.getElementById("antiClickjack"); antiClickjack.parentNode.removeChild(antiClickjack); } else { top.location = self.location; } PaymentSession.configure({ fields: { card: { number: "#card-number", securityCode: "#security-code", expiryMonth: "#expiry-month", expiryYear: "#expiry-year" } }, frameEmbeddingMitigation: ["javascript"], callbacks: { initialized: function(response) { }, formSessionUpdate: function(response) { if (response.status) { if ("ok" == response.status) { console.log("Session updated with data: " + response.session.id); if (response.sourceOfFunds.provided.card.securityCode) { console.log("Security code was provided."); } } else if ("fields_in_error" == response.status) { console.log("Session update failed with field errors."); if (response.errors.cardNumber) { console.log("Card number invalid or missing."); } if (response.errors.expiryYear) { console.log("Expiry year invalid or missing."); } if (response.errors.expiryMonth) { console.log("Expiry month invalid or missing."); } if (response.errors.securityCode) { console.log("Security code invalid."); } } else if ("request_timeout" == response.status) { console.log("Session update failed with request timeout: " + response.errors.message); } else if ("system_error" == response.status) { console.log("Session update failed with system error: " + response.errors.message); } } else { console.log("Session update failed: " + response); } } }, interaction: { displayControl: { formatCard: "EMBOSSED", invalidFieldCharacters: "REJECT" } } }); function pay() { PaymentSession.updateSessionFromForm('card'); }`;
        script3.text = payload.textContent;//`var reqBody={"contextPath" : "https://securepayments.alrajhibank.com.sa/pg/","paymentId" : "600202333148569574","merchantResponseURL" : "http://localhost:4200/mtapp/successpayment"}`
        console.log("payload 3 ", payload.textContent);
        this.renderer2.appendChild(this._document.body, script3);
    }
}