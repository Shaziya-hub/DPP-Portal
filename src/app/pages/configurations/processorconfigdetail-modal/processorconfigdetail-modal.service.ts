import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from "src/app/model/page-config";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { SharedService } from "src/app/services/shared.service";
import { keyWords } from "src/app/shared/constant";
import { ApiPaths, deepClone } from "src/app/shared/utils";
import { ProcessorconfigDetailModalComponent } from "./processorconfigdetail-modal.component";

@Injectable()

export class ProcessorconfigDetailModalService {

    pageConfig: PageConfig;
    processorDetailData: any;
    processorDetail: any;
    headerConfig: any;
    constructor(private modalService: NgbModal, private loader: LoaderService, private apiService: RestApiService, private sharedService: SharedService, private notificationService: NotificationService, private translate: TranslateService) { }

    open(pageConfig, data, headerConfig) {
        this.headerConfig = headerConfig;
        this.pageConfig = pageConfig;
        if (data) {
            this.processorDetailData = data;
        }
        this.modalService.open(ProcessorconfigDetailModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'lg' })
    }

    close() {
        this.modalService.dismissAll()
    }

    save(url, processorDetail) {
        // let data = {
        //     'request-type': 'edit'
        // }
        let headerConfig = keyWords.updateRefundConfig//deepClone(this.headerConfig)
       // Object.assign(headerConfig, data)
        this.loader.show();
        this.apiService.getOrUpdateData(url, processorDetail, headerConfig).subscribe(data => {
            this.notificationService.showSuccess(this.translate.instant(keyWords.processorCOnfigDetailUpdated));
            this.sharedService.refreshGrid.next();
            this.modalService.dismissAll();
            this.loader.hide()
        },
            (err) => {

                this.loader.hide();
                this.modalService.dismissAll();
            });
    }
}