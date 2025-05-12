import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from "src/app/model/page-config";
import { LoaderService } from "src/app/services/loader.service";
import { RestApiService } from "src/app/services/rest-api.service";
import { ApiPaths } from "src/app/shared/utils";
import { LimitslocksModalService } from "./limitslocks-modal.service";
import { keyWords } from "src/app/shared/constant";

@Component({
  selector: 'limitslocks-modal',
  templateUrl: './limitslocks-modal.component.html',
  styleUrls: ['limitslocks-modal.component.scss']
})
export class LimitslocksModalComponent {
  limitlocks: any = {
    dailyCount: null,
    dailyAmount: null,
    weeklyCount: null,
    weeklyAmount: null,
    monthlyCount: null,
    monthlyAmount: null,
    transId: null
  };
  limitlocksCopy: any;
  sensitiveLabel = {
    dailyTrxsCount: null,
    dailyTrxsAmount: null,
    weeklyTrxsCount: null,
    weeklyTrxsAmount: null,
    monthlyTrxsCount: null,
    monthlyTrxsAmount: null,
    transId: null
  };
  limitslocksData = null;
  limitlocksopy: any;
  pageConfig: PageConfig;

  dropdownSettings = {
    singleSelection: true,
    text: this.translate.instant("All Organizations"),
    primaryKey: "orgId",
    labelKey: "orgName"
  }

  constructor(private apiService: RestApiService, private loader: LoaderService, private translate: TranslateService, private limitlocksModalService: LimitslocksModalService) { }
  getLimitLockByOrgIdAndMethodId() {
    let rowData = this.limitlocksModalService.getRowData();
    // let organizationId=this.limitlocksModalService.getOrgId().listOfValues.organizations[0].orgId;

    this.loader.show();//if there is no data in the grid it will show loading symbol
    let headerConfig = this.limitlocksModalService.headerConfig
    let filters = { "pmtMethodId": rowData.pmtMethodId }
    this.apiService.getLimitOrUpdateData(ApiPaths.getLimitAndLocks, filters, headerConfig).subscribe((data) => {
      this.limitlocks = data.LimitsAndLocks[0];
      this.limitlocksCopy = JSON.parse(JSON.stringify(data.LimitsAndLocks[0]));

      this.loader.hide();//if the data is fetch the loading symbol will be hide
    },
      (err) => {
        this.loader.hide();
      }
    );

  }

  ngOnInit(): void {
    this.getLimitLockByOrgIdAndMethodId()
    setTimeout(() => {
      this.pageConfig = this.limitlocksModalService.pageConfig;
      this.pageConfig?.selectableColumns.forEach((columName: any) => {
        columName?.type == keyWords.sensitiveType ? this.sensitiveLabel[columName.id] = true : this.sensitiveLabel[columName.id] = false;
        // console.log("limitlocksCopy",this.limitlocksCopy)
        Object.keys(this.limitlocksCopy).forEach(key => {
          this.limitlocksCopy[key] = columName?.type == keyWords.sensitiveType && columName.id == key ? '*****' : this.limitlocksCopy[key]

        })
        //
      })
    }, 1000)

  }
  close() {
    this.limitlocksModalService.close();
  }
  save() {

    //delete this.limitlocks.pmtMethodId
    delete this.limitlocks.pmtMethodName
    let body = {

      LimitsAndLocks: this.limitlocks
    }


    body?.LimitsAndLocks?.dailyTrxsCount == null || body?.LimitsAndLocks?.dailyTrxsCount == '' || body?.LimitsAndLocks?.dailyTrxsCount == undefined ? delete body?.LimitsAndLocks?.dailyTrxsCount : '';
    body?.LimitsAndLocks?.dailyTrxsAmount == null || body?.LimitsAndLocks?.dailyTrxsAmount == '' || body?.LimitsAndLocks?.dailyTrxsAmount == undefined ? delete body?.LimitsAndLocks?.dailyTrxsAmount : '';
    body?.LimitsAndLocks?.weeklyTrxsCount == null || body?.LimitsAndLocks?.weeklyTrxsCount == '' || body?.LimitsAndLocks?.weeklyTrxsCount == undefined ? delete body?.LimitsAndLocks?.weeklyTrxsCount : '';
    body?.LimitsAndLocks?.weeklyTrxsAmount == null || body?.LimitsAndLocks?.weeklyTrxsAmount == '' || body?.LimitsAndLocks?.weeklyTrxsAmount == undefined ? delete body?.LimitsAndLocks?.weeklyTrxsAmount : '';
    body?.LimitsAndLocks?.monthlyTrxsCount == null || body?.LimitsAndLocks?.monthlyTrxsCount == '' || body?.LimitsAndLocks?.monthlyTrxsCount == undefined ? delete body?.LimitsAndLocks?.monthlyTrxsCount : '';
    body?.LimitsAndLocks?.monthlyTrxsAmount == null || body?.LimitsAndLocks?.monthlyTrxsAmount == '' || body?.LimitsAndLocks?.monthlyTrxsAmount == undefined ? delete body?.LimitsAndLocks?.monthlyTrxsAmount : '';

    let rowData = this.limitlocksModalService.getRowData();
    let filters = { "pmtMethodId": rowData.pmtMethodId }
    this.limitlocksModalService.save(ApiPaths.updateLimitAndLocks, body)
  }

  showPassword(fieldName) {
    let preview = this.pageConfig.permissions.find((el: any) => el.type == keyWords.preview && el.flag == keyWords.true);
    if (preview) {
      this.limitlocksCopy[fieldName] = this.limitlocksCopy[fieldName] == '*****' ? this.limitlocks[fieldName] : '*****';
    }
  }
}