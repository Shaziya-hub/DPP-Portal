import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';



@Injectable()
export class ConfirmationDialogService {

  constructor(private modalService: NgbModal, private translate: TranslateService) { }

  public confirm(
    title: string,
    message: string,
    btnOkText: string = this.translate.instant('OK'),
    btnCancelText: string = this.translate.instant('Cancel'),
    dialogSize: 'sm' | 'lg' = 'sm'): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      backdrop: 'static',
      backdropClass: 'customBackdrop'
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }

}