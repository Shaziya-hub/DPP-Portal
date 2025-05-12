import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular'; //it is like bootstrap which makes web app responsive
import { ColumnSettingsModalService } from 'src/app/components/column-settings/column-settings-modal.service';
import { ConfirmationDialogService } from 'src/app/components/confirmation-dialog/confirmation-dialog.service';
import { PageConfig } from 'src/app/model/page-config';
import { NotificationService } from 'src/app/services/notification.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { RowDetailsService } from 'src/app/services/row-details-service.service';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from 'src/app/services/store.service';
import { ApiPaths, deepClone, isUserHasAccess } from 'src/app/shared/utils';
import { doubleClick } from '../../../shared/utils';
import { Clipboard } from '@angular/cdk/clipboard';
import { LoaderService } from 'src/app/services/loader.service';
import { TranslateService } from '@ngx-translate/core';
import { colors, keyWords } from 'src/app/shared/constant';


@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  @Input() dataSource;
  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  @Input() filters;
  @Input() pageSettings;
  @Input() showNoRecords;
  @Input() arbCheckoutPageInfo;
  @Input() actionKey;
  @Input() responseCount
  @Input() serviceNotResponded;

  @ViewChild(DxDataGridComponent, {
    static: false
  }) dataGrid: DxDataGridComponent;
  header: any
  columns = [];
  rtlEnabled = false
  constructor(private router: Router, private restApiService: RestApiService) {
    this.editButtonTemplate = this.editButtonTemplate.bind(this);
    this.header = keyWords.arbCheckoutHeader;
  }

  ngOnInit(): void {
    //console.log('dataSource', this.dataSource)
    setTimeout(() => {
      this.columns = [];
      this.setColoumns();
    }, 10);
  }

  setColoumns() {
    // this.dataSource?.forEach(source=>{  console.log('source',source)
    //Object.keys(source).forEach(keys=>{ console.log('keys',keys)
    this.header.filter((filter: any) => {
      // keys == filter.id?
      this.columns.push({ dataField: filter.id, alignment: 'left', caption: filter.name, adaptive: true })
      //  })
      //  })
    })
    this.columns.push({ dataField: '', caption: 'Action', adaptive: true, cssClass: 'editIdCss', cellTemplate: this.editButtonTemplate })
    //  if(this.travelDeskPageInfo.urlPageName == 'travelRequest'){
    //    this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editAndSaveButtonTemplate})
    //  }else if(this.travelDeskPageInfo.urlPageName == 'travelExpense'){
    //    this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.deleteButtonTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editButtonTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.travelExpenseTemplate})
    //  }else if(this.travelDeskPageInfo.urlPageName == 'viewTravelReqStatus'){
    //    this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.deleteTravelRequestButtonTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editTravelRequestTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editAndSaveButtonTemplateForViewTravelRequest})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.visaDetailsTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.passportDetailsTemplate})
    //  }else if(this.travelDeskPageInfo.urlPageName == 'visaDetails' ){
    //    this.columns.push({dataField:'', caption:'Action', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.visaDetailsTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.passportDetailsTemplate})
    //    this.columns.push({dataField:'', adaptive:true,cssClass:keywords.editIdCss,cellTemplate:this.editButtonTemplate})
    //  }

    //   let sticky = document.getElementById(keywords.gridContainer).children[0].children[4];
    // sticky.classList.add(keywords.fixedHeaders); 
  }

  editButtonTemplate(container, options) { //console.log('options',options)

    let div = document.createElement('div');
    let a = document.createElement('a');
    a.classList.add('color-blue')
    // let html = '<i class="fa fa-edit"></i>'
    let html = '<button class="btn btn-primary">PAY</button>'
    a.innerHTML = html;
    a.onclick = () => {
      this.methodsPage(options.key)
    }
    div.append(a);
    return div;
  }

  methodsPage(options) {
    this.restApiService.getDataource(options)
    this.router.navigate(['/methods'])
  }

  customizeColumns(cols: any[]) {
    cols.forEach(col => col.headerCellTemplate = keyWords.header

    );

  }
}