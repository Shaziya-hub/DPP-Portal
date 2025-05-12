import { Component, Input, Output } from "@angular/core";
import { PageConfig } from "src/app/model/page-config";
import { ApiPaths, deleteFilters, deepClone } from "src/app/shared/utils";
import { EndPointModalService } from "./endpoints-modal.service";
import { keyWords } from "src/app/shared/constant";
import * as CryptoJS from 'crypto-js';
import { RestApiService } from "src/app/services/rest-api.service";

@Component({
    selector: 'endpoints-modal',
    templateUrl: './endpoints-modal.component.html',
    styleUrls: ['./endpoints-modal.component.scss']
})

export class EndPointsModalComponent {

    pageConfig: PageConfig;
    endpoints: any = {
        endPoint: null,
        systemName: null,
        directory: null,
        username: null,
        password: null,
        timeout: null,
        transId: null

    }
    sensitiveLabel = {
        endPoint: null,
        systemName: null,
        directory: null,
        username: null,
        password: null,
        timeout: null,
        transId: null
    }
    endpointsCopy: any;
    isPassword = false;
    showUserName = false;
    data: any;
    constructor(private endpointsModalService: EndPointModalService, private restapiService: RestApiService) { }
    ngOnInit() {
        if (this.endpointsModalService.endpointData) {
            this.endpoints = this.endpointsModalService.endpointData;
        }

        if (this.endpointsModalService.pageConfig) {
            this.pageConfig = this.endpointsModalService.pageConfig;
            this.endpointsCopy = JSON.parse(JSON.stringify(this.endpointsModalService.endpointData));

            this.pageConfig?.selectableColumns?.forEach((columName: any) => {
                columName?.type == keyWords.sensitiveType ? this.sensitiveLabel[columName.id] = true : this.sensitiveLabel[columName.id] = false;
                Object.keys(this.endpointsCopy).forEach(key => {
                    this.endpointsCopy[key] = columName?.type == keyWords.sensitiveType && columName.id == key ? '*****' : this.endpointsCopy[key]

                })
                //
            })
            //console.log("sensitive data",this.sensitiveLabel)
        }
    }
    close() {
        this.endpointsModalService.close()
    }
    save() {
        // delete this.endpoints.operation;
        delete this.endpoints.pmtMethodName;
        delete this.endpoints.protocol;
        delete this.endpoints.serviceName;
        delete this.endpoints.serviceTypeName;
        delete this.endpoints.type;

        let body = {
            EndPoints: this.endpoints
        }
        body.EndPoints.directory == null || body.EndPoints.directory == '' || body.EndPoints.directory == undefined ? delete body.EndPoints.directory : '';
        body.EndPoints.endPoint == null || body.EndPoints.endPoint == '' || body.EndPoints.endPoint == undefined ? delete body.EndPoints.endPoint : '';
        body.EndPoints.operation == null || body.EndPoints.operation == '' || body.EndPoints.operation == undefined ? delete body.EndPoints.operation : '';
        body.EndPoints.password == null || body.EndPoints.password == '' || body.EndPoints.password == undefined ? delete body.EndPoints.password : '';
        body.EndPoints.systemName == null || body.EndPoints.systemName == '' || body.EndPoints.systemName == undefined ? delete body.EndPoints.systemName : '';
        body.EndPoints.timeout == null || body.EndPoints.timeout == '' || body.EndPoints.timeout == undefined ? delete body.EndPoints.timeout : '';
        body.EndPoints.transId == null || body.EndPoints.transId == '' || body.EndPoints.transId == undefined ? delete body.EndPoints.transId : '';
        body.EndPoints.username == null || body.EndPoints.username == '' || body.EndPoints.username == undefined ? delete body.EndPoints.username : '';
        //let filterss= deleteFilters(body)

        /*
        Future enhancement
        The below code is used to encrypt the password before sending to the server wiil be used in future
        */
        if (body.EndPoints?.password) {
            this.restapiService.setSignPayload(deepClone(body));

            let cipherToken = keyWords.cipher_Token;
            var encrypted = CryptoJS.AES.encrypt(body.EndPoints.password, cipherToken).toString();
            // console.log('encrypted',encrypted)
            body.EndPoints.password = encrypted
        }

        this.data = this.endpointsModalService.save(ApiPaths.updateEndPoints, body)

    }

    showPassword(fieldName) {
        let preview = this.pageConfig.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);
        if (preview) {
            this.endpointsCopy[fieldName] = this.endpointsCopy[fieldName] == '*****' ? this.endpoints[fieldName] : '*****';
        }
    }
}