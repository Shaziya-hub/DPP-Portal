import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { ApiPaths, deepClone, isUserHasAccess } from 'src/app/shared/utils';

@Component({
  selector: 'access-control',
  templateUrl: './access-control-filter.component.html',
  styleUrls: ['./access-filter.component.scss']
})
export class AccessControlFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  show: boolean = true;
  dropdownList: any
  flag = false;
  showNoRecords = false;
  serviceNotResponded = false;
  organizationId: ""
  serviceId: ""
  searchFilters = {
    serviceId: null
  };

  accessControlData = {
    serviceTypes: [],
    methods: [],
    channels: []
  }

  selectAllData = {
    serviceTypes: false,
    methods: false,
    channels: false
  }

  saveBtnDisabled = true;
  isUserHasEditAccess: any;

  specificSetting = {
    id: null,
    //label:"Select Business Services"
    text: this.translate.instant(dropdown.selectBizService)
  }
  constructor(private translate: TranslateService, private apiService: RestApiService, private loader: LoaderService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.dropdownList = this.pageConfig.listOfValues.bizServices
    this.isUserHasEditAccess = isUserHasAccess(this.pageConfig?.permissions).edit;
    //this.dropdownList.push({serviceId:null,serviceName:"Select Service"});
  }

  search() {
    if (this.searchFilters.serviceId == null) {
      this.flag = true;
      return;
    } else {
      this.flag = false;
      let filters = deepClone(this.searchFilters)
      if (!filters.serviceId) {
        return;
      }
      this.loader.show()
      this.apiService.getOrUpdateData(ApiPaths.getAccessControls, { SearchFilters: filters }, this.headerConfig).subscribe(data => {
        this.accessControlData = data?.AccessControls;
        data != undefined && data != null && data?.AccessControls != null ? this.showNoRecords = false : this.showNoRecords = true;
        this.checkIfAllSelected(true);
        this.loader.hide()
        this.serviceNotResponded = false;
      },
        (err) => {
          this.serviceNotResponded = true;
          this.notificationService.showError(err.message);
          this.loader.hide();
        }
      )
    }
  }
  checkIfAllSelected(isInitialLoad = false) {
    this.saveBtnDisabled = isInitialLoad;
    this.accessControlData != null && this.accessControlData != undefined ? Object.keys(this.accessControlData).forEach(key => {
      this.selectAllData[key] = this.accessControlData[key].filter(el => el.flag == 'true' || el.flag == 'na').length == this.accessControlData[key].length;
    }) : ''
  }

  reset() {
    if (this.searchFilters.serviceId == null) {
      this.flag = true;
      return;
    } else {
      this.flag = false;
      let filters = deepClone(this.searchFilters)
      if (!filters.serviceId) {
        return;
      }
      this.apiService.getOrUpdateData(ApiPaths.getAccessControls, { SearchFilters: filters }, this.headerConfig).subscribe(data => {
        this.accessControlData = data?.AccessControls;
        data != undefined && data != null && data?.AccessControls != null ? this.showNoRecords = false : this.showNoRecords = true;
        this.checkIfAllSelected(true);
        this.serviceNotResponded = false;
      },
        (err) => {
          this.showNoRecords = false;
          this.serviceNotResponded = true;
        }
      )
    }
  }

  onChange(event, data) {
    data.flag = event.target.checked.toString();
    this.checkIfAllSelected();
  }

  selectAll(event, data) {
    data.length && data.forEach(o => {
      o.flag != 'na' ? o.flag = event.target.checked.toString() : '';
    });
    this.checkIfAllSelected();
  }

  save() {
    let data = {
      'request-type': 'edit'
    }
    let headerConfig = deepClone(this.headerConfig)
    Object.assign(headerConfig, data);
    this.loader.show();
    let body = {
      serviceId: this.searchFilters.serviceId,
      AccessControls: this.accessControlData
    }
    this.apiService.getOrUpdateData(ApiPaths.updateAccessControls, { "UpdateAccessControlRq": body }, headerConfig).subscribe(() => {
      this.notificationService.showSuccess(this.translate.instant(keyWords.accessControlUpdated));
      this.loader.hide();
      this.serviceNotResponded = false;
    },
      (err) => {
        this.serviceNotResponded = true;
        this.showNoRecords = false;
        this.notificationService.showError(err);
        this.loader.hide();
      });
  }

}
