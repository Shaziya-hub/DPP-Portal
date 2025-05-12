
import { Component, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from "src/app/model/page-config";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { RowDetailsService } from "src/app/services/row-details-service.service";
import { SharedService } from "src/app/services/shared.service";
import { dropdown, keyWords } from "src/app/shared/constant";
import { ApiPaths, deepClone, deleteFilters } from "src/app/shared/utils";
import { ManageResourcesModalService } from "../../manage-resources-modal/manage-resources-modal.service";
import { NgxSpinnerService } from "ngx-spinner";
import { StoreService } from "src/app/services/store.service";
import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent {
    @Input() pageConfig: PageConfig;
    @Input() identityManagementPageInfo;
    @Input() pageConfigDetails;
    @Input() headerConfig;
    searchFilters = {
        userId: null,
        userName: null,
        firstName: null,
        lastName: null,
        emailId: null,
        phoneNumber: "",
        password: null,
        confirmPassword: null,
        productDetails: [],
        status: null,
        roleDetails: [],
        azureLogin: false
    }
    roles = {
        compMenu: false,
        reviewer: false,
        administrator: false,

    }
    temp: any = []
    selectedServices: any = [];
    selectedOrgs: any = [];
    preparedFilters: any;
    accountsTrx = [{
        view: "N",
        download: "N",
        edit: "N",
        delete: "N",
        add: "N"
    }]
    roleName: any = []
    orgflag: boolean = false
    serviceFlag: boolean = false
    userFormFlag: boolean = false
    pageId: any;
    userData: any;
    roleData: any;
    roleIdArray: any = [];
    tempHodingListForApply: any = [];
    pageSettings = keyWords.pageSettings;
    responseCount: any;
    bizServicesList;
    disabledCnt = 0;
    noObj: any;
    bizServiceLength: any = 0;
    pattern = '^[a-zA-Z]+$';
    statusOptions = [{ id: 'ACTIVE', name: 'ACTIVE' }, { id: 'INACTIVE', name: 'INACTIVE' }]
     azureFlag:boolean=false;
    constructor(private store: StoreService, private router: Router, private manageResourcesModalService: ManageResourcesModalService, private loader: LoaderService, private apiService: RestApiService, private translate: TranslateService,
        private rowDetailService: RowDetailsService, private sharedService: SharedService, private notificationService: NotificationService, private activeRoute: ActivatedRoute, private spinner: NgxSpinnerService) {

    }
    ngOnInit() { 
        this.apiService.selectedSubject$.subscribe(data=>{
            //console.log('data',data)
            this.pageConfigDetails=data
            this.pageConfig=data
        })
        this.bizServicesList = this.pageConfigDetails?.listOfValues?.bizServices;
        this.bizServiceLength = this.bizServicesList.length;
        //this.bizServicesList?.forEach(el=>{el.disabled=false})
        this.rowDetailService.rowDetail$.subscribe(row => {
            if (row) {
                this.searchFilters.userId = row?.userId;
                this.searchFilters.userName = row?.userName;
                this.searchFilters.firstName = row?.firstName;
                this.searchFilters.lastName = row?.lastName;
                this.searchFilters.emailId = row?.emailId;
                this.searchFilters.phoneNumber = row?.phoneNumber;
                this.searchFilters.status = row?.status;

            }
        });

        if (this.searchFilters.userId != null && this.searchFilters.userId != "" && this.searchFilters.userId != undefined) {
            let data = {
                'request-type': this.searchFilters?.userId == null ? 'add' : 'edit'
            }
            let body = {
                userId: this.searchFilters?.userId == null ? null : this.searchFilters?.userId
            }
            this.headerConfig[keyWords.pageNumber] = String(1);
            let headerConfig = deepClone(this.headerConfig);
            Object.assign(headerConfig, data)
            this.loader.show();
            this.store.roleId.next(false)
            this.apiService.getTableData(ApiPaths.getUserDetails, { SearchFilters: body }, headerConfig).subscribe((userDetails) => {
                this.loader.hide();
                this.searchFilters.roleDetails = userDetails?.body?.UserDetails[0]?.roleDetails;
                this.searchFilters.productDetails = userDetails?.body?.UserDetails[0]?.productDetails;
                this.searchFilters != null && this.searchFilters?.roleDetails?.length > 0 ? this.selectInEditCase(this.searchFilters?.roleDetails) : ''
                // this.searchFilters.organizationDetails = this.pageConfig.listOfValues?.organizations; //[{orgId: "0001", orgName: "ELM"}];
                this.searchFilters?.productDetails?.map((o: any) => {
                    this.bizServicesList.find((el: any) => {
                        if (el.serviceId == o.serviceId) {
                            this.selectedServices.push(el)
                        }
                    })
                })
                let selected = this.searchFilters?.productDetails

                this.noObj = selected.filter(item => this.bizServicesList.indexOf(item) == -1);
                this.disabledCnt = this.noObj.length;
                this.noObj.map((map) => {
                    map.disabled = true;
                    this.bizServicesList.push(map);
                })
                this.selectedServices.map((m, i) => {
                    this.bizServicesList.filter((f, index) => {
                        if (m.serviceId == f.serviceId && f?.disabled == true) {
                            this.bizServicesList.splice(index, 1);
                            this.disabledCnt = this.disabledCnt - 1
                        }
                    });

                })

                setTimeout(() => {
                    this.searchFilters.productDetails = this.selectedServices;
                    let dropdown = document.getElementById('bizDropdown');
                    let cuppa = dropdown != null && dropdown != undefined ? dropdown.getElementsByClassName('cuppa-dropdown') : null;
                    let dropList = cuppa[0].getElementsByClassName('dropdown-list');
                    let selectedList = cuppa[0].getElementsByClassName('selected-list');
                    let cList = selectedList[0].getElementsByClassName('c-list');
                    let cBbtn = selectedList[0].getElementsByClassName('c-btn');
                    let countPlaceHolder = selectedList[0].querySelector('.countplaceholder');
                    if (countPlaceHolder != null && countPlaceHolder != undefined) {
                        countPlaceHolder.remove();
                        let span = document.createElement("SPAN");
                        span.classList.add('countplaceholder');
                        cBbtn[0].appendChild(span);
                        let countPlaceHolderCopy = selectedList[0].querySelector('.countplaceholder');
                        (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt > 0) ? countPlaceHolderCopy.innerHTML = "+" + (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt).toString() : ''
                    }
                }, 100)
            },
                (err) => {
                    this.loader.hide();
                })
            for (let role of this.searchFilters?.roleDetails) {
                this.roleName.push(role.roleName)
            }
            this.roleName = [... new Set(this.roleName)]

        }

        //to map servicename acording to serviceId to display dropdown label 

        this.activeRoute?.queryParams?.subscribe(data => this.pageId = data.pageId);
        //for add assign roles
        this.pageId
        let data = {
            'request-type': this.searchFilters?.userId == null ? 'add' : 'edit'
        }
        let body = {
            userId:this.searchFilters?.userId == null ? null : this.searchFilters?.userId//this.store.user.getValue().id =="2c756943-1739-4faa-8ba0-8ecd5bf1d50d" || "a4e5c292-db1f-4cbf-b343-5f47f64c9c23"?'f015d994-b450-418e-9bd7-7082a3c82587':this.store.user.getValue().id 
        }
        //Passing request ID as search for getRolesByUser 
        this.headerConfig[keyWords.pageNumber] = String(1);
        let headerConfig = keyWords.config//deepClone(this.headerConfig);
       // Object.assign(headerConfig, data)
        this.spinner.show(); this.store.roleId.next(false)
        this.apiService.getOrUpdateUserData(ApiPaths.getRolesByUser, body, headerConfig).subscribe((data) => {
            this.store.roleId.next(false)
            this.spinner.hide();
            this.roleData = data?.body?.RoleDetails;
            this.responseCount = +data?.headers.get(keyWords.responseCount)
            if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
                this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+data.headers.get(keyWords.responseCount)
                this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
                this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
            }
        },
            (err) => {
                this.spinner.hide();
                if (err == 'Error: Parameter "key" required') {
                    this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
                }
            });
    }

    dropdownSettings = {
        singleSelection: false,
        text: this.translate.instant(dropdown.allOrganizations),
        selectAllText: this.translate.instant(dropdown.selectAllText),
        unSelectAllText: this.translate.instant(dropdown.unSelectAllText),
        primaryKey: dropdown.orgIdPrimaryKey,
        labelKey: dropdown.orgNameLabelKey,
        enableSearchFilter: true,
        badgeShowLimit: 1,
        classes: dropdown.classes,
        searchPlaceholderText: this.translate.instant(dropdown.search),
        autoPosition: false, //force to show dropdown list downward
        // classes:this.orgflag || this.userFormFlag==true && this.searchFilters?.organizationDetails?.length==0  ? 'validation':'field'

    }

      
     //Business Service Dropdown for multiselect
  getBizServicesSetting() {
     let commonSettings = deepClone(this.dropdownSettings);
       let specificSetting = {
          singleSelection: false,
          text: this.translate.instant(dropdown.allBizService),
        primaryKey:dropdown.serviceIdPrimaryKey,
        labelKey: dropdown.serviceNameLabelkey,
        classes: (this.serviceFlag || this.userFormFlag==true) && (this.searchFilters.productDetails?.length==0 || this.searchFilters.productDetails == undefined) ? 'validation' : (this.searchFilters.userId != null && this.bizServicesList[this.bizServicesList?.length-1].disabled != undefined) ? 'opacityD' : '',
          //classes:this.userFormFlag==true && (this.searchFilters.productDetails?.length==0 || this.searchFilters.productDetails == undefined)? 'validation' : (this.searchFilters.userId != null && this.bizServicesList[this.bizServicesList?.length-1].disabled != undefined) ?'opacityD' : '',
        }
        return Object.assign(commonSettings, specificSetting);
    }
    close() {
        this.rowDetailService.setUniqueRoleId([]);
        this.rowDetailService.setRoleAndFlag.next([])
        this.pageId = this.pageId.split(".");
        this.router.navigate([keyWords.identityUserUrl], { queryParams: { pageId: this.pageId[0] } })
    }
    save(userformData: NgForm) {
        this.userFormFlag = true;
       if(this.searchFilters.productDetails.length != 0 || this.searchFilters.productDetails != undefined || this.searchFilters.productDetails != null ){
        let data = {
            'request-type': this.searchFilters.userId == null || (this.searchFilters.userId != null && this.searchFilters.azureLogin == true) ? 'add' : 'edit'
        }
        let headerConfig = deepClone(this.headerConfig)
        Object.assign(headerConfig, data)
        let tempData = []
        this.loader.show();
        this.rowDetailService.gettRoleAndFlagOnChange.subscribe(data => {
            tempData = data
        })
        if (tempData != null && tempData.length > 0) {
            this.searchFilters.roleDetails = []
            tempData?.forEach(el => {
                el.flag == 'true' || el.flag == 'na' ? this.searchFilters.roleDetails.push(el.roleId) : ''
            })

        }

        if (this.searchFilters.userName == null || this.searchFilters.firstName == null || this.searchFilters.firstName == null || this.searchFilters.lastName == null ||
            this.searchFilters.emailId == null || this.searchFilters.status == null || this.searchFilters.roleDetails == null || this.searchFilters.roleDetails.length == 0 ||
            this.searchFilters.productDetails.length == 0 || (this.searchFilters.userId == null && this.searchFilters.productDetails.length == 0)
            || (this.searchFilters.password == null && data["request-type"] == 'add') ||
            (this.searchFilters.confirmPassword == null && data["request-type"] == 'add')) {
            this.loader.hide();
            return
        } else {
            this.preparedFilters = JSON.parse(JSON.stringify(this.searchFilters));

            for (let i = 0; i < this.preparedFilters.productDetails.length; i++) {
                delete this.preparedFilters.productDetails[i].serviceName;
                delete this.preparedFilters.productDetails[i].orgId;
                delete this.preparedFilters.productDetails[i]?.disabled;
            }

            // for(let i=0; i<this.preparedFilters.organizationDetails.length;i++){
            //    this.preparedFilters.organizationDetails=this.preparedFilters.organizationDetails.map(({ orgId: organizationId, ...rest }) => ({ organizationId, ...rest }));
            //    delete this.preparedFilters.organizationDetails[i].orgName;
            // }
            this.temp = []
            for (let i = 0; i < this.preparedFilters.roleDetails.length; i++) {
                this.temp.push({ 'roleId': this.preparedFilters.roleDetails[i] })
            }
            this.preparedFilters.roleDetails = this.temp
            this.preparedFilters.status = this.preparedFilters?.status;
            //saving data
            if (this.searchFilters.userId == null || (this.searchFilters.userId != null && this.searchFilters.azureLogin == true)) {
                //if validation is not proper , it will not call the createUser service
                if (userformData.invalid) {
                    this.loader.hide();
                    return
                }
                if (this.preparedFilters.userId == null || this.preparedFilters.azureLogin == true) {
                    this.preparedFilters.phoneNumber == null || this.preparedFilters.phoneNumber == "" || this.preparedFilters.phoneNumber == undefined ? delete this.preparedFilters.phoneNumber : ''
                }

                this.searchFilters.azureLogin == false ? delete this.preparedFilters.userId : '';
                delete this.preparedFilters.azureLogin
                delete this.preparedFilters.confirmPassword
                let body = {
                    UserDetails: this.preparedFilters
                }
                this.loader.show();
              //  console.log('body', body)
              if(body?.UserDetails?.password){
                this.apiService.setSignPayload(deepClone(body));
                          let cipherToken = keyWords.cipher_Token;
                           var encrypted = CryptoJS.AES.encrypt(body.UserDetails.password, cipherToken).toString();
                           body.UserDetails.password = encrypted

            }

                this.apiService.getOrUpdateData(ApiPaths.createUser, body, headerConfig).subscribe(data => {
                    this.notificationService.showSuccess(this.translate.instant(keyWords.userCreated), "Congratualations!");
                    this.sharedService.refreshGrid.next();
                    this.pageId = this.pageId.split(".");
                    this.router.navigate([keyWords.identityUserUrl], { queryParams: { pageId: this.pageId[0] } })
                },
                    (err) => {
                        return
                    });
                // this.loader.hide();
                this.rowDetailService.setRoleANdFlagOnChange([])
                this.rowDetailService.setRoleAndFlag.next([]);

            }

            //updating data
            else if (this.searchFilters.userId != null) {
                //if validation is not proper , it will not call the updateUser service
                this.bizServicesList?.forEach(el => {
                    el?.disabled == true ? this.preparedFilters.productDetails.push({ serviceId: el.serviceId }) : ''
                })
                if (userformData.invalid) {
                    this.loader.hide();
                    return
                }
                delete this.preparedFilters.userName;
                if (this.preparedFilters.password == null || this.preparedFilters.password == "") {
                    this.preparedFilters.password = null
                }
                else {
                    this.preparedFilters.password
                }
                this.preparedFilters.password == null || this.preparedFilters.password == "" || this.preparedFilters.password == undefined ? delete this.preparedFilters.password : '',
                    this.preparedFilters.phoneNumber == null || this.preparedFilters.phoneNumber == "" || this.preparedFilters.phoneNumber == undefined ? delete this.preparedFilters.phoneNumber : '',
                    this.preparedFilters.confirmPassword == null || this.preparedFilters.confirmPassword == "" || this.preparedFilters.confirmPassword == undefined ? delete this.preparedFilters.confirmPassword : ''
                if (this.roleIdArray.length > 0) {
                    this.preparedFilters.roleDetails = [];

                    this.roleIdArray?.forEach((el) => {
                        this.roleData.find(el => el.flag == 'na');
                        this.preparedFilters.roleDetails.push(el.flag == 'true' || el.flag == 'na' ? { "roleId": el.roleId } : '');
                    })
                }
                let body = {
                    UserDetails: this.preparedFilters
                }
                delete body?.UserDetails?.azureLogin;
                delete this.preparedFilters.confirmPassword
                //   this.loader.show();
                console.log('body', body)
                if(body?.UserDetails?.password){
                    this.apiService.setSignPayload(deepClone(body));
                              let cipherToken = keyWords.cipher_Token;
                               var encrypted = CryptoJS.AES.encrypt(body.UserDetails.password, cipherToken).toString();
                               body.UserDetails.password = encrypted

                }

                this.apiService.getOrUpdateData(ApiPaths.updateUser, body, headerConfig).subscribe(data => {

                    this.notificationService.showSuccess(this.translate.instant(keyWords.userDataUpdated), "Congratualations!");
                    this.sharedService.refreshGrid.next();
                    this.pageId = this.pageId.split(".");
                    this.router.navigate([keyWords.identityUserUrl], { queryParams: { pageId: this.pageId[0] } })
                },
                    (err) => {
                        this.notificationService.showError(err)
                        this.loader.hide();
                        this.pageId = this.pageId.split(".");//wrong resource id getting passed in case of failure
                        this.router.navigate([keyWords.identityUserUrl], { queryParams: { pageId: this.pageId[0] } })
                    });
                // this.loader.hide()
                this.rowDetailService.setRoleANdFlagOnChange([])
                this.rowDetailService.setRoleAndFlag.next([])
            }
        }
       }
        // }
    }

    displayResources(menu) {
        this.manageResourcesModalService.open(menu)
    }

    displayPermission(permissions: any) {
        this.accountsTrx = [{
            view: "N",
            download: "N",
            edit: "N",
            delete: "N",
            add: "N"
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
            }
        }
        return this.accountsTrx
    }

    onChangeValue(item, selectOrUnselect, dropName) {
        
        if (this.searchFilters.userId != null) {
            let dropdown = document.getElementById('bizDropdown');
            let cuppa = dropdown != null && dropdown != undefined ? dropdown.getElementsByClassName('cuppa-dropdown') : null;
            let dropList = cuppa[0].getElementsByClassName('dropdown-list');
            let selectedList = cuppa[0].getElementsByClassName('selected-list');
            let cBbtn = selectedList[0].getElementsByClassName('c-btn');
            let countPlaceHolder = selectedList[0].querySelector('.countplaceholder');
            if (countPlaceHolder != null && countPlaceHolder != undefined) {
                countPlaceHolder.remove();
                let span = document.createElement("SPAN");
                span.classList.add('countplaceholder');
                cBbtn[0].appendChild(span);
                let countPlaceHolderCopy = selectedList[0].querySelector('.countplaceholder');
                (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt > 0) ? countPlaceHolderCopy.innerHTML = "+" + (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt).toString() : ''
            }

            let listarea = dropList[0].getElementsByClassName('list-area')
            let selectAll = listarea[0].getElementsByClassName('select-all');
            let input = selectAll[0].getElementsByTagName('input');
            let label = selectAll[0].getElementsByTagName('label');
            if (selectOrUnselect == 'select' && dropName == 'bizDropdown' && this.searchFilters.productDetails.length == this.bizServiceLength) {
                input[0].checked = input[0].checked == true ? false : true;
                label[0].innerText = 'Remove All';
                // input[0].checked == true?label[0].innerText = 'Remove All' : label[0].innerText = 'Select All';
            }
            else if (selectOrUnselect == 'deSelect' && dropName == 'bizDropdown' && (this.searchFilters.productDetails.length + 1) == this.bizServiceLength) {
                input[0].checked = input[0].checked == true ? false : true;
                label[0].innerText = 'Select All'
                // input[0].checked == false?label[0].innerText = 'Remove All' : label[0].innerText = 'Select All';
            }
        }
    }
    onSelectAll(items: any) {
        if (this.searchFilters?.userId != null && this.searchFilters?.userId != undefined) {
            let dropdown = document.getElementById('bizDropdown');
            let cuppa = dropdown != null && dropdown != undefined ? dropdown.getElementsByClassName('cuppa-dropdown') : null;
            let dropList = cuppa[0].getElementsByClassName('dropdown-list');
            let selectedList = cuppa[0].getElementsByClassName('selected-list');
            let cBbtn = selectedList[0].getElementsByClassName('c-btn');
            let countPlaceHolder = selectedList[0].querySelector('.countplaceholder');
            if (countPlaceHolder != null && countPlaceHolder != undefined) {
                countPlaceHolder.remove();
                let span = document.createElement("SPAN");
                span.classList.add('countplaceholder');
                cBbtn[0].appendChild(span);
                let countPlaceHolderCopy = selectedList[0].querySelector('.countplaceholder');
                (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt > 0) ? countPlaceHolderCopy.innerHTML = "+" + (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt).toString() : ''
            }

            let listarea = dropList[0].getElementsByClassName('list-area')
            let selectAll = listarea[0].getElementsByClassName('select-all');
            let input = selectAll[0].getElementsByTagName('input');
            input[0].checked == false ? this.onDeSelectAll(items) : '';
            let label = selectAll[0].getElementsByTagName('label');
            this.searchFilters.productDetails.length == this.bizServiceLength ? label[0].innerText = 'Remove All' :
                this.searchFilters.productDetails.length < this.bizServiceLength ? label[0].innerText = 'Select All' : ''
            //input[0].checked == false? label[0].innerText = 'Remove All':label[0].innerText = 'Select All'

        }

    }
    onDeSelectAll(items) {
        if (this.searchFilters.userId != null && this.searchFilters.userId != undefined) {
            let dropdown = document.getElementById('bizDropdown');
            let cuppa = dropdown != null && dropdown != undefined ? dropdown.getElementsByClassName('cuppa-dropdown') : null;
            let dropList = cuppa[0].getElementsByClassName('dropdown-list');
            let selectedList = cuppa[0].getElementsByClassName('selected-list');
            let cBbtn = selectedList[0].getElementsByClassName('c-btn');
            let countPlaceHolder = selectedList[0].querySelector('.countplaceholder');
            if (countPlaceHolder != null && countPlaceHolder != undefined) {
                countPlaceHolder.remove();
                let span = document.createElement("SPAN");
                span.classList.add('countplaceholder');
                cBbtn[0].appendChild(span);
                let countPlaceHolderCopy = selectedList[0].querySelector('.countplaceholder');
                (+this.searchFilters.productDetails.length - 1 + +this.disabledCnt > 0) ? countPlaceHolderCopy.innerHTML = "+" + (+this.disabledCnt - 1).toString() : ''
            }

            let listarea = dropList[0].getElementsByClassName('list-area')
            let selectAll = listarea[0].getElementsByClassName('select-all');
            let input = selectAll[0].getElementsByTagName('input');
            input[0].checked = input[0].checked == true ? false : null;
            let label = selectAll[0].getElementsByTagName('label');
            this.searchFilters.productDetails = [];
            this.searchFilters.productDetails.length < this.bizServiceLength ? label[0].innerText = 'Select All' : ''
            this.bizServicesList = [...this.bizServicesList]
        }

    }
    onClose(event) {
        this.bizServicesList = [...this.bizServicesList]
    }

    selectInEditCase(roleDetails: any) {

        let tempList = []
        let lastSelectedValue
        this.rowDetailService.gettRoleAndFlagOnChange.subscribe(roleDetails => {
            roleDetails != null && roleDetails.length > 0 ? lastSelectedValue = roleDetails : ''
        })
        if (roleDetails != null && roleDetails.length > 0) {
            roleDetails?.forEach(element => {
                let temp = { roleId: element.roleId, flag: element.flag ? element.flag : 'true' }
                tempList.push(temp);
                this.roleIdArray.push(temp);
            })
            this.roleIdArray?.forEach((find, index) => {
                this.roleData?.find(filter => {
                    if (find.roleId == filter.roleId && filter.flag == 'na') {
                        this.roleIdArray[index].flag = 'na'
                        // let index = this.roleIdArray.findIndex(index1=>find.roleId == index1.roleId);
                        // this.roleIdArray.splice(index,1)
                    }
                })
            })
            this.rowDetailService.setRoleANdFlagOnChange(this.roleIdArray)
        }
    }

    selectRoleId(event, roleData) {
        roleData.flag = event.target.checked.toString()
        if (event.target.checked == true) {
            let temp = { roleId: roleData.roleId, flag: roleData.flag ? roleData.flag : 'true' }
            let index = this.roleIdArray.findIndex(el => temp.roleId == el.roleId);
            index == -1 ? this.roleIdArray.push(temp) : '';
            this.setRoleIdAndFlagOnchange(roleData.roleId, "true");
        }

        else if (event.target.checked == false) {
            this.roleIdArray = this.roleIdArray.filter(el => el.roleId != roleData.roleId);
            this.setRoleIdAndFlagOnchange(roleData.roleId, "false")
        }
    }

    userFlagAndRole: any = [];

    setRoleIdAndFlagOnchange(roleId: String, flag: string) {
        let tempObj = { roleId: roleId, flag: flag }
        let index = -1
        this.rowDetailService.gettRoleAndFlagOnChange.subscribe(findExistingOne => {
            findExistingOne != null ? this.userFlagAndRole = findExistingOne : this.userFlagAndRole;
        })
        if (this.userFlagAndRole != null && this.userFlagAndRole.length > 0) {
            index = this.userFlagAndRole.findIndex(find => find.roleId == roleId)
        }
        if (index > -1) {
            this.userFlagAndRole.splice(index, 1)
        }

        this.userFlagAndRole.push(tempObj)
        this.rowDetailService.setRoleANdFlagOnChange(this.userFlagAndRole);
        this.tempHodingListForApply.push(tempObj);
    }

    onPageChange(pageNumber: any) {
        let trueFlagData;
        this.rowDetailService.setRoleAndFlag.subscribe(data => {
            trueFlagData = data;
        })
        if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
            this.headerConfig[keyWords.pageNumber] = pageNumber;
            //this.applyFiltersEvent.emit(this.filters);
            let data = {
                'request-type': this.searchFilters?.userId == null ? 'add' : 'edit'
            }
            let body = {
                userId: this.searchFilters?.userId == null ? null : this.searchFilters?.userId
            }
             /*
             *Fixed for Passing request ID as search for getRolesByUser 
             *Earlier we were passing request ID as edit
             */
            let headerConfig = keyWords.config//deepClone(this.headerConfig);
           // Object.assign(headerConfig, data)
            this.store.roleId.next(false)
            this.apiService.getOrUpdateUserData(ApiPaths.getRolesByUser, body, headerConfig).subscribe((data) => {

                this.store.roleId.next(false)
                this.roleData = data?.body?.RoleDetails;
                this.roleData?.forEach(role => {
                    trueFlagData.map(roleMap => {
                        role.roleId == roleMap.roleId && role.flag != 'na' ? role.flag = roleMap.flag : '';
                    })
                })
                this.responseCount = +data?.headers.get(keyWords.responseCount)
                if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
                    //  this.pageSettings.responseCount = +data.headers.get(keyWords.responseCount)

                    this.pageSettings.responseCount = +this.pageConfig?.customParams?.PageSize;//+25;//+data.headers.get('response-count')
                    this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
                    this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
                }
            });
        }
    }
    onOpen(item) {
        let dropdown = document.getElementById('bizDropdown');
        let cuppa = dropdown != null && dropdown != undefined ? dropdown.getElementsByClassName('cuppa-dropdown') : null;
        let dropList = cuppa[0].getElementsByClassName('dropdown-list');
        let listarea = dropList[0].getElementsByClassName('list-area')
        let selectAll = listarea[0].getElementsByClassName('select-all');
        let input = selectAll[0].querySelector('input');
        let label = selectAll[0].getElementsByTagName('label');
        if (this.searchFilters.productDetails.length == this.bizServiceLength) {
            input.checked = true;
            label[0].innerHTML = 'Remove All'
        }

    }
    azureLogin(event) {
        let body = {
            userName: this.searchFilters?.userName
        }
        if (event.target.checked == true) {
            this.pattern = ''
            // this.searchFilters.azureLogin = true;
            this.searchFilters = {
                userId: null,
                userName: body.userName,
                firstName: null,
                lastName: null,
                emailId: null,
                phoneNumber: "",
                password: null,
                confirmPassword: null,
                //organizationDetails:[],
                productDetails: [],
                status: { key: null, value: 'Select Status' },
                roleDetails: [],
                azureLogin: true
            }
            this.roleIdArray = [];
            this.roleData?.filter(data => {
                data.flag != 'na' ? data.flag = 'false' : '';
            })
            let data = {
                'request-type': 'add'
            }

            let headerConfig = deepClone(this.headerConfig);
            Object.assign(headerConfig, data);
            this.loader.show()

            this.store.roleId.next(false)
            this.apiService.getTableData(ApiPaths.getUserDetails, { SearchFilters: body }, headerConfig).subscribe((user) => {
                this.loader.hide();
		/* 
		after getting response from API for this disable the checkbox
        disable this check box, even if we received other than 200 status code
		*/
                this.azureFlag=true
                let data = user?.body?.UserDetails;

                data?.forEach(body => {
                    this.searchFilters.firstName = body.firstName;
                    this.searchFilters.lastName = body?.lastName;
                    this.searchFilters.emailId = body?.emailId;
                    this.searchFilters.userId = body?.userId;
                    this.searchFilters.userName = body?.userName;
                })
                if (!data) {
                    this.searchFilters.azureLogin = false;
                    this.pattern = '^[a-zA-Z]+$'
                    this.notificationService.showError("User doesn't exists")
                }
            }, (error) => {
                this.loader.hide()
            })
        }
        else if (event.target.checked == false) {
            this.pattern = '^[a-zA-Z]+$'
            this.searchFilters = {
                userId: null,
                userName: body.userName,
                firstName: null,
                lastName: null,
                emailId: null,
                phoneNumber: "",
                password: null,
                confirmPassword: null,
                // organizationDetails:[],
                productDetails: [],
                status: { key: null, value: 'Select Status' },
                roleDetails: [],
                azureLogin: false
            }
            this.roleIdArray = [];
            this.roleData?.filter(data => {
                data.flag != 'na' ? data.flag = 'false' : '';
            })
        }

    }
    onChange(e, selectedValue) {
        this.searchFilters.status = { key: selectedValue, value: e.target.innerHTML }
    }
}