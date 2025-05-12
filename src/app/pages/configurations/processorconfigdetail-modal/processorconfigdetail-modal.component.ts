import { Component } from "@angular/core";
import { PageConfig } from "src/app/model/page-config";
import { ApiPaths, deepClone } from "src/app/shared/utils";
import { ProcessorconfigDetailModalService } from "./processorconfigdetail-modal.service";
import { keyWords } from "src/app/shared/constant";
import * as CryptoJS from 'crypto-js';
import { RestApiService } from "src/app/services/rest-api.service";
@Component({
    selector: 'processconfigdetail-modal',
    templateUrl: './processorconfigdetail-modal.component.html',
    styleUrls: ['./processorconfigdetail-modal.component.scss',]
})

export class ProcessorconfigDetailModalComponent {

    pageConfig: PageConfig;
    isAccessKey: boolean = false;
    isProcessorKey: boolean = false;
    processorDetailDataCopy: any;
    processorDetailData = {
        channelId: null,
        profileId: null,
        processorKey: null,
        accessKey: null,
        onCompletionUrl: null,
        onErrorUrl: null,
        postbackUrl: null,
        configId: null,
    }
    sensitiveLabel = {
        channelId: null,
        profileId: null,
        processorKey: null,
        accessKey: null,
        onCompletionUrl: null,
        onErrorUrl: null,
        postbackUrl: null,
        configId: null,
    };
    preview: any;
    //searchFilters:FiltersModel=new FiltersModel()
    constructor(private processorconfigdetailModalService: ProcessorconfigDetailModalService, private restapiService: RestApiService) { }

    ngOnInit() {
        this.pageConfig = this.processorconfigdetailModalService.pageConfig;
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
        if (this.processorconfigdetailModalService.processorDetailData) {
            this.processorDetailData = this.processorconfigdetailModalService.processorDetailData;
            this.processorDetailDataCopy = JSON.parse(JSON.stringify(this.processorconfigdetailModalService.processorDetailData));
        }

        this.pageConfig?.selectableColumnsDetails.forEach((columName: any) => {
            columName?.type == keyWords.sensitiveType ? this.sensitiveLabel[columName.id] = true : this.sensitiveLabel[columName.id] = false;
            Object.keys(this.processorDetailDataCopy).forEach(key => {
                this.processorDetailDataCopy[key] = columName?.type == keyWords.sensitiveType && columName.id == key ? '*****' : this.processorDetailDataCopy[key]

            })
            //
        })

        // console.log("sensitive label",this.sensitiveLabel)
    }
    close() {
        this.processorconfigdetailModalService.close();
    }

    save() {
        let body = {
            ProcessorConfigDetails: this.processorDetailData

        }
        body?.ProcessorConfigDetails?.channelId == null || body?.ProcessorConfigDetails.channelId == '' || body?.ProcessorConfigDetails.channelId == undefined ? delete body?.ProcessorConfigDetails.channelId : '';
        body?.ProcessorConfigDetails?.profileId == null || body?.ProcessorConfigDetails.profileId == '' || body?.ProcessorConfigDetails.profileId == undefined ? delete body?.ProcessorConfigDetails.profileId : '';
        body?.ProcessorConfigDetails?.processorKey == null || body?.ProcessorConfigDetails.processorKey == '' || body?.ProcessorConfigDetails.processorKey == undefined ? delete body?.ProcessorConfigDetails.processorKey : '';
        body?.ProcessorConfigDetails?.accessKey == null || body?.ProcessorConfigDetails.accessKey == '' || body?.ProcessorConfigDetails.accessKey == undefined ? delete body?.ProcessorConfigDetails.accessKey : '';
        body?.ProcessorConfigDetails?.onCompletionUrl == null || body?.ProcessorConfigDetails.onCompletionUrl == '' || body?.ProcessorConfigDetails.onCompletionUrl == undefined ? delete body?.ProcessorConfigDetails.onCompletionUrl : '';
        body?.ProcessorConfigDetails?.onErrorUrl == null || body?.ProcessorConfigDetails.onErrorUrl == '' || body?.ProcessorConfigDetails.onErrorUrl == undefined ? delete body?.ProcessorConfigDetails.onErrorUrl : '';
        body?.ProcessorConfigDetails?.postbackUrl == null || body?.ProcessorConfigDetails.postbackUrl == '' || body?.ProcessorConfigDetails.postbackUrl == undefined ? delete body?.ProcessorConfigDetails.postbackUrl : '';
        body?.ProcessorConfigDetails?.configId == null || body?.ProcessorConfigDetails.configId == '' || body?.ProcessorConfigDetails.configId == undefined ? delete body?.ProcessorConfigDetails.configId : '';
        this.restapiService.setSignPayload(deepClone(body));
        //passing encrypted data
        if (body?.ProcessorConfigDetails?.processorKey) {
             let cipherToken = keyWords.cipher_Token;
            var encrypted = CryptoJS.AES.encrypt(body?.ProcessorConfigDetails?.processorKey, cipherToken).toString();
            // console.log('encrypted',encrypted)
            body.ProcessorConfigDetails.processorKey = encrypted
        }
        if (body?.ProcessorConfigDetails?.accessKey) {
             let cipherToken = keyWords.cipher_Token;
            var encrypted = CryptoJS.AES.encrypt(body?.ProcessorConfigDetails?.accessKey, cipherToken).toString();
            //  console.log('encrypted',encrypted)
            body.ProcessorConfigDetails.accessKey = encrypted
        }
        this.processorconfigdetailModalService.save(ApiPaths.updateProcessorConfigDetails, body)
    }
    showPassword(fieldName) {
        if (this.preview) {
            this.processorDetailDataCopy[fieldName] = this.processorDetailDataCopy[fieldName] == '*****' ? this.processorDetailData[fieldName] : '*****';
        }
        // fieldName =='accessKey' ?this.isAccessKey = !this.isAccessKey : '';
        // fieldName =='processorKey' ?this.isProcessorKey = !this.isProcessorKey : ''
    }
}