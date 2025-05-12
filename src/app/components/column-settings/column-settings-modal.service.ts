import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from 'src/app/services/loader.service';
import { StoreService } from 'src/app/services/store.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ColumnSettingsModalComponent } from './column-settings-modal.component';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { deepClone } from 'src/app/shared/utils';



@Injectable()
export class ColumnSettingsModalService {

  selectableColumns: any[] = [];
  updatedSelectableCOlumns: any[] = [];
  selectableColumnsDetails: any[] = [];
  selectedColumns = [];
  copySelectableColumns: any

  reportType: any
  subject$ = new BehaviorSubject<any>(null);
  selectedSubject$ = this.subject$.asObservable();
  userId: string = null;
  resourceId: string = null;
  headerConfig: any;
  constructor(private route: ActivatedRoute, private modalService: NgbModal, private service: RestApiService, private loaderService: LoaderService, private store: StoreService) {

    this.userId = this.store.user.getValue().id == "00df1673-c0f5-48b4-b0c8-64ff452f3f53" ? 'aee080f6-77f4-4c95-bbac-1748848e9a04' : this.store.user.getValue().id;//'U10001'
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
  }

  open() {

    this.modalService.open(ColumnSettingsModalComponent, { size: 'md', backdrop: 'static' });



  }

  close() {
    this.modalService.dismissAll();
  }

  setdocument(value: any) {
    this.reportType = value
    this.subject$.next(value);
  }

  file: any
  getSelectableColumns(headerConfig) {
    this.headerConfig = headerConfig;
    let select
    this.selectedSubject$.subscribe((val: any) => {
      this.file = val;
    });
    this.loaderService.show();
    if (this.file != null && this.file != undefined && this.file != '' && this.resourceId == 'RES030') {
      return this.service.getSelectableColumns(this.route?.queryParams, headerConfig, this.file).subscribe(data => {
        this.selectableColumns = data.selectableColumns;
        select = data.selectableColumns
        this.selectableColumnsDetails = data.selectableColumnsDetails;
        this.open();
        this.loaderService.hide();
      });
    }
    else {
      const params: any = {
        userId: this.userId,
        resourceId: this.resourceId
      };
      return this.service.getSelectableColumns(params, headerConfig).subscribe(data => {
        this.selectableColumns = data.selectableColumns;
        this.selectableColumnsDetails = data.selectableColumnsDetails;
        let copy = deepClone(this.selectableColumns);
        this.copySelectableColumns = copy
        this.open();
        this.loaderService.hide();
      });

    }
  }

  select: any
  dataSelectableColumns: any
  updateSelectableColumns(selectableColumns, selectableColumnsDetails) {
    this.loaderService.show();
    this.copySelectableColumns = selectableColumns
    let data = {
      'request-type': 'edit'
    }
    let headerConfig = deepClone(this.headerConfig);
    Object.assign(headerConfig, data)

    return this.service.updateSelectableColumns(selectableColumns, selectableColumnsDetails, headerConfig, this.file).subscribe(data => {

      this.store.selectableColumns.next(selectableColumns);
      this.store.selectableColumnsDetails.next(selectableColumnsDetails);
      this.close();
      this.loaderService.hide();
    });
  }

}