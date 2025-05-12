import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { PageConfig } from "src/app/model/page-config";
import { dropdown, keyWords } from "src/app/shared/constant";
import { deepClone } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";

@Component({
    selector: 'masterdata-filter',
    templateUrl: './masterdata-filter.component.html'

})
export class MasterDataComponent {
    @Input() pageConfig: PageConfig;
    @Input() configurationsPageInfo;
    @Input() dataSource
    isCollapsed: boolean = true
    orgFlag: boolean = false;
    serviceFlag: boolean = false;
    masterDataFlag: boolean = false;
    dataTypeFlag: boolean = false;
    reset: boolean = false
    formSubmit: boolean = false
    searchFilters = {
        serviceId: null,
        dataType: null
    }

    getBizServicesSetting = {
        text: this.translate.instant(dropdown.selectBizService)
    }

    getMasterDataSetting = {
        text: this.translate.instant(dropdown.selectMasterData)
    }
    constructor(private translate: TranslateService, public filter: FiltersComponent) { }
    onChangeValue() {

        if (this.searchFilters.serviceId == null || this.searchFilters.serviceId == undefined || this.searchFilters.serviceId == "") {
            this.orgFlag = false;
            this.serviceFlag = true;
            this.dataTypeFlag = false;

        }
        else if (this.searchFilters.dataType == null || this.searchFilters.dataType == undefined || this.searchFilters.dataType == "") {
            this.dataTypeFlag = true
            this.orgFlag = false;
            this.serviceFlag = false;

        } else {
            this.orgFlag = false
            this.serviceFlag = false
            this.dataTypeFlag = false
        }
    }

    search() {
        this.reset = false
        this.formSubmit = true
        if ((this.searchFilters.serviceId == null || this.searchFilters.serviceId == undefined) || (this.searchFilters.dataType == null || this.searchFilters.dataType == undefined)) {
            return
        }

        this.filter.headerConfig[keyWords.pageNumber] = String(1);
        let preparedFilters = deepClone(this.searchFilters);

        Object.keys(preparedFilters).forEach(o => {
            let obj = preparedFilters[o];
            if (Array.isArray(obj)) {
                preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
            }

        })
        this.filter.applyFiltersEvent.emit({ SearchFilters: preparedFilters });


    }
    resetForm() {
        this.reset = true
        this.formSubmit = false
        this.searchFilters = {
            serviceId: null,
            dataType: null
        }
        this.isCollapsed = true;
        this.filter.applyFiltersEvent.emit({ reset: true })
        this.orgFlag = false
        this.serviceFlag = false
        this.dataTypeFlag = false
    }
}