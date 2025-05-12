import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SharedService } from 'src/app/services/shared.service';
import { keyWords } from 'src/app/shared/constant';
import { RejectionModalComponent } from './rejection-modal.component';
import { ApiPaths } from 'src/app/shared/utils';

@Injectable({
  providedIn: 'root'
})
export class RejectionModalService {
  headerConfig: any;
  pageConfig: PageConfig;
  manualdata: any;
  flag: any
  constructor(private modalService: NgbModal, private loader: LoaderService, private apiService: RestApiService, private notificationService: NotificationService, private translate: TranslateService,
    private sharedService: SharedService) { }

  open(pageConfig, data, headerConfig, flag) {
    this.headerConfig = headerConfig
    this.pageConfig = pageConfig;
    this.flag = flag
    if (data) {
      this.manualdata = data;
    }
    this.modalService.open(RejectionModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'lg' });
  }
  flagFunction(pageConfig, data, headerConfig, flag) {
    this.flag = flag
    this.headerConfig = headerConfig
    this.pageConfig = pageConfig;
    this.save(ApiPaths.updateManualRefund, data)

  }
  save(url, initiateRefundData) {
    this.loader.show();
    /*
      Request-type is coming as search, for updateManualRefunds make it 'edit'
    */
    let headerConfig = url == ApiPaths.updateManualRefund ? keyWords.updateRefundConfig : this.headerConfig
    this.apiService.getOrUpdateData(url, initiateRefundData, headerConfig).subscribe(data => {
      if (this.flag == keyWords.approve) {
        this.notificationService.showSuccess(this.translate.instant(keyWords.refundApproved));
      } else if (this.flag == keyWords.reject) {
        this.notificationService.showError(this.translate.instant(keyWords.refundRejected));
      }

      this.sharedService.refreshGrid.next();
      this.modalService.dismissAll();
      this.loader.hide();
    },
      (err) => {
        this.sharedService.refreshGrid.next();
        this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable))
        this.loader.hide();
        this.close();
      });
  }
  close() {
    this.modalService.dismissAll();
  }
}
