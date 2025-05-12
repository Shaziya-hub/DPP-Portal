import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { toUpper } from "lodash";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { getTempSelectedList } from "src/app/shared/utils";
import { ManageResourcesModalComponent } from "../manage-resources-modal/manage-resources-modal.component";
//import { ManageResourcesModalComponent } from "./manage-resources-modal.component";
import { RolesManageResourceModalComponent } from "./roles-manage-resources-modal.component";

@Injectable()
export class RolesManageResourcesModalService {
    role;
    resourceData: any
    headerConfig: any
    constructor(private modalService: NgbModal, private rowDetailService: RowDetailsService) { }

    open(headerConfig) {
        this.headerConfig = headerConfig;
        this.modalService.open(RolesManageResourceModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: false, size: 'xl', backdrop: 'static' })
    }
    close(tempCurrentList) {

        this.rowDetailService.setlistOfTempRole(tempCurrentList)
        this.modalService.dismissAll()
        tempCurrentList = []

    }
    save(tempCurrentList) {
        tempCurrentList = []
        this.modalService.dismissAll()
    }

}