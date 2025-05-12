import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdvancedControlModalComponent } from './advanced-control-modal.component';



@Injectable()
export class AdvancedControlModalService {

  type: string = "";
  rightList: any[] = [];
  leftList: any[] = [];
  cb: any;
  row: any;
  scope: any;

  constructor(private modalService: NgbModal) { }

  open(type, leftList, rightList, row, cb, scope) {
    this.cb = cb;
    this.type = type;
    this.leftList = leftList;
    this.rightList = rightList;
    this.row = row;
    this.scope = scope;
    this.modalService.open(AdvancedControlModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'lg', backdrop: 'static' });
  }

  close(data) {
    data && this.cb(data, this.scope);
    this.modalService.dismissAll();
  }
}