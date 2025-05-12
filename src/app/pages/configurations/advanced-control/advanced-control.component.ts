import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogService } from "src/app/components/confirmation-dialog/confirmation-dialog.service";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { keyWords } from "src/app/shared/constant";
import { ApiPaths, deepClone, deleteFilters, isUserHasAccess } from "src/app/shared/utils";
import { AdvancedControlModalService } from "../advanced-control-modal/advanced-control-modal.service";
import { AdvancedControlService } from "./advanced-control.service";

@Component({
    selector: 'advanced-control',
    templateUrl: 'advanced-control.component.html',
    styleUrls: ['advanced-control.component.scss']
})

export class AdvancedControlComponent {

    @Input('inputData') inputData: any[] = [];
    @Input('searchFilters') searchFilters;
    @Input('headerConfig') headerConfig;
    @Input("pageConfig") pageConfig;
    edited: boolean = false;
    canAdd: boolean = true;
    originalData: any[] = [];
    advancedControlData: any[] = [];
    isUserHasAccess: any;
    searchFiltersAdv: any = {
        "SearchFilters": {
            "organizationId": "",
            "serviceId": "",
            "selectionType": "",
            "configId": "",
            "channelId": "",
            "serviceTypeId": "",
            "methodId": ""
        }
    }

    constructor(private advancedControlModalService: AdvancedControlModalService,
        private advancedControlService: AdvancedControlService,
        private loader: LoaderService,
        private notificationService: NotificationService,
        private translate: TranslateService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit() {
        this.advancedControlData = [...this.inputData];

        this.advancedControlData && this.advancedControlData.forEach(row => {
            row['channels'] = [row['channels']];
            row['makeGreen'] = {};
        })

        this.originalData = [...this.advancedControlData];
        this.isUserHasAccess = isUserHasAccess(this.pageConfig?.permissions);
    }

    add(rowIndex, type) {
        let rightList = [];
        !this.advancedControlData[rowIndex][type] && (this.advancedControlData[rowIndex][type] = []);
        rightList = [...this.advancedControlData[rowIndex][type]];
        let channelId = '';
        let serviceTypeId = '';
        let pmtMethodId = '';
        this.advancedControlData[rowIndex]['serviceTypes'] && this.advancedControlData[rowIndex]['serviceTypes'].forEach((st) => {
            serviceTypeId = serviceTypeId == '' ? serviceTypeId + st.serviceTypeId : serviceTypeId + ',' + st.serviceTypeId;
        })
        this.advancedControlData[rowIndex]['channels'] && this.advancedControlData[rowIndex]['channels'].forEach((ch) => {
            channelId = channelId == '' ? channelId + ch.channelId : channelId + ',' + ch.channelId;
        })
        this.advancedControlData[rowIndex]['methods'] && this.advancedControlData[rowIndex]['methods'].forEach((pm) => {
            pmtMethodId = pmtMethodId == '' ? pmtMethodId + pm.pmtMethodId : pmtMethodId + ',' + pm.pmtMethodId;
        })
        this.searchFiltersAdv = {
            "SearchFilters": {
                "organizationId": this.searchFilters.organizationId,
                "serviceId": this.searchFilters.serviceId,
                "selectionType": type,
                "configId": this.advancedControlData[rowIndex] && this.advancedControlData[rowIndex].configId ? this.advancedControlData[rowIndex].configId : "",
                "channelId": channelId,
                "serviceTypeId": serviceTypeId,
                "pmtMethodId": pmtMethodId,
            }
        }
        let filters = deleteFilters(this.searchFiltersAdv)
        this.advancedControlService.checkAdvanceControls(ApiPaths.checkAdvAccessControls, filters, this.headerConfig).subscribe((data) => {
            let responseData = null;
            let leftList = [];
            responseData = data?.CheckAdvAccessControls ? data.CheckAdvAccessControls : {};
            let keys = Object.keys(responseData);
            keys && keys.forEach((key) => {
                if (type == key) {
                    responseData[key] && responseData[key].forEach((itemToPush) => {
                        let index = rightList.findIndex((rlItem) => {
                            if (type == "serviceTypes") {
                                return rlItem.serviceTypeId == itemToPush.serviceTypeId;
                            } else if (type == "methods") {
                                return rlItem.pmtMethodId == itemToPush.pmtMethodId;
                            } else if (type == "channels") {
                                return rlItem.channelId == itemToPush.channelId;
                            } else {
                                return -1;
                            }
                        });
                        // console.log(index,"<--itemToPush->",itemToPush);
                        (index == -1 || index == 0) && leftList.push(itemToPush);
                    })
                }
            })
            this.loader.hide();
            this.advancedControlModalService.open(type, leftList, rightList, rowIndex, this.popupClosed, this);
        });
        this.edited = true;
        this.validateCanAdd();
    }

    popupClosed(data, scope) {
        var that = scope;
        !that.advancedControlData[data.index][data.type] && (that.advancedControlData[data.index][data.type] = []);
        that.advancedControlData[data.index][data.type] = [...data.rightList];
        // that.advancedControlData[data.index][data.type].push({channelDescName:'some asdfghagiud',pmtMethodName:'some random stringas',serviceTypeDescName:'some random string'});
        if ((!data.leftList || (data.leftList && data.leftList.length == 0)) && (data.rightList && data.rightList.length > 0)) {
            that.advancedControlData[data.index]['makeGreen'][data.type] = true;
        } else {
            that.advancedControlData[data.index]['makeGreen'][data.type] = false;
        }
        // console.log(that.advancedControlData);
    }

    clear(rowIndex, type) {
        this.edited = true;
        this.advancedControlData[rowIndex][type] = null;
        this.validateCanAdd();
    }

    initiateItem(rowIndex, type) {
        this.advancedControlData[rowIndex][type] = [];
    }

    addRow() {
        if (this.edited) {
            this.notificationService.showError(this.translate.instant('You have unsaved configuration, Please save your changes first'));
        } else {
            !this.advancedControlData && (this.advancedControlData = []);
            this.advancedControlData.push({
                channels: null,
                serviceTypes: null,
                methods: null,
                makeGreen: {}
            });
            this.canAdd = false;
        }
    }

    save() {
        let valid = this.validateSave();
        if (valid) {
            this.openConfirmationDialog();
            this.canAdd = true    //if delete row without clicking on delete button, plus icon was not appearing
        } else {
            this.notificationService.showError('Please configure advanced access control before saving, nothing to save');
        }
    }

    validateCanAdd() {
        let makeCanAddTrue = true;
        for (let i = 0; i < this.advancedControlData.length; i++) {
            if (this.advancedControlData[i] &&
                (!this.advancedControlData[i]["channels"] || (this.advancedControlData[i]["channels"] && this.advancedControlData[i]["channels"].channelId)) &&
                (!this.advancedControlData[i]["serviceTypes"] || (this.advancedControlData[i]["serviceTypes"] && this.advancedControlData[i]["serviceTypes"].length == 0)) &&
                (!this.advancedControlData[i]["methods"] || (this.advancedControlData[i]["methods"] && this.advancedControlData[i]["methods"].length == 0))) {
                makeCanAddTrue = false;
                break;
            }
        }
        if (makeCanAddTrue) this.canAdd = true;
        else this.canAdd = false;
    }

    validateSave() {
        let valid = true;
        this.advancedControlData && this.advancedControlData.forEach(row => {
            if ((row.channels && row.channels.length > 0 && (
                !row.serviceTypes || (row.serviceTypes && row.serviceTypes.length == 0) ||
                !row.methods || (row.methods && row.methods.length == 0)
            )) ||
                (row.serviceTypes && row.serviceTypes.length > 0 && (
                    !row.channels || (row.channels && row.channels.length == 0) ||
                    !row.methods || (row.methods && row.methods.length == 0)
                )) ||
                (row.methods && row.methods.length > 0 && (
                    !row.serviceTypes || (row.serviceTypes && row.serviceTypes.length == 0) ||
                    !row.channels || (row.channels && row.channels.length == 0)
                ))) {
                valid = false;
                return;
            }
        })
        return valid;
    }
    deletedRowDetails: any = []
    deleteRow(index) {
        this.deletedRowDetails.push(this.advancedControlData[index]);
        // console.log( this.advancedControlData,"deleted row based on index",this.deletedRowDetails)
        this.advancedControlData.splice(index, 1);
        if (this.advancedControlData.length == 0 || this.validateCanAdd()) {
            this.canAdd = true;
        }
    }

    itemHovered(type, index) {
        if (document.getElementById(type + '-' + index) && document.getElementById(type + '-' + index).style) {
            document.getElementById(type + '-' + index).style.display = 'none';
        }
    }

    itemLeave(type, index) {
        if (document.getElementById(type + '-' + index) && document.getElementById(type + '-' + index).style) {
            document.getElementById(type + '-' + index).style.display = 'block';
        }
    }

    openConfirmationDialog() {
        this.confirmationDialogService.confirm(this.translate.instant('Save'), this.translate.instant('Do you really want to save ?'))
            .then((confirmed) => {
                if (confirmed) {
                    let data = {
                        "organizationId": this.searchFilters.organizationId,
                        "serviceId": this.searchFilters.serviceId,
                        "AdvAccessControls": []
                    }
                    this.advancedControlData && this.advancedControlData.forEach((obj) => {
                        let tempObj = {};
                        tempObj['configId'] = obj.configId ? obj.configId : '';
                        tempObj['channels'] = obj.channels && obj.channels[0] ? obj.channels[0] : {};
                        tempObj['serviceTypes'] = obj.serviceTypes ? obj.serviceTypes : [];
                        tempObj['methods'] = obj.methods ? obj.methods : [];
                        data['AdvAccessControls'].push(tempObj)
                    });

                    this.deletedRowDetails && this.deletedRowDetails.forEach((obj) => {
                        let tempObj = {};
                        tempObj['configId'] = obj.configId ? obj.configId : '';
                        tempObj['channels'] = obj.channels && obj.channels[0] ? obj.channels[0] : {};
                        tempObj['serviceTypes'] = obj.serviceTypes ? obj.serviceTypes : [];
                        tempObj['methods'] = obj.methods ? obj.methods : [];
                        data['AdvAccessControls'].push(tempObj)
                    });
                    let config = {
                        'request-type': 'edit'
                    }
                    let headerConfig = deepClone(this.headerConfig)
                    Object.assign(headerConfig, config)
                    this.advancedControlService.updateAdvanceControls(ApiPaths.updateAdvAccessControls, { "UpdateAdvAccessControlRq": data }, config).subscribe((res) => {
                        this.deletedRowDetails = [];
                        this.advancedControlData = res?.AdvAccessControls;
                        this.advancedControlData && this.advancedControlData.forEach(el => {
                            if (JSON.stringify(el.channels) !== '{}') {
                                el['channels'] = [el['channels']];
                                el['makeGreen'] = {}
                            }
                        })
                        this.loader.hide();
                        this.notificationService.showSuccess(this.translate.instant(keyWords.advUpdated));
                        //this.advancedControlData=holdLastRetain;

                        let index = this.advancedControlData?.findIndex(item => {
                            return ((!item.channels || (item.channels && !item.channels.channelId)) &&
                                (!item.serviceTypes || (item.serviceTypes && item.serviceTypes.length == 0)) &&
                                (!item.methods || (item.methods && item.methods.length == 0)));
                        });
                        if (index > -1) this.advancedControlData.splice(index, 1);
                        this.edited = false;
                    },
                        (err) => {
                            this.loader.hide();
                        })
                }
            })
            .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    }

}

