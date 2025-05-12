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
import { LimitslocksModalComponent } from "./limitslocks-modal.component";

@Injectable()
export class LimitslocksModalService {
  pageConfig: PageConfig;
  limitlocks: any;
  limitslocksData: any;
  headerConfig: any;
  constructor(private modalService: NgbModal, private loader: LoaderService, private apiService: RestApiService, private sharedService: SharedService, private notifictionService: NotificationService,
    private translate: TranslateService) {

  }

  open(pageConfig, data = null, headerConfig) {
    this.headerConfig = headerConfig
    this.pageConfig = pageConfig;
    if (data) {
      this.limitlocks = data;
    }
    this.modalService.open(LimitslocksModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'lg' });
  }
  getRowData() {
    return this.limitlocks
  }

  getOrgId() {
    return this.pageConfig;
  }

  close() {
    this.modalService.dismissAll();
  }

  save(url, limitslocksData) {
    // let data = {
    //   'request-type': 'edit'
    // }
    let headerConfig = keyWords.updateRefundConfig//deepClone(this.headerConfig);
    //Object.assign(headerConfig, data)
    this.loader.show();
    this.apiService.getOrUpdateData(url, limitslocksData, headerConfig).subscribe(data => {
      this.notifictionService.showSuccess(this.translate.instant(keyWords.limitLockUpdated));
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