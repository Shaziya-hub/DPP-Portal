import { Component } from "@angular/core";
import { PageConfig } from "src/app/model/page-config";
import { ApiPaths, deleteFilters, deepClone } from "src/app/shared/utils";
import { ProcessorConfigModalService } from "./processorconfig-modal.service";
import { keyWords } from "src/app/shared/constant";
import * as CryptoJS from 'crypto-js';
import { RestApiService } from "src/app/services/rest-api.service";

@Component({
    selector: './processorconfig-modal',
    templateUrl: './processorconfig-modal.component.html',
    styleUrls: ['processorconfig-modal.component.scss']
})

export class ProcessorConfigModalComponent {

    pageConfig: PageConfig;
    processorconfig = {
        pmtMethodId: null,
        serviceTypeId: null,
        processorUrl: null,
        processorUsername: null,
        processorPassword: null,
        merchantId: null,
        merchantName: null,
        hostName: null,
        fee: null,
        reportUsername: null,
        reportPassword: null,
        configId: null
    }
    processorconfigCopy: any;
    processPswd: boolean = false;
    processUsername: boolean = false;
    reportPswd: boolean = false;
    reportUsername: boolean = false;
    sensitiveLabel = {
        pmtMethodId: null,
        serviceTypeId: null,
        processorUrl: null,
        processorUsername: null,
        processorPassword: null,
        merchantId: null,
        merchantName: null,
        hostName: null,
        fee: null,
        reportUsername: null,
        reportPassword: null,
        configId: null
    };
    preview: any;
    constructor(private processorconfigModalService: ProcessorConfigModalService, private processorConfigModalService: ProcessorConfigModalService, private restapiService: RestApiService) { }

    ngOnInit() {
        this.pageConfig = this.processorConfigModalService.pageConfig
        this.preview = this.pageConfig?.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);

        setTimeout(() => {
            if (!this.preview) {
                let span = document.querySelectorAll('.icon');

                span?.forEach(s => {
                    let i = s.getElementsByTagName('i');
                    i[0].style.opacity = '0.5'
                    // console.log("i",i)
                })
            }
        }, 500)
        // console.log("preview",this.preview)

        if (this.processorConfigModalService.pageConfig) {
            this.pageConfig = this.processorConfigModalService.pageConfig;

        }
        if (this.processorconfigModalService.processorconfig) {
            this.processorconfig = this.processorconfigModalService.processorconfig;
            this.processorconfigCopy = JSON.parse(JSON.stringify(this.processorconfigModalService.processorconfig));
        }
        this.pageConfig?.selectableColumns.forEach((columName: any) => {
            columName?.type == keyWords.sensitiveType ? this.sensitiveLabel[columName.id] = true : this.sensitiveLabel[columName.id] = false;
            Object.keys(this.processorconfigCopy).forEach(key => {
                this.processorconfigCopy[key] = columName?.type == keyWords.sensitiveType && columName.id == key ? '*****' : this.processorconfigCopy[key]

            })
            //
        })

    }

    close() {
        this.processorconfigModalService.close()
    }
    save() {
        delete this.processorconfig.hostName
        let body = {

            ProcessorConfig: this.processorconfig
        }
        //passing encrypted data

        body?.ProcessorConfig?.pmtMethodId == null || body.ProcessorConfig.pmtMethodId == '' || body.ProcessorConfig.pmtMethodId == undefined ? delete body.ProcessorConfig.pmtMethodId : '';
        body.ProcessorConfig?.serviceTypeId == null || body.ProcessorConfig.serviceTypeId == '' || body.ProcessorConfig.serviceTypeId == undefined ? delete body.ProcessorConfig.serviceTypeId : '';
        body.ProcessorConfig?.processorUrl == null || body.ProcessorConfig.processorUrl == '' || body.ProcessorConfig.processorUrl == undefined ? delete body.ProcessorConfig.processorUrl : '';
        body?.ProcessorConfig?.processorUsername == null || body?.ProcessorConfig.processorUsername == '' || body?.ProcessorConfig.processorUsername == undefined ? delete body?.ProcessorConfig.processorUsername : '';
        body?.ProcessorConfig?.processorPassword == null || body?.ProcessorConfig.processorPassword == '' || body?.ProcessorConfig.processorPassword == undefined ? delete body?.ProcessorConfig.processorPassword : '';
        body?.ProcessorConfig?.merchantId == null || body?.ProcessorConfig.merchantId == '' || body?.ProcessorConfig.merchantId == undefined ? delete body?.ProcessorConfig.merchantId : '';
        body?.ProcessorConfig?.merchantName == null || body?.ProcessorConfig.merchantName == '' || body?.ProcessorConfig.merchantName == undefined ? delete body?.ProcessorConfig.merchantName : '';
        body?.ProcessorConfig?.hostName == null || body?.ProcessorConfig.hostName == '' || body?.ProcessorConfig.hostName == undefined ? delete body?.ProcessorConfig.hostName : '';
        body?.ProcessorConfig?.fee == null || body?.ProcessorConfig.fee == '' || body?.ProcessorConfig.fee == undefined ? delete body?.ProcessorConfig.fee : '';
        body?.ProcessorConfig?.reportUsername == null || body?.ProcessorConfig.reportUsername == '' || body?.ProcessorConfig.reportUsername == undefined ? delete body?.ProcessorConfig.reportUsername : '';
        body?.ProcessorConfig?.reportPassword == null || body?.ProcessorConfig.reportPassword == '' || body?.ProcessorConfig.reportPassword == undefined ? delete body?.ProcessorConfig.reportPassword : '';
        body?.ProcessorConfig?.configId == null || body?.ProcessorConfig.configId == '' || body?.ProcessorConfig.configId == undefined ? delete body?.ProcessorConfig.configId : '';

        if (body?.ProcessorConfig?.processorPassword) {
            this.restapiService.setSignPayload(deepClone(body));
            let cipherToken = keyWords.cipher_Token;
            var encrypted = CryptoJS.AES.encrypt(body?.ProcessorConfig?.processorPassword, cipherToken).toString();
            body.ProcessorConfig.processorPassword = encrypted
        }
        if (body?.ProcessorConfig?.reportPassword) {
            this.restapiService.setSignPayload(deepClone(body));
            let cipherToken = keyWords.cipher_Token;
            var encrypted = CryptoJS.AES.encrypt(body?.ProcessorConfig?.reportPassword, cipherToken).toString();
            body.ProcessorConfig.reportPassword = encrypted
        }
        this.processorConfigModalService.save(ApiPaths.updateProcessorConfig, body);
    }

    showPassword(fieldName) {
        if (this.preview) {
            this.processorconfigCopy[fieldName] = this.processorconfigCopy[fieldName] == '*****' ? this.processorconfig[fieldName] : '*****';
        }
        // console.log("this.processorconfig[fieldName] ",this.processorconfig[fieldName] ,this.processorconfigCopy[fieldName] )

        // fieldName == "processPswd" ? this.processPswd = !this.processPswd :
        // fieldName == "processUsername" ? this.processUsername = !this.processUsername :
        // fieldName == "reportPswd" ? this.reportPswd = !this.reportPswd :
        // fieldName == "reportUsername" ? this.reportUsername = !this.reportUsername : '';
    }

}

