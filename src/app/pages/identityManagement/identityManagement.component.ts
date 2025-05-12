import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ColumnSettingsModalService } from "src/app/components/column-settings/column-settings-modal.service";
import { identityMngFilter } from "src/app/model/identityManagement.model";
import { LoaderService } from "src/app/services/loader.service";
import { NotificationService } from "src/app/services/notification.service";
import { RestApiService } from "src/app/services/rest-api.service";
//import { keyWords } from "src/app/shared/constant";
import { ApiPaths, deepClone, deleteFilters } from "src/app/shared/utils";
import { StoreService } from "src/app/services/store.service";
import * as CryptoJS from 'crypto-js';
import { keyWords } from "src/app/shared/constant";

@Component({
  selector: 'identityManagement',
  templateUrl: 'identityManagement.component.html',
  styleUrls: ['identityManagement.component.scss']
})
export class IdentityManagementComponent {
  pageConfig = null;
  dataSource = null;
  responseCount: any
  pageSettings: any
  headerConfig: any

  filters: identityMngFilter = new identityMngFilter()
  identitymanagementPageInfo;



  showNoRecords: boolean;
  serviceNotResponded: boolean;
  constructor(private route: ActivatedRoute, private restApiService: RestApiService, private loaderService: LoaderService, private notificationService: NotificationService, private columnService: ColumnSettingsModalService,
    private translate: TranslateService, private store: StoreService) {
    this.columnService.reportType = null
  }

  ngOnInit(): void {
    if (location.href.indexOf(keyWords.identityRolesDetailsUrl) > -1 || location.href.indexOf(keyWords.identityUserDetailsUrl) > -1) {

      this.getPageAPIInfo()

    } else {
      this.route.data.subscribe(data => {
        this.pageConfig = data.config.pageConfig;
        this.getPageAPIInfo();

      })
    }
    this.headerConfig = keyWords.config
    this.pageSettings = keyWords.pageSettings

  }

  applyFilters(filters: any) {
    if (filters.reset) {
      this.dataSource = null;
      this.showNoRecords = false;
      this.serviceNotResponded = false;
      return;
    }
    /*
    RoleStatus even If null was not getting deleted
    */
    let filter = deleteFilters(filters)
    this.filters = deepClone(filter);
    let url = this.identitymanagementPageInfo.url;
    url == ApiPaths.getUsers ? this.store.roleId.next(false) : '';//Wrong roles Id was getting passed in case of error 
    this.loaderService.show();
    this.restApiService.getTableData(url, filters, this.headerConfig).subscribe(data => {
      if (!data.body) {
        this.dataSource = null;
        this.showNoRecords = true;
      } else {
        this.showNoRecords = false;
        this.dataSource = data.body[this.identitymanagementPageInfo.attributeName];
        /*
          for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
          no need for on click event from user
        */
        this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
          if (o.type == 'sensitive') {
            this.dataSource.map((d: any) => {
              let key = Object.keys(d).find(key => key == o[keyWords.dataFiledId]);
              if (d[key] != null) {

                // Same key used in Java
                let cipherToken = keyWords.cipher_Token;
                const bytes = CryptoJS.AES.decrypt(d[key], CryptoJS.enc.Utf8.parse(cipherToken), {
                  mode: CryptoJS.mode.ECB,
                  padding: CryptoJS.pad.Pkcs7
                });

                return d[key] = bytes.toString(CryptoJS.enc.Utf8);

              }
            })
          }

        })
        this.loaderService.hide();
        this.serviceNotResponded = false;
      }
      this.responseCount = +data.headers.get(keyWords.responseCount)
      if (data.headers.get(keyWords.ttlRecordsCnt) && data.headers.get(keyWords.ttlRecordsCnt) != undefined && data.headers.get(keyWords.ttlRecordsCnt) != "" && data.headers.get(keyWords.ttlRecordsCnt) != 'na') {
        this.pageSettings.responseCount = +data.headers.get(keyWords.responseCount)
        this.pageSettings.totalRecordsCount = +data.headers.get(keyWords.ttlRecordsCnt)
        this.pageSettings.ttlPagesCnt = +data.headers.get(keyWords.ttlPagesCnt)
      }
      this.loaderService.hide();
    }, err => {
      if (err) {
        this.loaderService.hide();
        this.dataSource = null;
        this.showNoRecords = false;
        this.serviceNotResponded = true;
      }
      if (err == 'Error: Parameter "key" required') {
        this.notificationService.showError(this.translate.instant(keyWords.serviceNotAvailable));
      }
    });

  }

  getPageAPIInfo() {
    let obj = {
      url: null,
      downloadName: null,
      attributeName: null,
      pageName: null,
      groupingEnabled: false,
    }
    if (location.href.indexOf(keyWords.identityUserUrl) > -1) {
      obj.url = ApiPaths.getUsers;
      obj.attributeName = keyWords.identityUserAttribute
      obj.pageName = keyWords.identityUserPageName;
      obj.groupingEnabled = true;
    }
    if (location.href.indexOf(keyWords.identityUserDetailsUrl) > -1) {
      obj.url = ApiPaths.createUser;
      obj.attributeName = ''
      obj.pageName = keyWords.userDetailsPageNme
    }
    if (location.href.indexOf(keyWords.identityRolesUrl) > -1) {
      obj.url = ApiPaths.getRoles;
      obj.attributeName = keyWords.identityRolesAttribute
      obj.pageName = keyWords.identityRolesPageName

    }
    if (location.href.indexOf(keyWords.identityRolesDetailsUrl) > -1) {
      obj.url = ApiPaths.createUser;
      obj.pageName = keyWords.rolesDetailsPageName;
    }

    this.identitymanagementPageInfo = obj;
  }


}