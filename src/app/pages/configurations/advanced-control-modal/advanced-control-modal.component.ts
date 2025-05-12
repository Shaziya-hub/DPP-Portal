import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/services/notification.service';
import { AdvancedControlModalService } from './advanced-control-modal.service';

@Component({
    selector: 'advanced-control-modal',
    templateUrl: 'advanced-control-modal.component.html',
    styleUrls: ['advanced-control-modal.component.scss']
})
export class AdvancedControlModalComponent implements OnInit {

    type: string = "";
    leftSearch: string = "";
    rightSearch: string = "";
    leftList: any[] = [];
    rightList: any[] = [];
    row: any;
    filteredLeftList: any[] = [];
    filteredRightList: any[] = [];

    constructor(private advancedControlModalService: AdvancedControlModalService,
        private notificationService: NotificationService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.type = this.advancedControlModalService.type;
        this.leftList = this.advancedControlModalService.leftList;
        this.rightList = this.advancedControlModalService.rightList;
        this.row = this.advancedControlModalService.row;
    }

    close() {
        this.advancedControlModalService.close(null)
    }

    save() {
        this.advancedControlModalService.close({
            type: this.type,
            rightList: this.rightList,
            index: this.row,
            leftList: this.leftList
        })
    }

    moveAllLeft() {
        this.leftList = [...this.leftList, ...this.rightList];
        this.rightList = [];
    }

    moveAllRight() {
        if (this.type == "channels" && this.leftList.length > 1) {
            this.notificationService.showError(this.translate.instant('You can move only one channel'));
        } else {
            this.rightList = [...this.rightList, ...this.leftList];
            this.leftList = [];
        }
    }

    moveLeft(index) {
        let item = this.rightList[index];
        this.rightList.splice(index, 1);
        this.leftList.push(item);
    }

    moveRight(index) {
        let item = this.leftList[index];
        if (this.type == "channels" && this.rightList.length > 0) {
            let rightItm = this.rightList.splice(0, 1);
            this.leftList.splice(index, 1, rightItm[0]);
        } else {
            this.leftList.splice(index, 1);
        }
        this.rightList.push(item);
    }

    searchLeft() {
        if (this.leftSearch) {
            if (this.type == "channels") {
                this.filteredLeftList = this.leftList.filter((item) => {
                    return item.channelName.toLowerCase().includes(this.leftSearch.toLowerCase());
                })
            }
            if (this.type == "serviceTypes") {
                this.filteredLeftList = this.leftList.filter((item) => {
                    return item.serviceTypeName.toLowerCase().includes(this.leftSearch.toLowerCase());
                })
            }
            if (this.type == "methods") {
                this.filteredLeftList = this.leftList.filter((item) => {
                    return item.pmtMethodName.toLowerCase().includes(this.leftSearch.toLowerCase());
                })
            }
        } else {
            this.filteredLeftList = [];
        }
    }

    searchRight() {
        if (this.rightSearch) {
            if (this.type == "channels") {
                this.filteredRightList = this.rightList.filter((item) => {
                    return item.channelName.toLowerCase().indexOf(this.rightSearch.toLowerCase()) > -1;
                })
            }
            if (this.type == "serviceTypes") {
                this.filteredRightList = this.rightList.filter((item) => {
                    return item.serviceTypeName.toLowerCase().indexOf(this.rightSearch.toLowerCase()) > -1;
                })
            }
            if (this.type == "methods") {
                this.filteredRightList = this.rightList.filter((item) => {
                    return item.pmtMethodName.toLowerCase().indexOf(this.rightSearch.toLowerCase()) > -1;
                })
            }
        } else {
            this.filteredRightList = [];
        }
    }

    moveLeftFromFiltered(item, index) {
        this.filteredRightList.splice(index, 1)
        let mainIndex = this.rightList.findIndex((rlItem) => {
            if (this.type == "serviceTypes") {
                return rlItem.serviceTypeId == item.serviceTypeId;
            } else if (this.type == "methods") {
                return rlItem.pmtMethodId == item.pmtMethodId;
            } else if (this.type == "channels") {
                return rlItem.channelId == item.channelId;
            } else {
                return -1;
            }
        })
        if (mainIndex > -1) {
            this.rightList.splice(mainIndex, 1);
            this.leftList.push(item);
        }
    }

    moveRightFromFiltered(item, index) {
        this.filteredLeftList.splice(index, 1)
        let mainIndex = this.leftList.findIndex((rlItem) => {
            if (this.type == "serviceTypes") {
                return rlItem.serviceTypeId == item.serviceTypeId;
            } else if (this.type == "methods") {
                return rlItem.pmtMethodId == item.pmtMethodId;
            } else if (this.type == "channels") {
                return rlItem.channelId == item.channelId;
            } else {
                return -1;
            }
        })
        if (mainIndex > -1) {
            this.leftList.splice(mainIndex, 1);
            this.rightList.push(item);
        }
    }
}
