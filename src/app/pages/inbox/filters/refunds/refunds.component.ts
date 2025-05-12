import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageConfig } from 'src/app/model/page-config';
import { dropdown, keyWords } from 'src/app/shared/constant';
import { FiltersComponent } from '../filters.component';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RejectionModalService } from '../../rejection-modal/rejection-modal-service.service';
import { deepClone } from 'src/app/shared/utils';
import { InboxRefundFiletrModel } from 'src/app/model/inboxRefundsFilter.model';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-refunds',
  templateUrl: './refunds.component.html',
  styleUrls: ['./refunds.component.scss']
})
export class RefundsComponent {


  @Input() pageConfig: PageConfig;//interface
  @Input() inboxPageInfo; //object of getAPIInfo is passed 
  @Input() dataSource;
  @Input() headerConfig
  @Input() filters
  @Input() pageSettings;
  @Input() responseCount;
  @Input() showNoRecords;
  @Input() serviceNotResponded
  resourceId: string = null;
  isCollapsed: boolean = true;
  bsdateRange: any = [];
  landingDateRange: any;
  inboxRefunds: any
  selectRefund: boolean = false
  transId: any
  bizService: any;
  refundMethod: any;
  bankIBAN: any
  data: any;
  receivedDate: any;
  serviceName: any;
  paymentRef: any;
  transAmt: any;
  refundAmt: any;
  refundReason: any;
  refundInitiator: any;
  createdTimestamp: any;
  refundApprover: any;
  lastUpdateTimestamp: any;
  refundInitiatorEmail: any;
  approvalStatus: any
  refundStatus: any;
  refundApproverEmail: any;
  HighlightRow: Number;
  reason: any
  zeroIndex: boolean
  value: any = 'ALL';
  name: any
  permissionFlag: boolean = false

  searchFilters: InboxRefundFiletrModel = new InboxRefundFiletrModel();

  constructor(private translate: TranslateService, public filterComponent: FiltersComponent, public datepipe: DatePipe, private route: ActivatedRoute, private rejectionModalService: RejectionModalService, private sharedService: SharedService) {
    this.route.queryParams.subscribe(params => {
      this.resourceId = params.pageId
    })
    this.sharedService.refreshGrid.subscribe(o => {
      this.filterComponent.applyFiltersEvent.emit(this.filters);
    })

  }

  ngOnInit(): void {
    this.name = this.name = this.translate.instant(dropdown.all)
    this.search();
    this.inboxRefunds = 'inboxRefunds'
    let permission: any[]
    if (this.pageConfig.permissions.length <= 1) {
      permission = this.pageConfig.permissions
      if (permission[0].type == keyWords.view) {
        this.permissionFlag = true;
      }
    } else if (this.pageConfig.permissions.length > 1) {
      this.permissionFlag = false;
    }

  }

  ngOnChanges(): void {

    if (this.dataSource != null && this.dataSource[0]) {
      this.HighlightRow = 0
      //console.log('dataSource',this.dataSource[0])
      let e = this.dataSource[0]
      this.data = e
      this.receivedDate = e.receivedDate;
      this.serviceName = e.serviceName;
      this.paymentRef = e.paymentRef;
      this.transAmt = e.transAmt;
      this.refundAmt = e.refundAmt;
      this.refundReason = e.refundReason;
      this.refundInitiator = e.refundInitiator;
      this.createdTimestamp = e.createdTimestamp;
      //  this.createdTimestamp=  this.datepipe.transform(this.createdTimestamp,'dd/mm/yyyy')
      this.refundApprover = e.refundApprover;
      this.lastUpdateTimestamp = e.lastUpdateTimestamp;
      this.refundInitiatorEmail = e.refundInitiatorEmail;
      this.approvalStatus = e.approvalStatus;
      this.reason = e.reason
      this.refundStatus = e.refundStatus;
      this.refundApproverEmail = e.refundApproverEmail

    }

    // this.onPageChange(this.headerConfig[keyWords.pageNumber])
  }

  search() {
    if (this.searchFilters.paymentRef == null || this.searchFilters.paymentRef == undefined || this.searchFilters.paymentRef == '') {
      this.name = this.translate.instant(dropdown.all)
      this.value = dropdown.all
    }

    this.filterComponent.headerConfig[keyWords.pageNumber] = String(1);
    let preparedFilters: InboxRefundFiletrModel = deepClone(this.searchFilters);
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];
      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == keyWords.organizationId ? d[keyWords.orgId] : d[o] || d[keyWords.name]);
      }
      if (o.indexOf(keyWords.date) > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 19);
      }
    })
    this.getUpdatedValuesForAllSelections(preparedFilters);
    let keys = Object.keys(this.searchFilters);
    this.isCollapsed = keys.length - 1 == keys.indexOf(keyWords.toDate);
    this.filterComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
  }

  getUpdatedValuesForAllSelections(filters: InboxRefundFiletrModel) {

    if (filters?.approvalStatus?.length == 0) {
      filters.approvalStatus = this.filterComponent.pageConfig.listOfValues?.reviewRefundsApprovalStatus?.map(o => o.value)
    }
    if (filters?.serviceId?.length == 0) {
      filters.serviceId = this.filterComponent.pageConfig.listOfValues?.bizServices.map(o => o.serviceId)
    }
  }

  rowData(e, index) {
    //console.log('event',e)
    this.zeroIndex = false
    this.data = e
    this.HighlightRow = index;
    // this.receivedDate = e.receivedDate;
    // this.serviceName = e.serviceName;
    // this.paymentRef = e.paymentRef;
    // this.transAmt = e.transAmt;
    // this.refundAmt = e.refundAmt;
    // this.refundReason = e.refundReason;
    // this.refundInitiator = e.refundInitiator;
    // this.createdTimestamp = e.createdTimestamp;
    // //this.createdTimestamp=  this.datepipe.transform(this.createdTimestamp,'dd/mm/yyyy')
    // this.refundApprover = e.refundApprover;
    // this.lastUpdateTimestamp = e.lastUpdateTimestamp;
    // this.refundInitiatorEmail = e.refundInitiatorEmail;
    this.approvalStatus = e.approvalStatus;
    this.reason = e.reason;
    // this.refundStatus = e.refundStatus;
    // this.refundApproverEmail = e.refundApproverEmail

  }
  flag: any = ''
  onApprovalActionClick() { //console.log('pageName data',this.data)
    this.flag = keyWords.approve
    let e = this.data
    let manualdata = {
      "paymentRef": e.paymentRef,
      "createdTimestamp": e.createdTimestamp,
      //"refundRejectionReason": 'approved', //polulate only incase of rejection
      "approve": "true",
      "reject": "false"
    }

    let body = {
      UpdateRefundRq: manualdata
    }
    this.rejectionModalService.flagFunction(this.pageConfig, body, this.headerConfig, this.flag);


    // console.log('body',body)
    // this.rejectionModalService.save(ApiPaths.updateManualRefund,body);
  }

  onRejectActionClick() { //console.log('pageName data',data)
    this.flag = keyWords.reject
    this.rejectionModalService.open(this.pageConfig, this.data, this.headerConfig, this.flag);
  }

  onPageChange(pageNumber: any) {

    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;

      this.filterComponent.applyFiltersEvent.emit(this.filters);
      // this.search();
    }
  }

  image: boolean = false;
  onOpenChange(data: boolean): void {
    //console.log('data',data)
    //this.text = data ? 'true' : 'false';
    this.image = data
  }

  valueSelected(value, name) {

    this.value = value
    this.name = name
    this.headerConfig['page-number'] = '1'
    if (this.value == dropdown.all) {
      this.name = this.translate.instant(dropdown.all)
      this.filters.SearchFilters.approvalStatus = this.filterComponent.pageConfig.listOfValues.reviewRefundsApprovalStatus.map(o => o.value)
      //console.log('approvalStatus',this.filters.SearchFilters.approvalStatus)
      this.filterComponent.applyFiltersEvent.emit(this.filters);

    } else {
      this.filters.SearchFilters.approvalStatus = [value]
      //console.log('approvalStatus',this.filters.SearchFilters.approvalStatus)
      this.filterComponent.applyFiltersEvent.emit(this.filters);
    }
  }


}
