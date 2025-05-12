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
@Component({
    selector: 'app-methods',
    templateUrl: './methods.component.html',
    styleUrls: ['./methods.component.scss']
})

export class MethodsComponent implements OnInit {

    constructor(private router: Router, private restApiService: RestApiService, private loaderService: LoaderService, private datepipe: DatePipe) {

    }
    methods: any
    ngOnInit(): void {
        // this.loaderService.show();
        this.restApiService.selectedDataSource$.subscribe(data => {
            console.log('methdos', data)
            if (data != null) {
                this.methods = data
                this.methods.expiryTimestamp = this.datepipe.transform(this.methods.expiryTimestamp, 'dd/mm/yyyy');
                //   this.loaderService.hide();
            }
        })
    }

    sadadPayment() {
        this.router.navigate(['/sadadPayments'])
    }

    cardPayments() {

        //this.restApiService.getDataource(this.methods)
        this.router.navigate(['/createPayments'])
    }

}