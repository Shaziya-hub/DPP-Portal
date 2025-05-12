import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ReconciliationFilterModel } from "src/app/model/reconciliation-filter.model";
import { keyWords } from "src/app/shared/constant";
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'reconciliation-summary',
  templateUrl: './reconciliation-summary.component.html',
  styleUrls: ['./reconciliation-summary.component.scss']

})

export class ReconciliationSummaryComponent implements OnInit {


  @Input() summaryDataSource;
  @Input() dataLoading
  @Input() reasonPharse

  pageConfig = null;
  reconciliationPageInfo = null;
  dataSource = null;
  showNoRecords: boolean;
  merchatncolumns: any = [];
  mismatchColumn: any = [];
  dppcolumnDetails: any = [];
  objts = null;


  filters: ReconciliationFilterModel = new ReconciliationFilterModel();


  constructor(private route: ActivatedRoute, private spinner: NgxSpinnerService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.spinner.show(keyWords.gaugeCardSpinner)
    this.spinner.show(keyWords.gaugeCardSpinner)
    this.route.data.subscribe(data => {
      this.pageConfig = data.config.pageConfig.selectableColumns;
      this.merchatncolumns = [];
      this.dppcolumnDetails = [];
      this.mismatchColumn = [];

      // this.getdata();

    })

  }

  getdata() {
    this.pageConfig && this.pageConfig.map((o: any) => {
      if (o[keyWords.name] == keyWords.merchant) {
        this.merchatncolumns.push(o[keyWords.name])
        o[keyWords.captionName].selectableColumns.map((p: any) => {
          if (p.flag == keyWords.true) {
            this.merchatncolumns.push({ dataField: p[keyWords.dataFiledId], caption: p[keyWords.name], adaptive: true });
          }
          else if (o[keyWords.name] == keyWords.mismatch) {
            this.mismatchColumn.push(o[keyWords.name])
          }
          else if (o[keyWords.name] == keyWords.dpp) {
            this.dppcolumnDetails.push(o[keyWords.name])
          }
          else (o[keyWords.name] == null)

        })
      }
    })
  }

  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

}

