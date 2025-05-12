import { Component, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { SharedService } from "src/app/services/shared.service";
import { keyWords } from "src/app/shared/constant";
import { ApiPaths, deepClone, deleteFilters, getSelectedOrUnselectedList, getSelectedOrUnselectedList2, getTempSelectedList, getUniqueData, selectAllOrDeselectAll } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";

@Component({
    selector: 'roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})
export class RolesComponent {


    @Input() identityManagementPageInfo;
    @Input() headerConfig;
    tempMenu = []
    searchFilters = {
        roleId: null,
        roleName: null,
        status: null,
        resourceDetails: {
            menu: []
        },
        roleDesc: null

    }
    filters: any;
    pageId: any
    tabIndex: number = 0;
    selectedMenu: number = 0;
    mainMenu: any;
    roleHeading = keyWords.roleHeading;
    serviceNotAvailable: boolean = false;
    isOnChangeCalled: boolean = false;
    //select all page name
    selectDemo = {
        Settlement: false,
        Identity_Management: false,
        Reconciliation: false,
        Configuration: false,
        Uploads: false,
        Transactions: false,
        Channel_Handler: false,
        Operations: false,
        Dashboard: false,
        Reports: false
    }
    selectDisabled = {
        "RES200": "false",
        "RES300": "false",
        "RES400": "false",
        "RES500": "false",
        "RES600": "false",
        "RES700": "false",
        "RES800": "false",
        "RES900": "false",
        "RES100": "false",
        "RES001": "false"
    }

    //for all checkboxes
    submenuPass: any = [];
    isAllSelected = false;
    calculateAllParentPagePermission: any = [];
    holdcolumnDetail: any = [];
    cusParentId: string;
    rowResourceRoleData = null;
    tempCurrentList: any = [];
    showNoRecords: boolean = false;
    constructor(private router: Router, private loader: LoaderService, private apiService: RestApiService, private translate: TranslateService, public filterComponent: FiltersComponent,
        private rowDetailService: RowDetailsService, private sharedService: SharedService, private notificationService: NotificationService, private activateRoute: ActivatedRoute) {
    }

    state: any
    ngOnInit() { //console.log('submenu',this.submenuPass)
        this.state = history.state;
        // console.log('state.fileters', this.state.filters)
        this.filters = deleteFilters(this.state?.filters)
        this.rowDetailService.rowRoleDetail$.subscribe(data => {
            if (data) {
                this.searchFilters = data;
            }
        })
        this.activateRoute?.queryParams?.subscribe(data => this.pageId = data.pageId)
    }
    saveAndContinue(roleForm: NgForm) {
        this.rowDetailService.roleAndResources.next(this.searchFilters)
        roleForm.valid ? this.tabClicked(1) : '';
    }
    saveORupdate(rolesForm: NgForm) {
        let data = {
            'request-type': this.searchFilters.roleId == null ? 'add' : 'edit'
        }
        let headerConfig = deepClone(this.headerConfig)
        Object.assign(headerConfig, data)
        this.loader.show();
        //  this.rowDetailService.setlistOfTempRole([{parentId:parentId,customMenu:this.mainMenu[this.selectedMenu]}])
        if (this.state?.error == true && !this.isAllSelected && !this.isOnChangeCalled) {
            this.mainMenu[this.selectedMenu].subMenu.forEach(row => {
                getSelectedOrUnselectedList2(this.mainMenu[this.selectedMenu], this.mainMenu[this.selectedMenu].id, row.id, this.rowDetailService);
            })
        }


        // console.log('mainMenu',this.mainMenu,'----','subMenu',this.submenuPass)
        let temp = getTempSelectedList(this.rowDetailService)
        if (this.searchFilters.roleName == null || this.searchFilters.roleDesc == null || this.searchFilters.status == null || rolesForm.invalid || temp == null || temp.length == 0) {
            this.loader.hide();
            this.state.error == true ? this.notificationService.showError('Please select mandatory fields') : this.notificationService.showError('Please select at least one resource');
            return
        }

        if (temp != null && temp.length > 0) { //console.log('temp',temp)
            //this.searchFilters.resourceDetails.menu = []
            let mainMen = []
            this.mainMenu.forEach(f => { //console.log('f',f)
                let flag = 0
                f.subMenu.forEach(submenu => {
                    submenu.permissions.forEach(per => {
                        per.flag != 'na' && per.flag == 'true' ? flag++ : flag
                    })
                });//console.log('flag',flag)
                flag > 0 ? mainMen.push(f) : '';
                //  console.log('mainMen',mainMen)
                this.searchFilters['resourceDetails'] = Object.assign({ 'menu': mainMen })

            })
        }

        this.searchFilters?.resourceDetails?.menu.forEach(data => {
            delete data.rootSelectable
        })
        if (this.searchFilters.roleId == null) {

            delete this.searchFilters.roleId
            let body = {
                RoleDetails: this.searchFilters
            }
            this.loader.show();
            this.apiService.getOrUpdateData(ApiPaths.createRole, body, headerConfig).subscribe(data => {
                this.loader.hide();
                this.notificationService.showSuccess(this.translate.instant(keyWords.rolesCreated));
                this.sharedService.refreshGrid.next();
                this.router.navigate([keyWords.identityRolesUrl], { queryParams: { pageId: this.pageId } })
            },
                (err) => {
                    this.loader.hide();
                    this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable))
                })
            this.rowDetailService.setlistOfTempRole([])
        }
        else if (this.searchFilters.roleId != null) {
            if (this.searchFilters?.resourceDetails?.menu.length > 0) {
                let body = {
                    RoleDetails: this.searchFilters
                }
                this.apiService.getOrUpdateData(ApiPaths.updateRole, body, headerConfig).subscribe(res => {
                    this.loader.hide()
                    this.notificationService.showSuccess(this.translate.instant(keyWords.rolesUpdated));
                    this.sharedService.refreshGrid.next();
                    this.router.navigate([keyWords.identityRolesUrl], { queryParams: { pageId: this.pageId } });
                    this.rowDetailService.setlistOfTempRole([])
                }, (err) => {
                    this.loader.hide();
                    this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable))
                })

            }
            else {
                this.notificationService.showError("Please select mandatory fields'")
                this.loader.hide()
            }

        }

    }
    close() {
        this.rowDetailService.setlistOfTempRole([]); //console.log('fileters',this.filters)
        this.router.navigate([keyWords.identityRolesUrl], { queryParams: { pageId: this.pageId }, state: { gridFlag: true, filters: this.filters } })
    }

    tabClicked(index) {
        index == 1
        this.tabIndex = index;

        if (this.tabIndex == 1) {
            this.getResourceData();
        }
    }

    moduleSelected(index) {
        this.selectedMenu = index;
	/*
	if we update roles, unwanted resources are getting passed in update request
	*/
        this.mainMenu[this.selectedMenu].subMenu.forEach(row => { console.log('row',row)
            row.permissions.forEach(perm => {
                perm.flag != 'na' && perm.flag == 'true' ? perm.flag = 'true' : perm.flag = 'false'
                getSelectedOrUnselectedList2(this.mainMenu[this.selectedMenu], this.mainMenu[this.selectedMenu].id, row.id, this.rowDetailService);
            })
            //getSelectedOrUnselectedList2(this.mainMenu[this.selectedMenu], this.mainMenu[this.selectedMenu].id, row.id, this.rowDetailService);
        })

    }

    selectAll(event: any, data: any, parentId: string) {
        this.isOnChangeCalled = true;
        let tempSelectAllParentObj
        selectAllOrDeselectAll(event, data, parentId, this.rowDetailService);
        let tempselectAllDetails = getTempSelectedList(this.rowDetailService);

        tempSelectAllParentObj = tempselectAllDetails != null && tempselectAllDetails.length > 0 ? tempselectAllDetails.find(ff => ff.parentId == parentId) : null
        if (tempSelectAllParentObj?.parentId == parentId) {
            tempSelectAllParentObj?.customMenu.subMenu.forEach(pageId => {
                pageId.permissions.forEach(perm => {
                    let subMenuPassObj = this.submenuPass.find(customObj => customObj.rootId == parentId && pageId.id == customObj.id)
                    subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == perm.type ? subMenuPassObj.permissions.viewPermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == perm.type ? subMenuPassObj.permissions.downloadPermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == perm.type ? subMenuPassObj.permissions.editPemission.flag = perm.flag : ''
                    subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == perm.type ? subMenuPassObj.permissions.deletePermission.flag = perm.flag : ''
                    subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == perm.type ? subMenuPassObj.permissions.addPermission.flag = perm.flag : '';
                    subMenuPassObj.permissions.previewPermission.flag != 'na' && subMenuPassObj.permissions.previewPermission.preview == perm.type ? subMenuPassObj.permissions.previewPermission.flag = perm.flag : ''
                })
            })
        }

        if (event.target.checked) {
            this.isAllSelected = true;
            this.rowDetailService.countServerPermission$.subscribe(data => {

                data != null && data != undefined ? this.calculateAllParentPagePermission = data : ''
            })
            let findParentCountObject = this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission != undefined && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(find => find.parentId == parentId) : null
            //console.log("findParentCountObject found=>",findParentCountObject)
            let countFountd = { parentId: parentId, viewCount: findParentCountObject.viewCount, editCount: findParentCountObject.editCount, deleteCount: findParentCountObject.deleteCount, addCount: findParentCountObject.addCount, downloadCount: findParentCountObject.downloadCount }

        } if (!event.target.checked) {
            this.isAllSelected = false;
        }

        //this.cusType=perm.type
        this.cusParentId = parentId
    }

    getResourceData() {
        let tempServecount: any;
        //getting grid row data
        this.rowDetailService?.rowRoleDetail$?.subscribe(row => {
            this.rowResourceRoleData = row
        });
        //to assign row resourceData to behaviourObj in edit case
        this.rowResourceRoleData != null && this.rowResourceRoleData?.resourceDetails != null ? this.setEditListInTempLies(this.rowResourceRoleData.roleId, this.rowResourceRoleData?.resourceDetails) : '';
        let lastSelectedLIst = getTempSelectedList(this.rowDetailService);
        this.rowDetailService.countServerPermission$.subscribe(data => {
            tempServecount = data;
            data != null && data != undefined ? this.calculateAllParentPagePermission = data : '';
        })

        this.loader.show();
        this.submenuPass = [];
        let body = {
            roleId: this.searchFilters?.roleId ? this.searchFilters.roleId : null,
        }
        let data = {
            "request-type": this.searchFilters?.roleId ? 'edit' : 'add',
        }
        let headerConfig = deepClone(this.headerConfig)
        Object.assign(headerConfig, data);
        this.apiService.getOrUpdateUserData(ApiPaths.getResourcesByUser, body, headerConfig).subscribe(roles => {
            this.loader.hide();

            // this.searchFilters.resourceDetails.menu = roles?.body?.ResourceDetails?.menu;
            this.mainMenu = roles?.body?.ResourceDetails?.menu;
            this.serviceNotAvailable = this.mainMenu != null && this.mainMenu != undefined && this.mainMenu.length > 0 ? false : true
            setTimeout(() => {
                this.mainMenu?.filter(main => {
                    if (this.calculateAllParentPagePermission.length > 0) {
                        this.calculateAllParentPagePermission.forEach(count => {
                            if (main.id == count.parentId && count.serverPermissionCount == 0) {
                                this.selectDisabled[main.id] = "true";
                            }
                        })
                    }
                })
            }, 1000)

            //set the servercount in edit case
            this.rowResourceRoleData != null && this.rowResourceRoleData != undefined ? this.setServerCountOnEdit(this.mainMenu, this.rowResourceRoleData.roleId) : '';
            for (let menu of this.mainMenu) {
                let countAll = 0
                let serverPermission = { parentId: '', serverPermissionCount: 0 };
                if (lastSelectedLIst != null && lastSelectedLIst != undefined && lastSelectedLIst.length > 0) {
                    this.tempCurrentList = lastSelectedLIst;
                    let temListDetais = lastSelectedLIst.find(find => find.parentId == menu.id)
                    if (temListDetais != undefined && temListDetais != null && temListDetais.parentId == menu.id) {

                        menu.subMenu.forEach(submenu => {
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
                                                serverPerm.serverPermissionCount == countAll ? this.selectDemo[menu.displayName] = true : '';
                                            }
                                            //

                                        }

                                        //element.type == tempPerm.type && element.flag=='true'? countAll++:''
                                    })
                                }
                            });

                        })

                        let parenObject = temListDetais != null && temListDetais != undefined && this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(f => f.parentId == temListDetais.parentId) : null
                        this.selectAllBasedOnServerCount(temListDetais, temListDetais.parentId, parenObject, menu);
                    }
                }
                serverPermission = { parentId: menu.id, serverPermissionCount: 0 }
                for (let subMenu of menu?.subMenu) {
                    let sum = {
                        displayName: subMenu.displayName,
                        id: subMenu.id,
                        rootId: menu.id,
                        permissions: {
                            viewPermission: { view: "N", flag: false },
                            downloadPermission: { download: "N", flag: false },
                            editPemission: { edit: "N", flag: false },
                            deletePermission: { delete: "N", flag: false },
                            addPermission: { add: "N", flag: false },
                            previewPermission: { preview: "N", flag: false },
                            flag: false
                        }
                    }

                    for (let permission of subMenu?.permissions) {
                        if (permission.flag != 'na') {
                            countAll++
                        }
                        let data = permission;
                        if (permission.type == keyWords.view && permission.flag != 'na') {
                            sum.permissions.viewPermission.view = keyWords.view;
                            sum.permissions.viewPermission.flag = data.flag;
                        }

                        if (permission.type == keyWords.download && permission.flag != 'na') {
                            sum.permissions.downloadPermission.download = keyWords.download;
                            sum.permissions.downloadPermission.flag = data.flag;
                        }

                        if (permission.type == keyWords.edit && permission.flag != 'na') {
                            sum.permissions.editPemission.edit = keyWords.edit;
                            sum.permissions.editPemission.flag = data.flag;
                        }

                        if (permission.type == keyWords.delete && permission.flag != 'na') {
                            sum.permissions.deletePermission.delete = keyWords.delete;
                            sum.permissions.deletePermission.flag = data.flag;
                        }

                        if (permission.type == keyWords.add && permission.flag != 'na') {
                            sum.permissions.addPermission.add = keyWords.add;
                            sum.permissions.addPermission.flag = data.flag;
                        }

                        if (permission.type == keyWords.preview && permission.flag != 'na') {
                            sum.permissions.previewPermission.preview = keyWords.preview;
                            sum.permissions.previewPermission.flag = data.flag;
                        }
                    }
                    this.submenuPass.push(sum)
                }
                serverPermission.serverPermissionCount = countAll;
                if (tempServecount == null || tempServecount == undefined) {

                    this.calculateAllParentPagePermission?.push(serverPermission)

                }
            }
            let uniqueServerCount = getUniqueData(this.calculateAllParentPagePermission, 'parentId')
            this.rowDetailService.setServerCount(uniqueServerCount)
            //this.setRolwColumn(this.calculateAllParentPagePermission,this.holdcolumnDetail,this.resourceRoleData)
        },
            (err) => {
                if (err == 'Error: Parameter "key" required') {
                    this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
                }
                this.loader.hide();
            })

    }
    onChange(event: any, menu: any, pageId: string, parentId: string, type: string) {
        this.isOnChangeCalled = true;
        let v = 0
        // let countFountd={parentId:parentId,viewCount:0,editCount:0,deleteCount:0,addCount:0,downloadCount:0}
        let temParentObj = null;
        this.isAllSelected = false;
        getSelectedOrUnselectedList(event, menu, parentId, pageId, type, this.rowDetailService);
        let tempselectedDetails = getTempSelectedList(this.rowDetailService)
        temParentObj = tempselectedDetails != null && tempselectedDetails.length > 0 ? tempselectedDetails.find(ff => ff.parentId == parentId) : null;
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
                    subMenuPassObj.permissions.previewPermission.flag != 'na' && subMenuPassObj.permissions.previewPermission.preview == perm.type ? subMenuPassObj.permissions.previewPermission.flag = perm.flag : ''
                })
            })
        }

        let parenObject = this.calculateAllParentPagePermission != null && this.calculateAllParentPagePermission.length > 0 ? this.calculateAllParentPagePermission.find(f => f.parentId == parentId) : null
        this.selectAllBasedOnServerCount(temParentObj, parentId, parenObject, menu)
        this.cusParentId = ''
        // this.cusType=''
        let getExistingDetails = this.holdcolumnDetail.length > 0 ? this.holdcolumnDetail.find(f => f.parentId == parentId) : '';
        let subMenuPassObj = this.submenuPass.find(customObj => customObj.rootId == parentId && pageId == customObj.id);
        let subPassIndex = this.submenuPass.findIndex(customObj => customObj.rootId == parentId && pageId == customObj.id)
        if (event.target.checked) {
            subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == type ? subMenuPassObj.permissions.viewPermission.flag = 'true' : ''
            subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == type ? subMenuPassObj.permissions.downloadPermission.flag = 'true' : ''
            subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == type ? subMenuPassObj.permissions.editPemission.flag = 'true' : ''
            subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == type ? subMenuPassObj.permissions.deletePermission.flag = 'true' : ''
            subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == type ? subMenuPassObj.permissions.addPermission.flag = 'true' : ''
            subMenuPassObj.permissions.previewPermission.flag != 'na' && subMenuPassObj.permissions.previewPermission.preview == type ? subMenuPassObj.permissions.previewPermission.flag = 'true' : ''
            this.submenuPass.splice(subPassIndex, 1, subMenuPassObj);
        }
        if (!event.target.checked) {
            subMenuPassObj.permissions.viewPermission.flag != 'na' && subMenuPassObj.permissions.viewPermission.view == type ? subMenuPassObj.permissions.viewPermission.flag = 'false' : ''
            subMenuPassObj.permissions.downloadPermission.flag != 'na' && subMenuPassObj.permissions.downloadPermission.download == type ? subMenuPassObj.permissions.downloadPermission.flag = 'false' : ''
            subMenuPassObj.permissions.editPemission.flag != 'na' && subMenuPassObj.permissions.editPemission.edit == type ? subMenuPassObj.permissions.editPemission.flag = 'false' : ''
            subMenuPassObj.permissions.deletePermission.flag != 'na' && subMenuPassObj.permissions.deletePermission.delete == type ? subMenuPassObj.permissions.deletePermission.flag = 'false' : ''
            subMenuPassObj.permissions.addPermission.flag != 'na' && subMenuPassObj.permissions.addPermission.add == type ? subMenuPassObj.permissions.addPermission.flag = 'false' : ''
            subMenuPassObj.permissions.previewPermission.flag != 'na' && subMenuPassObj.permissions.previewPermission.preview == type ? subMenuPassObj.permissions.previewPermission.flag = 'false' : ''
            this.submenuPass.splice(subPassIndex, 1, subMenuPassObj);
        }

    }
    selectAllBasedOnServerCount(temParentObj, parentId, parenObject, menu) {
        let count = 0;
        if (temParentObj != null && temParentObj != undefined) {
            if (temParentObj?.customMenu.id == parentId) {
                temParentObj?.customMenu.subMenu.forEach(subm => {
                    subm.permissions.forEach(perm => {
                        perm.flag == 'true' ? count++ : count;
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
                let serverPermission = { parentId: '', serverPermissionCount: 0, }

                serverPermission = { parentId: sub.id, serverPermissionCount: 0 }
                for (let suofSu of sub.subMenu) {
                    for (let permission of suofSu.permissions) {
                        if (permission.flag != 'na') {
                            //  countPer++
                            countAll++
                        }
                    }
                    serverPermission.serverPermissionCount = countAll;
                    this.calculateAllParentPagePermission?.push(serverPermission)


                }
            }
            let uniqueServerCount = getUniqueData(this.calculateAllParentPagePermission, "parentId")
            this.rowDetailService.setServerCount(uniqueServerCount)
        }
    }
}
