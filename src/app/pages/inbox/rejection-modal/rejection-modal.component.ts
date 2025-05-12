import { Component } from '@angular/core';
import { ApiPaths } from 'src/app/shared/utils';
import { RejectionModalService } from './rejection-modal-service.service';

@Component({
  selector: 'app-rejection-modal',
  templateUrl: './rejection-modal.component.html',
  styleUrls: ['./rejection-modal.component.scss']
})
export class RejectionModalComponent {
  manualdata: any;
  pageConfig: any;
  comment: any;
  transId: any;
  createdTimestamp: any
  approve: any
  flag: any
  formSubmit: boolean = false;
  constructor(private rejectionModalService: RejectionModalService) { }
  ngOnInit(): void {
    if (this.rejectionModalService.manualdata) {
      this.manualdata = this.rejectionModalService.manualdata;
    }
    this.pageConfig = this.rejectionModalService.pageConfig;
    this.flag = this.rejectionModalService.flag
  }
  updateRefunds() {
    if (this.comment == null || this.comment == undefined) {
      this.formSubmit = true;
      return;
    }
    else {
      this.formSubmit = false;
      this.manualdata.comments = this.comment;

      delete this.manualdata.approvalStatus
      delete this.manualdata.lastUpdateTimestamp
      delete this.manualdata.reason
      delete this.manualdata.receivedDate
      delete this.manualdata.refundAmt
      delete this.manualdata.refundApprover
      delete this.manualdata.refundApproverEmail
      delete this.manualdata.refundInitiator
      delete this.manualdata.refundInitiatorEmail
      delete this.manualdata.refundReason
      delete this.manualdata.refundStatus
      delete this.manualdata.serviceName
      delete this.manualdata.transAmt
      let data = {
        "paymentRef": this.manualdata.paymentRef,
        "createdTimestamp": this.manualdata.createdTimestamp,
        "refundRejectionReason": this.comment, //polulate only incase of rejection
        "approve": "false",
        "reject": "true"
      }

      let body = {
        UpdateRefundRq: data
      }
      this.rejectionModalService.save(ApiPaths.updateManualRefund, body);
    }
  }
  close() {
    this.rejectionModalService.close();
  }
}
