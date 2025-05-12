import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { ManageResourcesModalComponent } from "./manage-resources-modal.component";

@Injectable()
export class ManageResourcesModalService {
    role;
    roleData: any;

    constructor(private modalService: NgbModal, private rowDetails: RowDetailsService) { }

    open(roleIdData) {
        this.roleData = roleIdData
        this.modalService.open(ManageResourcesModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: false, size: 'xl', backdrop: 'static' })
    }
    close() {
        this.modalService.dismissAll()
    }
}