import { Component } from "@angular/core";
import { RestApiService } from "src/app/services/rest-api.service";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { RolesManageResourcesModalService } from "./roles-manage-resources-modal.service";
import { ApiPaths, countOfSelectedList, deepClone, getParenId, getSelectedOrUnselectedList, getTempSelectedList, getUniqueData, removeDuplicateFromListOfObject, selectAllColumn, selectAllOrDeselectAll } from "src/app/shared/utils";
import { ManageResourcesModalService } from "../manage-resources-modal/manage-resources-modal.service";
import { flatMap, template } from "lodash";
import { keyWords } from "src/app/shared/constant";

@Component({
    selector: 'roles-manage-resources-modal',
    templateUrl: './roles-manage-resources-modal.component.html',
    styleUrls: ['./roles-manage-resources-modal.component.scss']
})

export class RolesManageResourceModalComponent {

    roleData: any;
    resource: any
    menu: any
    show: boolean = true;
    roleId: any
    menuId: any
    row
    selectDemo = {
        Settlement: false,
        Identity_Management: false,
        Reconciliation: false,
        Configuration: false,
        Uploads: false,
        Transactions: false
    }
    headingFlag: boolean
    searchFilters = {
        menu: null
    }
    resourceDetails: any = []
    menuIdArray: any = []
    isover: boolean = false
    subpageList: any = []

    serverCount: any = [];


    pageId: string;
    id: string;
    type: string
    parentPageId: string
    checkHeader: boolean
    parentIdAndCount: any = []

    submenuPass: any = []
    tempCheckedList: any = []
    headerElement = [{ type: 'View', isView: 'false' }, { type: 'Download', isDownload: 'false' }, { type: 'Edit', isEdit: 'false' }, { type: 'Delete', isDelete: 'false' }, { type: 'Add', isAdd: 'false' }];

    resourceRoleData = null;
    isChecked: boolean = false;
    rowdata: any;
    allSelectCountTemmp: any = [];
    viewCount: any = []
    downloadCount: any = []
    editCount: any = []
    deleteCount: any = []
    addCount: any = []

    iniViewsta: any = []
    iniDownloadCount: any = []
    iniEditCount: any = []
    iniDeleteCount: any = []
    iniAddCount: any = []
    calculateAllParentPagePermission: any = [];
    getParenId: any = getParenId;
    tempHoldForCancel: any = [];
    cusParentId: string;
    cusType: string;
    tempCurrentList: any = []
    isAllSelected = false;
    displayColumnText: any = []
    holdcolumnDetail: any = [];
    constructor(private rolesmanageResourceModalService: RolesManageResourcesModalService, private apiService: RestApiService, private rowDetailService: RowDetailsService) {

    }

    ngOnInit() {
        this.getData();

    }

    getData() {

        let tempServecount: any;
        //getting grid row data
        // this.rowDetailService?.rowDetail$?.subscribe(row =>{
        //    this.resourceRoleData=row 
        // }); 
        //to assign row resourceData to behaviourObj in edit case
        this.resourceRoleData != null && this.resourceRoleData?.resourceDetails != null ? this.setEditListInTempLies(this.resourceRoleData.roleId, this.resourceRoleData?.resourceDetails) : '';


        let lastSelectedLIst = getTempSelectedList(this.rowDetailService);
        this.rowDetailService.countServerPermission$.subscribe(data => {
            tempServecount = data
            data != null && data != undefined ? this.calculateAllParentPagePermission = data : ''
        })
        let body = {
            roleId: this.resourceRoleData?.roleId ? this.resourceRoleData.roleId : null
        }

        this.apiService.getOrUpdateUserData(ApiPaths.getResourcesByUser, body, this.rolesmanageResourceModalService.headerConfig).subscribe((data: any) => {
            this.menu = data?.ResourceDetails?.menu;

            //set the servercount in edit case
            this.resourceRoleData != null && this.resourceRoleData != undefined ? this.setServerCountOnEdit(this.menu, this.resourceRoleData.roleId) : '';

            for (let sub of this.menu) {
                let countAll = 0
                let viewCount = 0;
                let editCount = 0
                let deleteCount = 0
                let addCount = 0;
                let downloadCount = 0;
                //  this.displayColumnText=  this.setCheckBoxForRoot(sub.id);
                let serverPermission = { parentId: '', serverPermissionCount: 0, viewCount: 0, editCount: 0, downloadCount: 0, addCount: 0, deleteCount: 0 }
                let countFountd = { parentId: '', viewCount: 0, editCount: 0, deleteCount: 0, addCount: 0, downloadCount: 0 }
                if (lastSelectedLIst != null && lastSelectedLIst != undefined && lastSelectedLIst.length > 0) {
                    this.tempCurrentList = lastSelectedLIst;
                    let temListDetais = lastSelectedLIst.find(find => find.parentId == sub.id)
                    if (temListDetais != undefined && temListDetais != null && temListDetais.parentId == sub.id) {

                        sub.subMenu.forEach(submenu => {
                            let templist = temListDetais.customMenu.subMenu.find(temp => temp.id == submenu.id)
                            submenu.permissions.forEach(element => {

                                if (templist != null && templist != undefined) {
                                    templist.permissions.forEach(tempPerm => {
                                        if (tempPerm.flag != 'na') {
                                            //  countPer++
                                            countAll++
                                        }


                                        element.type == tempPerm.type ? element.flag = tempPerm.flag : element.flag = element.flag;

                                        if (tempServecount != null && tempServecount != undefined && tempServecount.length) {
                                            let serverPerm = tempServecount.find(f => f.parentId == temListDetais.parentId)
                                            if (serverPerm != null && serverPerm != undefined) {
                                                //serverPerm.serverPermissionCount== countAll?this.selectDemo[sub.displayName] = true:'';
                                                serverPerm.serverPermissionCount == countAll ? this.selectDemo[sub.displayName] = true : '';
                                            }
                                            //

                                        }

                                        //element.type == tempPerm.type && element.flag=='true'? countAll++:''
                                    })
                                }
                            });

                        })

                        let parenObject = temListDetais != null && temListDetais != undefined && this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(f => f.parentId == temListDetais.parentId) : null
                        this.selectAllBasedOnServerCount(temListDetais, temListDetais.parentId, parenObject, sub)
                    }
                }

                // let countPer = 0
                serverPermission = { parentId: sub.id, serverPermissionCount: 0, viewCount: 0, editCount: 0, downloadCount: 0, addCount: 0, deleteCount: 0 }
                countFountd = { parentId: sub.id, viewCount: 0, editCount: 0, deleteCount: 0, addCount: 0, downloadCount: 0 }

                for (let suofSu of sub.subMenu) {
                    let sum = {
                        displayName: suofSu.displayName,
                        id: suofSu.id,
                        rootId: sub.id,
                        permissions: {
                            viewPermission: { view: "N", flag: false },
                            downloadPermission: { download: "N", flag: false },
                            editPemission: { edit: "N", flag: false },
                            deletePermission: { delete: "N", flag: false },
                            addPermission: { add: "N", flag: false },
                            flag: false
                        }
                    }


                    // this.displayPermission(data)
                    for (let permission of suofSu.permissions) {
                        if (permission.flag != 'na') {
                            //  countPer++
                            countAll++
                        }
                        let data = permission;
                        if (data?.type == keyWords.view) {
                            sum.permissions.viewPermission.view = keyWords.view
                            sum.permissions.viewPermission.flag = data.flag
                            if (permission.flag != 'na') {
                                viewCount++
                                if (permission.flag == 'true') {
                                    countFountd.viewCount = +countFountd.viewCount + 1
                                }

                            }
                        }
                        if (data?.type == keyWords.download) {
                            sum.permissions.downloadPermission.download = keyWords.download
                            sum.permissions.downloadPermission.flag = data?.flag
                            if (permission.flag != 'na') {
                                downloadCount++;
                                if (permission.flag == 'true') {
                                    countFountd.downloadCount = +countFountd.downloadCount + 1
                                }
                            }
                        } if (data?.type == keyWords.edit) {
                            sum.permissions.editPemission.edit = keyWords.edit
                            sum.permissions.editPemission.flag = data?.flag
                            if (permission.flag != 'na') {
                                editCount++
                                if (permission.flag == 'true') {
                                    countFountd.editCount = +countFountd.editCount + 1
                                }
                            }
                        }
                        if (data?.type == keyWords.delete) {
                            sum.permissions.deletePermission.delete = keyWords.delete
                            sum.permissions.deletePermission.flag = data?.flag
                            if (permission.flag != 'na') {
                                deleteCount++;
                                if (permission.flag == 'true') {
                                    countFountd.deleteCount = +countFountd.deleteCount + 1
                                }
                            }
                        }
                        if (data?.type == keyWords.add) {
                            sum.permissions.addPermission.add = keyWords.add
                            sum.permissions.addPermission.flag = data?.flag
                            if (permission.flag != 'na') {
                                addCount++;
                                if (permission.flag == 'true') {
                                    countFountd.addCount = +countFountd.addCount + 1
                                }
                            }
                        }
                    }
                    this.submenuPass.push(sum)

                }
                serverPermission.serverPermissionCount = countAll;
                serverPermission.addCount = addCount;
                serverPermission.viewCount = viewCount;
                serverPermission.deleteCount = deleteCount;
                serverPermission.editCount = editCount;
                serverPermission.downloadCount = downloadCount;

                this.holdcolumnDetail.push(countFountd)

                if (tempServecount == null || tempServecount == undefined) {

                    this.calculateAllParentPagePermission?.push(serverPermission)

                }

            }
            let uniqueServerCount = getUniqueData(this.calculateAllParentPagePermission, 'parentId')
            this.rowDetailService.setServerCount(uniqueServerCount)
            this.setRolwColumn(this.calculateAllParentPagePermission, this.holdcolumnDetail, this.resourceRoleData)
        })
    }



    onChange(event: any, menu: any, pageId: string, parentId: string, type: string) {
        let v = 0
        let countFountd = { parentId: parentId, viewCount: 0, editCount: 0, deleteCount: 0, addCount: 0, downloadCount: 0 }
        let temParentObj = null;
        this.isAllSelected = false;

        getSelectedOrUnselectedList(event, menu, parentId, pageId, type, this.rowDetailService)
        // this.rowDetailService.tempSelectedList$.subscribe(tempselectedDetails=>{
        let tempselectedDetails = getTempSelectedList(this.rowDetailService)
        temParentObj = tempselectedDetails != null && tempselectedDetails.length > 0 ? tempselectedDetails.find(ff => ff.parentId == parentId) : null
        //To update the template checkboxes on onChange function
        if (temParentObj != null && temParentObj != undefined) {
            temParentObj?.customMenu.subMenu.forEach(pageId => {
                pageId.permissions.forEach(perm => {
                    let subMenuPassObj = this.submenuPass.find(customObj => customObj.rootId == parentId && pageId.id == customObj.id)
                    subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == perm.type ? subMenuPassObj.permissions.viewPermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == perm.type ? subMenuPassObj.permissions.downloadPermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == perm.type ? subMenuPassObj.permissions.editPemission.flag = perm.flag : ''
                    subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == perm.type ? subMenuPassObj.permissions.deletePermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == perm.type ? subMenuPassObj.permissions.addPermission.flag = perm.flag : ''
                })
            })
        }
        // })
        let parenObject = this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(f => f.parentId == parentId) : null

        this.selectAllBasedOnServerCount(temParentObj, parentId, parenObject, menu)
        this.cusParentId = ''
        this.cusType = ''

        let getExistingDetails = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.find(f => f.parentId == parentId) : '';
        if (event.target.checked) {
            if ((getExistingDetails == undefined || getExistingDetails == "" || getExistingDetails.viewCount == 0) && type == keyWords.view && parenObject.parentId == parentId) {
                v++
                countFountd.viewCount = v;
                if (countFountd.viewCount == parenObject.viewCount) {
                    document.getElementById(parentId + "_View")[keyWords.checked] = true;


                }
            } else if (getExistingDetails != undefined && getExistingDetails != null && type == keyWords.view && parenObject.parentId == parentId) {
                countFountd.viewCount = getExistingDetails.viewCount
                countFountd.viewCount = +countFountd.viewCount + 1;
                if (countFountd.viewCount == parenObject.viewCount) {
                    document.getElementById(parentId + "_View")[keyWords.checked] = true;
                }
            } else if ((getExistingDetails == undefined || getExistingDetails == "" || getExistingDetails.downloadCount == 0) && type == keyWords.download && parenObject.parentId == parentId) {
                v++
                countFountd.downloadCount = v;
                if (countFountd.downloadCount == parenObject.downloadCount) {
                    document.getElementById(parentId + "_Download")[keyWords.checked] = true;
                }
            } else if (getExistingDetails != undefined && getExistingDetails != null && type == keyWords.download && parenObject.parentId == parentId) {
                countFountd.downloadCount = getExistingDetails.downloadCount

                countFountd.downloadCount = +countFountd.downloadCount + 1;
                if (countFountd.downloadCount == parenObject.downloadCount) {
                    document.getElementById(parentId + "_Download")[keyWords.checked] = true;
                }
            } else if ((getExistingDetails == undefined || getExistingDetails == "" || getExistingDetails.editCount == 0) && type == keyWords.edit && parenObject.parentId == parentId) {
                v++
                countFountd.editCount = v;
                if (countFountd.editCount == parenObject.editCount) {
                    document.getElementById(parentId + "_Edit")[keyWords.checked] = true;

                }
            } else if (getExistingDetails != undefined && getExistingDetails != null && type == keyWords.edit && parenObject.parentId == parentId) {
                countFountd.editCount = getExistingDetails.editCount

                countFountd.editCount = +countFountd.editCount + 1;
                if (countFountd.editCount == parenObject.editCount) {
                    document.getElementById(parentId + "_Edit")[keyWords.checked] = true;
                }
            } else if ((getExistingDetails == undefined || getExistingDetails == "" || getExistingDetails.deleteCount == 0) && type == keyWords.delete && parenObject.parentId == parentId) {
                v++
                countFountd.deleteCount = v;
                if (countFountd.deleteCount == parenObject.deleteCount) {
                    document.getElementById(parentId + "_Delete")[keyWords.checked] = true;


                }
            } else if (getExistingDetails != undefined && getExistingDetails != null && type == keyWords.delete && parenObject.parentId == parentId) {
                countFountd.deleteCount = getExistingDetails.deleteCount

                countFountd.deleteCount = +countFountd.deleteCount + 1;
                if (countFountd.deleteCount == parenObject.deleteCount) {

                    document.getElementById(parentId + "_Delete")[keyWords.checked] = true;
                }
            }
            else if ((getExistingDetails == undefined || getExistingDetails == "" || getExistingDetails.addCount == 0) && type == keyWords.add && parenObject.parentId == parentId) {
                v++
                countFountd.addCount = v;
                if (countFountd.addCount == parenObject.addCount) {
                    document.getElementById(parentId + "_Add")[keyWords.checked] = true;


                }
            } else if (getExistingDetails != undefined && getExistingDetails != null && type == keyWords.add && parenObject.parentId == parentId) {
                countFountd.addCount = getExistingDetails.addCount

                countFountd.addCount = +countFountd.addCount + 1;

                if (countFountd.addCount == parenObject.addCount) {

                    document.getElementById(parentId + "_Add")[keyWords.checked] = true;
                }
            }






            let index = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.findIndex(f => f.parentId == parentId) : '';
            //console.log("chckIfExist is ",index);
            if (index > -1) {
                let temp = this.holdcolumnDetail.find(find => find.parentId == parentId);
                if (type != 'View' && temp != null && temp != undefined) {
                    countFountd.viewCount = temp.viewCount
                } if (type != 'Download' && temp != null && temp != undefined) {
                    countFountd.downloadCount = temp.downloadCount
                } if (type != 'Edit' && temp != null && temp != undefined) {
                    countFountd.editCount = temp.editCount
                }
                if (type != 'Delete' && temp != null && temp != undefined) {
                    countFountd.deleteCount = temp.deleteCount
                }
                if (type != 'Add' && temp != null && temp != undefined) {
                    countFountd.addCount = temp.addCount
                }
                this.holdcolumnDetail.splice(index, 1)
                this.holdcolumnDetail.push(countFountd);
            } else {
                this.holdcolumnDetail.push(countFountd);

            }
        } if (!event.target.checked) {
            //console.log("this.holdcolumnDetail check while untick",this.holdcolumnDetail);
            let index = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.findIndex(f => f.parentId == parentId) : '';
            let findObjectToRemove = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.find(f => f.parentId == parentId) : '';
            if (getExistingDetails != undefined && getExistingDetails.viewCount > 0 && type == "View") {
                // console.log("getExistingDetails.viewCount is ",getExistingDetails.viewCount);
                findObjectToRemove.viewCount = +getExistingDetails.viewCount - 1
                // console.log("getExistingDetails.viewCount after minus ",getExistingDetails.viewCount);
            } if (getExistingDetails != undefined && getExistingDetails.downloadCount > 0 && type == "Download") {
                findObjectToRemove.downloadCount = +getExistingDetails.downloadCount - 1
            } if (getExistingDetails != undefined && getExistingDetails.editCount > 0 && type == "Edit") {
                findObjectToRemove.editCount = +getExistingDetails.editCount - 1
            } if (getExistingDetails != undefined && getExistingDetails.deleteCount > 0 && type == "Delete") {
                findObjectToRemove.deleteCount = +getExistingDetails.deleteCount - 1
            } if (getExistingDetails != undefined && getExistingDetails.addCount > 0 && type == "Add") {
                findObjectToRemove.addCount = +getExistingDetails.addCount - 1
            }
            if (index > -1) {
                this.holdcolumnDetail.splice(index, 1)
                this.holdcolumnDetail.push(findObjectToRemove);

            }
            if (getExistingDetails != undefined && getExistingDetails != null && type == "View" && parenObject.parentId == parentId) {
                document.getElementById(parentId + "_View")["checked"] = false;

            } if (getExistingDetails != undefined && getExistingDetails != null && type == "Download" && parenObject.parentId == parentId) {
                document.getElementById(parentId + "_Download")["checked"] = false;

            } if (getExistingDetails != undefined && getExistingDetails != null && type == "Edit" && parenObject.parentId == parentId) {
                document.getElementById(parentId + "_Edit")["checked"] = false;

            } if (getExistingDetails != undefined && getExistingDetails != null && type == "Delete" && parenObject.parentId == parentId) {
                document.getElementById(parentId + "_Delete")["checked"] = false;

            } if (getExistingDetails != undefined && getExistingDetails != null && type == "Add" && parenObject.parentId == parentId) {
                document.getElementById(parentId + "_Add")["checked"] = false;

            }
            // if(index >-1){
            //     this.holdcolumnDetail.splice(index,1)
            //     this.holdcolumnDetail.push(countFountd);
            //  }
        }
        //  console.log("countFountd",countFountd);

        // this.setServerCountOnEdit()


    }

    selectAll(event: any, data: any, parentId: string) {
        let tempSelectAllParentObj
        selectAllOrDeselectAll(event, data, parentId, this.rowDetailService)

        // this.rowDetailService.tempSelectedList$.subscribe(tempselectAllDetails=>{
        let tempselectAllDetails = getTempSelectedList(this.rowDetailService);
        //console.log("tempselectAllDetails",tempselectAllDetails)
        tempSelectAllParentObj = tempselectAllDetails != null && tempselectAllDetails.length > 0 ? tempselectAllDetails.find(ff => ff.parentId == parentId) : null
        if (tempSelectAllParentObj?.parentId == parentId) {
            tempSelectAllParentObj?.customMenu.subMenu.forEach(pageId => {
                pageId.permissions.forEach(perm => {
                    let subMenuPassObj = this.submenuPass.find(customObj => customObj.rootId == parentId && pageId.id == customObj.id)
                    subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == perm.type ? subMenuPassObj.permissions.viewPermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == perm.type ? subMenuPassObj.permissions.downloadPermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == perm.type ? subMenuPassObj.permissions.editPemission.flag = perm.flag : ''
                    subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == perm.type ? subMenuPassObj.permissions.deletePermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == perm.type ? subMenuPassObj.permissions.addPermission.flag = perm.flag : ''
                })
            })
        }

        //})
        if (event.target.checked) {
            this.isAllSelected = true;
            this.rowDetailService.countServerPermission$.subscribe(data => {

                data != null && data != undefined ? this.calculateAllParentPagePermission = data : ''
            })
            //console.log("this.calculateAllParentPagePermission is",this.calculateAllParentPagePermission);
            let findParentCountObject = this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission != undefined && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(find => find.parentId == parentId) : null
            //console.log("findParentCountObject found=>",findParentCountObject)
            let countFountd = { parentId: parentId, viewCount: findParentCountObject.viewCount, editCount: findParentCountObject.editCount, deleteCount: findParentCountObject.deleteCount, addCount: findParentCountObject.addCount, downloadCount: findParentCountObject.downloadCount }
            document.getElementById(parentId + "_View")["checked"] = true;
            document.getElementById(parentId + "_Download")["checked"] = true;
            document.getElementById(parentId + "_Edit")["checked"] = true;
            document.getElementById(parentId + "_Delete")["checked"] = true;
            document.getElementById(parentId + "_Add")["checked"] = true;
            let index = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.findIndex(f => f.parentId == parentId) : '';
            //console.log("chckIfExist is ",index);
            if (index > -1) {
                this.holdcolumnDetail.splice(index, 1)
                this.holdcolumnDetail.push(countFountd);
            } else {
                this.holdcolumnDetail.push(countFountd);

            }
        } if (!event.target.checked) {
            this.isAllSelected = false;
            let index = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.findIndex(f => f.parentId == parentId) : '';
            // console.log("chckIfExist is ",index);
            if (index > -1) {
                this.holdcolumnDetail.splice(index, 1)
            }
            document.getElementById(parentId + "_View")["checked"] = false;
            document.getElementById(parentId + "_Download")["checked"] = false;
            document.getElementById(parentId + "_Edit")["checked"] = false;
            document.getElementById(parentId + "_Delete")["checked"] = false;
            document.getElementById(parentId + "_Add")["checked"] = false;
        }

        //this.cusType=perm.type
        this.cusParentId = parentId



    }

    apply() {
        countOfSelectedList(this.rowDetailService);
        let lengthOfResources = countOfSelectedList(this.rowDetailService)
        this.rowDetailService.resourceDataLength.next(lengthOfResources.length)
        this.rolesmanageResourceModalService.save(this.tempCurrentList)

    }

    close() {
        // console.log("this.tempHoldForCancel is =>",this.tempHoldForCancel);
        this.rowDetailService.setlistOfTempRole(this.tempHoldForCancel);

        this.rolesmanageResourceModalService.close(this.tempCurrentList)
    }

    //counting server permission count in add case
    selectAllBasedOnServerCount(temParentObj, parentId, parenObject, menu) {
        let count = 0;

        if (temParentObj != null && temParentObj != undefined) {
            if (temParentObj?.customMenu.id == parentId) {
                temParentObj?.customMenu.subMenu.forEach(subm => {
                    subm.permissions.forEach(perm => {
                        perm.flag == 'true' ? count++ : count
                    })
                })
            }
            if (parenObject != null && parenObject != undefined && count == parenObject.serverPermissionCount) {
                this.selectDemo[menu.displayName] = true;

            } else if (parenObject != null && parenObject != undefined && count != parenObject.serverPermissionCount) {
                this.selectDemo[menu.displayName] = false;
            }
        }


    }
    //Assign the row resourceDetail obj in edit case
    setEditListInTempLies(editRoleId: string, rowList: any) {
        let tempList: any = []
        let lastSelectedLIst = getTempSelectedList(this.rowDetailService);
        lastSelectedLIst != null && lastSelectedLIst.length > 0 ? tempList = lastSelectedLIst : ''
        if (editRoleId != null && editRoleId != undefined) {
            rowList?.menu?.forEach(element => {
                let temp = { parentId: element.id, customMenu: element }
                tempList.push(temp)

            });
            this.rowDetailService.setlistOfTempRole(tempList);
        }

    }
    //count the server count in edit case
    setServerCountOnEdit(menu: any, roleId: String) {
        if (roleId != null && roleId != undefined) {
            for (let sub of menu) {
                let countAll = 0
                let viewCount = 0;
                let editCount = 0
                let deleteCount = 0
                let addCount = 0;
                let downloadCount = 0;
                let serverPermission = { parentId: '', serverPermissionCount: 0, viewCount: 0, editCount: 0, downloadCount: 0, addCount: 0, deleteCount: 0 }

                serverPermission = { parentId: sub.id, serverPermissionCount: 0, viewCount: 0, editCount: 0, downloadCount: 0, addCount: 0, deleteCount: 0 }
                for (let suofSu of sub.subMenu) {
                    for (let permission of suofSu.permissions) {
                        if (permission.flag != 'na') {
                            //  countPer++
                            countAll++
                        } if (permission.flag != 'na' && permission.type == 'View') {
                            //  countPer++
                            viewCount++
                        } if (permission.flag != 'na' && permission.type == 'Download') {
                            //  countPer++
                            downloadCount++
                        } if (permission.flag != 'na' && permission.type == 'Edit') {
                            //  countPer++
                            editCount++
                        } if (permission.flag != 'na' && permission.type == 'Delete') {
                            //  countPer++
                            deleteCount++
                        } if (permission.flag != 'na' && permission.type == 'Add') {
                            //  countPer++
                            addCount++
                        }
                    }
                    serverPermission.serverPermissionCount = countAll;
                    serverPermission.addCount = addCount;
                    serverPermission.deleteCount = deleteCount;
                    serverPermission.downloadCount = downloadCount;
                    serverPermission.editCount = editCount;
                    serverPermission.viewCount = viewCount;
                    this.calculateAllParentPagePermission?.push(serverPermission)


                }
            }
            let uniqueServerCount = getUniqueData(this.calculateAllParentPagePermission, "parentId")
            this.rowDetailService.setServerCount(uniqueServerCount)
        }
    }
    seletColumn(event, menuu, rootText, parentId) {
        // menuu?.subMenu.permissions(perm=>{
        this.isAllSelected = false;
        let countFountd = { parentId: parentId, viewCount: 0, editCount: 0, deleteCount: 0, addCount: 0, downloadCount: 0 }
        let index = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.findIndex(f => f.parentId == parentId) : '';
        // console.log("chckIfExist is ",index);
        if (index > -1) {
            let temp = this.holdcolumnDetail.find(find => find.parentId == parentId);
            if (temp != null && temp != undefined) {
                countFountd.viewCount = temp.viewCount;
                countFountd.downloadCount = temp.downloadCount;
                countFountd.editCount = temp.editCount;
                countFountd.deleteCount = temp.deleteCount;
                countFountd.addCount = temp.addCount;
                if (rootText == "View") {
                    countFountd.viewCount = 0;
                } else if (rootText == "Download") {
                    countFountd.downloadCount = 0;
                } else if (rootText == "Edit") {
                    countFountd.editCount = 0
                } else if (rootText == "Add") {
                    countFountd.addCount = 0
                } else if (rootText == "Delete") {
                    countFountd.deleteCount = 0
                }

            }
            // if(rootText !='View' && temp !=null && temp !=undefined) {  
            // countFountd.viewCount=temp.viewCount
            // } if(rootText !='Download' && temp !=null && temp !=undefined) {  
            //  countFountd.downloadCount=temp.downloadCount
            //  }if(rootText !='Edit' && temp !=null && temp !=undefined) {  
            //      countFountd.editCount=temp.editCount
            //      }
            //      if(rootText !='Delete' && temp !=null && temp !=undefined) {  
            //          countFountd.deleteCount=temp.deleteCount
            //          }
            //          if(rootText !='Add' && temp !=null && temp !=undefined) {  
            //              countFountd.addCount=temp.addCount
            //              }
            this.holdcolumnDetail.splice(index, 1)
            //this.holdcolumnDetail.push(countFountd);
        }



        if (event.target.checked) {
            this.submenuPass.forEach(subMenuPassObj => {
               // console.log(rootText, "subMenuPassObj is", subMenuPassObj, "parentId", parentId);
                if (subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == rootText && subMenuPassObj.rootId == parentId) {
                    // console.log(rootText,"inside ",subMenuPassObj,"parentId",parentId);
                    subMenuPassObj.permissions.viewPermission.flag = 'true';
                    countFountd.viewCount = +countFountd.viewCount + 1;
                    //  console.log("countFountd",countFountd.viewCount);
                }
                if (subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.downloadPermission.flag = 'true';
                    countFountd.downloadCount = +countFountd.downloadCount + 1;
                }
                if (subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.editPemission.flag = 'true';
                    countFountd.editCount = +countFountd.editCount + 1;
                }
                if (subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.deletePermission.flag = 'true';
                    countFountd.deleteCount = +countFountd.deleteCount + 1;
                }
                if (subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.addPermission.flag = 'true';
                    countFountd.addCount = +countFountd.addCount + 1;
                }
                this.cusParentId = parentId;
                this.cusType = rootText;
            })

        } else if (!event.target.checked) {
            this.submenuPass.forEach(subMenuPassObj => {

                if (subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.viewPermission.flag = 'false';
                    +countFountd.viewCount - 1;
                } if (subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.downloadPermission.flag = 'false';
                    +countFountd.downloadCount - 1;
                } if (subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.editPemission.flag = 'false';
                    +countFountd.editCount - 1;
                }
                if (subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.deletePermission.flag = 'false';
                    +countFountd.deleteCount - 1;
                } if (subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == rootText && subMenuPassObj.rootId == parentId) {
                    subMenuPassObj.permissions.addPermission.flag = 'false';
                    +countFountd.addCount - 1;
                }
            })
            this.cusParentId = ''
            this.cusType = ''
        }
        // })
        //console.log("countFountd is ",countFountd);
        this.holdcolumnDetail.push(countFountd);
        selectAllColumn(event, menuu, parentId, this.rowDetailService, rootText)
        //  getSelectedOrUnselectedList(event,menuu,parentId,pageId,rootText,this.rowDetailService)
        let temParentObj = null;
        this.rowDetailService.tempSelectedList$.subscribe(tempselectedDetails => {
            temParentObj = tempselectedDetails != null && tempselectedDetails.length > 0 ? tempselectedDetails.find(ff => ff.parentId == parentId) : null
        })
        let parenObject = this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(f => f.parentId == parentId) : null

        this.selectAllBasedOnServerCount(temParentObj, parentId, parenObject, menuu)


    }

    setRolwColumn(serverListCount, holdcolumnDetail, editMode) {
        setTimeout(() => {


            // console.log("this.holdcolumnDetail is is is ",this.holdcolumnDetail);
            // if(editMode !=null && editMode !=undefined){
            // if(holdcolumnDetail !=null && holdcolumnDetail !=undefined && holdcolumnDetail.length >0){
            let parenObject = null;

            this.holdcolumnDetail.find(find => {
                if (serverListCount != null && serverListCount.length > 0) {
                    parenObject = serverListCount.find(finds => finds.parentId == find.parentId)
                }
                //console.log("find.viewCount",find.viewCount);
                if (find.viewCount != "" && find.viewCount != 0 && parenObject.viewCount == find.viewCount) {
                    document.getElementById(find.parentId + "_View")["checked"] = true;

                } if (find.downloadCount != 0 && find.downloadCount != "" && parenObject.downloadCount == find.downloadCount) {
                    document.getElementById(find.parentId + "_Download")["checked"] = true;

                } if (find.editCount != 0 && find.editCount != "" && parenObject.editCount == find.editCount) {
                    document.getElementById(find.parentId + "_Edit")["checked"] = true;

                } if (find.deleteCount != 0 && find.deleteCount != "" && parenObject.deleteCount == find.deleteCount) {
                    document.getElementById(find.parentId + "_Delete")["checked"] = true;

                } if (find.addCount != 0 && find.addCount != "" && parenObject.addCount == find.addCount) {
                    document.getElementById(find.parentId + "_Add")["checked"] = true;

                }
            })
            //     }
            // }
        }, 1000)

    }
}