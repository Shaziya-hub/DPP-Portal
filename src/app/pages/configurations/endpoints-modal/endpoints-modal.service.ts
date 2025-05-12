import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from "src/app/model/page-config";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { SharedService } from "src/app/services/shared.service";
import { keyWords } from "src/app/shared/constant";
import { deepClone } from "src/app/shared/utils";
import { EndPointsModalComponent } from "./endpoints-modal.component";

@Injectable()
export class EndPointModalService {
    pageConfig: PageConfig
    endpointData;
    headerConfig;



    constructor(private modalService: NgbModal, private apiService: RestApiService, private loader: LoaderService, private sharedService: SharedService, private notificationService: NotificationService, private translate: TranslateService) { }

    open(pageConfig, data = null, headerConfig) {
        this.pageConfig = pageConfig;
        this.headerConfig = headerConfig;
        if (data) {
            this.endpointData = data;
        }
        this.modalService.open(EndPointsModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'lg' })
    }

    close() {
        this.modalService.dismissAll()
    }

    save(url, endpoints) {
        // let data = {
        //     'request-type': 'edit'
        // }
        let headerConfig = keyWords.updateRefundConfig//deepClone(this.headerConfig)
       // Object.assign(headerConfig, data)
        this.loader.show();
        this.apiService.getOrUpdateData(url, endpoints, headerConfig).subscribe(data => {
            this.notificationService.showSuccess(this.translate.instant(keyWords.endPointUpdated))
            this.sharedService.refreshGrid.next();
            this.modalService.dismissAll();
            this.loader.hide();
        },
            (err) => {

                this.loader.hide();
                this.modalService.dismissAll();
            });
    }
}