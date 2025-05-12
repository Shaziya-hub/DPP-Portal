import { Component, OnInit } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { RestApiService } from "src/app/services/rest-api.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpHeaders } from "@angular/common/http";
import { ChannelHandlerService } from "src/app/services/channel-handler.service";
import { NotificationService } from "src/app/services/notification.service";
import { DatePipe } from "@angular/common";
@Component({
    selector: 'app-channel-handler',
    templateUrl:'./channel-handler.component.html',
    styleUrls:['./channel-handler.component.scss']
  })

  export class ChannelHandlerComponent implements OnInit{

  username:any="mt@channel@321";
  password:any="QazWsx@mt321";
  status:any;
  url:any;
  mandatoryFlag:boolean=false
  

    constructor( private datePipe:DatePipe, private translate: TranslateService,private apiService:ChannelHandlerService,private sanitizer:DomSanitizer,private notification:NotificationService) {}

      config = {
        'page-number': "1",
        'ttl-recs-cnt-req': 'TRUE',
        'ttl-pages-cnt-req': 'TRUE',
        'request-type' : 'search'
       
      }

    ngOnInit(): void {}

    searchFilters={
        orgName:null,
        serviceName:null,
        serviceType:null,
        invoiceNumber:null,
        channelName:null,
        ammount:null,
        languageType:"ENGLISH",
        transType:'SALE',
        cusProfileId:null,
        senderId:null
    }

    dropdownSettings = {
        text: this.translate.instant("Select TransType"),//dynamically set the dropdown title
      }
  

    initiatePayment(){
      let date: string = "" 
date = this.datePipe.transform(new Date(), "yyyy-MM-ddThh:mm:ss")
        // let body={
        //     orgName:this.searchFilters.orgName,
        //     serviceName:this.searchFilters.serviceName,
        //     serviceType:this.searchFilters.serviceType,
        //     invoiceNumber:this.searchFilters.invoiceNumber,
        //     channelName:this.searchFilters.channelName,
        //     ammount:this.searchFilters.ammount,
        //     languageType:this.searchFilters.languageType,
        //     transType:this.searchFilters.transType,
        //     cusProfileId:this.searchFilters.cusProfileId,
        //     senderId:this.searchFilters.senderId
        // } 
        let body ={
          "orgName": this.searchFilters.orgName,
          "bizSvc": this.searchFilters.serviceName,
          "channel": this.searchFilters.channelName,
          "transType": this.searchFilters.transType,
          "senderId": this.searchFilters.senderId,
          "timestamp": date,//"2022-12-11T00:00:00",
          "consumer": {
            "profileId": this.searchFilters.cusProfileId,
            "notificationNum": "+918269231560",
            "langPref": "ENGLISH"
          },
          "svcDetails": [
            {
              "type": this.searchFilters.serviceType,
              "amount": this.searchFilters.ammount,
              "invoiceNumber": this.searchFilters.invoiceNumber
            }
          ]
        }

        if(this.searchFilters.serviceName == null || this.searchFilters.senderId == null || this.searchFilters.channelName == null || 
           this.searchFilters.cusProfileId == null ||  this.searchFilters.invoiceNumber == null || this.searchFilters.serviceType == null){
            this.mandatoryFlag=true
        }else{
            this.mandatoryFlag=false
          //let url='http://localhost:8086/DCH/api/getCheckoutSession'
        //let url='http://122.170.2.166:9071/DCH/api/getPmtLink'
          //let url='https://72.182.209.93:9091/DCH/api/getCheckoutSession'
          let url='https://testscheckout.com/DCH/api/getCheckoutSession'
        
         this.apiService.getauthenticateService(url,body,this.username,this.password).subscribe((data)=>{
            
            this.status=data.status;
            let url1=data.pmtLink
          
            if(data.status =="ERROR"){
              this.notification.showError(data.exceptionMsg)
            }else{
            this.url= this.sanitizer.bypassSecurityTrustResourceUrl(url1);
            }
         })
        }
    }

   
  }
