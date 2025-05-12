import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { head } from 'lodash';
import { PageConfig } from 'src/app/model/page-config';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SharedService } from 'src/app/services/shared.service';
import { keyWords } from 'src/app/shared/constant';
import { deepClone } from 'src/app/shared/utils';
import { ParametersModalComponent } from './parameters-modal.component';



@Injectable()
export class ParametersModalService {

  // parameter: any;
  parameter: any = {
   // organizationId: null,
    serviceId: null,
    name: null,
    value: null,
    description: null
  };
  pageConfig: PageConfig;
  headerConfig: any;
  constructor(private modalService: NgbModal, private restAPI: RestApiService, private loader: LoaderService, private sharedService: SharedService,
    private notification: NotificationService, private translate: TranslateService) { }

  open(pageConfig, data = null, headerConfig) {
    this.headerConfig = headerConfig
    this.pageConfig = pageConfig;
    this.parameter = data;
    this.modalService.open(ParametersModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'lg' });
  }

  close() {
    this.modalService.dismissAll();
  }

  save(url, parameter) {
    // let data = {
    //   'request-type': url == '/restv2/updateParameters' ? 'edit' : 'add'
    // }
    let headerConfig = this.headerConfig//url == '/restv2/updateParameters' ? keyWords.updateRefundConfig:url == '/restv2/createParameter'?keyWords.initiateRefundConfig:keyWords.config//deepClone(this.headerConfig)
   // Object.assign(headerConfig, data)
    this.loader.show();
    this.restAPI.getOrUpdateData(url, parameter, headerConfig).subscribe(d => {
      url == '/restv2/updateParameters' ? this.notification.showSuccess(this.translate.instant(keyWords.parameterUpdated)) : this.notification.showSuccess(this.translate.instant(keyWords.parameterCreated));
      this.sharedService.refreshGrid.next();
      this.modalService.dismissAll();
      this.loader.hide();
    },
      (err) => {
        this.notification.showError(this.translate.instant(keyWords.serviceNotAvailable))
        this.loader.hide();
        this.modalService.dismissAll();
      });
  }
}