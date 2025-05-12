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
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-sadadPayment',
  templateUrl: './sadadPayment.component.html',
  styleUrls: ['./sadadPayment.component.scss']
})

export class SadadPaymentsComponent implements OnInit {
  billNumber: any;
  constructor(private restApiService: RestApiService, private loaderService: LoaderService, private router: Router, private clipboard: Clipboard) { }
  //  methods:any
  // ngOnInit(): void {
  //     this.loaderService.show();
  //     this.restApiService.selectedDataSource$.subscribe(data=>{
  //         console.log('methdos',data)
  //         this.methods=data
  //         this.loaderService.hide();
  //     })
  // }

  ngOnInit(): void {
    this.loaderService.show();
    this.restApiService.selectedDataSource$.subscribe(data => {
      console.log('methdos', data)
      this.billNumber = data.billNumber;
      this.loaderService.hide();
    })
  }

  copy(billNumber: any) {
    console.log("copy", billNumber)
    this.clipboard.copy(billNumber)
  }
  backToMethod() {
    // this.router.navigate(['dpp/checkout/payments'])
    this.router.navigate(['/methods'])

  }
}