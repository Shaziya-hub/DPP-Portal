import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfigFilter } from "src/app/model/configuration-filter.model";
import { FiltersModel } from "src/app/model/filters.model";
import { PageConfig } from "src/app/model/page-config";
import { dropdown, keyWords } from "src/app/shared/constant";
import { deepClone } from "src/app/shared/utils";
import { DataGridComponent } from "../../data-grid/data-grid.component";
import { FiltersComponent } from "../filters.component";

@Component({
  selector: 'limitlock',
  templateUrl: './limitslocks-filter.component.html',
  styleUrls: ['./limitslocks-filter.component.scss']

})
export class LimitsLocksFilterComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid: DataGridComponent;
  @Input() pageConfig: PageConfig;//parent is configuration.component
  @Input() configurationsPageInfo;
  @Input() dataSource


  limitsLockServiceCall: boolean = false
  show: boolean;
  columns = []

  constructor(private translate: TranslateService, private processFilter: FiltersComponent) {

  }
  ngOnInit(): void {
    this.limitsLockServiceCall = true
    this.processFilter.limitLocksService.emit(this.limitsLockServiceCall)
  }

}
