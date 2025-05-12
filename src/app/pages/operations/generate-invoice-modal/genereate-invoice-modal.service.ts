import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService } from "src/app/services/loader.service";
import { GenerateInvoiceModalComponent } from "./generate-invoice-modal.component";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class GenerateInvoiceModalService {
    clearFilter = new BehaviorSubject(false);





    constructor(private modalService: NgbModal, private loader: LoaderService, private translate: TranslateService) { }
    billNumber: any;
    open(billNumber) {
        // console.log("service", billNumber)
        if (billNumber != null && billNumber != undefined) {
            this.billNumber = billNumber;
        }
        this.modalService.open(GenerateInvoiceModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'md' });
    }

    close() {
        this.clearFilter.next(true);
        this.modalService.dismissAll();
    }
}