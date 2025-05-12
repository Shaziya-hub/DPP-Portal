import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { dropdown } from 'src/app/shared/constant';
import { ApiPaths, deepClone } from 'src/app/shared/utils';

@Component({
  selector: 'advanced-control-filter',
  templateUrl: 'advanced-control-filter.component.html'
})
export class AdvancedControlFilterComponent implements OnInit {

  @Input() pageConfig: PageConfig;
  @Input() headerConfig: any;
  show: boolean = true;
  organizationId: ""
  serviceId: ""
  searchFilters = {
    serviceId: null
  };
  flag: boolean = false


  advancedControlData = [];
  showMap: boolean = false;

  constructor(private translate: TranslateService, private apiService: RestApiService, private loader: LoaderService, private notify: NotificationService) {
  }

  ngOnInit(): void { }

  getBizServicesSetting = {
    text: this.translate.instant(dropdown.selectBizService)
  }

  search() {
    let filters = deepClone(this.searchFilters);
    if (this.searchFilters.serviceId == null) {
      this.flag = true;
      return;
    } else {
      this.flag = false;

      let filters = deepClone(this.searchFilters)
      this.show = this.searchFilters.serviceId;
      if (!filters.serviceId) {
        return;
      }
      this.showMap = false;
      this.loader.show();
      let data = {
        'request-type': 'search'
      }
      let headerConfig = deepClone(this.headerConfig);
      Object.assign(headerConfig, data)
      this.apiService.getOrUpdateData(ApiPaths.getAdvancedAccessControls, { SearchFilters: filters }, headerConfig).subscribe(data => {
        this.advancedControlData = data?.AdvAccessControls ? data.AdvAccessControls : [];
        this.loader.hide();
        this.showMap = true;
      },
        (err) => {
          this.notify.showError(err);
          this.loader.hide();
        });
    }
  }

}
