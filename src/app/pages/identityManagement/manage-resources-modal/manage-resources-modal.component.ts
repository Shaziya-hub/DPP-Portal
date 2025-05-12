import { Component } from "@angular/core";
import { LoaderService } from "src/app/services/loader.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { keyWords } from "src/app/shared/constant";
import { ManageResourcesModalService } from "./manage-resources-modal.service";

@Component({
    selector: 'manage-resources-modal',
    templateUrl: './manage-resources-modal.component.html',
    styleUrls: ['./manage-resources-modal.component.scss']
})

export class ManageResourcesModalComponent {
    roleData: any;
    heading = keyWords.roleHeading;
    accountsTrx = [{
        view: "N",
        download: "N",
        edit: "N",
        delete: "N",
        add: "N",
        preview: "N"
    }]
    constructor(private manageResourceModalService: ManageResourcesModalService, private apiService: RestApiService, private rowDetailService: RowDetailsService, private loader: LoaderService) { }
    ngOnInit() {
        if (this.manageResourceModalService.roleData) {
            this.roleData = this.manageResourceModalService.roleData;
        }
    }
    close() {
        this.manageResourceModalService.close();
    }
    displayPermission(permissions: any) {
        this.accountsTrx = [{
            view: "N",
            download: "N",
            edit: "N",
            delete: "N",
            add: "N",
            preview: "N"
        }]
        for (let i = 0; i < permissions?.length; i++) {
            let account = permissions;
            if (account[i]?.type == keyWords.view) {
                this.accountsTrx[0].view = account[i].type
            } else if (account[i]?.type == keyWords.download) {
                this.accountsTrx[0].download = account[i].type
            } else if (account[i]?.type == keyWords.edit) {
                this.accountsTrx[0].edit = account[i].type
            } else if (account[i]?.type == keyWords.delete) {
                this.accountsTrx[0].delete = account[i].type
            } else if (account[i]?.type == keyWords.add) {
                this.accountsTrx[0].add = account[i].type
            } else if (account[i]?.type == keyWords.preview) {
                this.accountsTrx[0].preview = account[i].type
            }
        }
        return this.accountsTrx
    }

}


