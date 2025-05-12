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
import { ApiPaths, customizeText, customizeText2, deepClone, isUserHasAccess } from 'src/app/shared/utils';
import { Clipboard } from '@angular/cdk/clipboard';
import { LoaderService } from 'src/app/services/loader.service';
import { TranslateService } from '@ngx-translate/core';
import { colors, keyWords } from 'src/app/shared/constant';

@Component({
  selector: 'idm-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  @Input() dataSource;
  @Input() pageConfig: PageConfig;
  @Input() headerConfig;
  @Input() identitymanagementPageInfo;
  @Input() filters;
  @Input() pageSettings;
  @Input() columns;
  //@Input() primaryKey: string;
  @Input() showNoRecords;
  @Input() responseCount
  @Input() serviceNotResponded;

  @Output() applyFiltersEvent = new EventEmitter();

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;// it is a part f devExtreme dataGrid used for expanding ,collapsing etc data grid rows
  actionClick: Function;
  deleteRow: Function
  page: 1;
  userdata: [];
  orgName: any = [];
  serviceName: any = []
  showInfo = true;
  showNavButtons = true;
  rtlEnabled = false //will change according to language selection
  isVisible: boolean;
  primaryKey: any;
  lang = localStorage.getItem('selectedLang');
  languages: string[] = ['Arabic (Right-to-Left direction)', 'English (Left-to-Right direction)'];
  pixelWidth = require('string-pixel-width');
  pageNo:any

  constructor(private store: StoreService, private columnSettingsModalService: ColumnSettingsModalService, private sharedService: SharedService, private router: Router, private loader: LoaderService,
    private rowDetailService: RowDetailsService, private confirmationDialogService: ConfirmationDialogService, private apiService: RestApiService, private notification: NotificationService, private clipboard: Clipboard,
    private activeRoute: ActivatedRoute, private translate: TranslateService) {
    this.cellTemplate = this.cellTemplate.bind(this);
    this.deletecellTemplate = this.deletecellTemplate.bind(this);
    this.actionCellTemplate = this.actionCellTemplate.bind(this);
    this.actionClick = (pageName, data) => this.onActionClick(pageName, data);
    this.deleteRow = (pageName, data) => this.onDeleteClick(pageName, data);
    this.sharedService.refreshGrid.subscribe(o => {
      this.refresh();
    })
  }
  pageId: any

  ngOnInit(): void {
    setTimeout(() => {
      let langArray = this.lang == keyWords.arabic ? keyWords.arabicDir : keyWords.englishDir
      this.rtlEnabled = langArray === this.languages[0];
      this.columns = [];
      this.setGridColumns();
    }, 10);
    this.userdata = this.dataSource
    this.store.selectableColumns.subscribe(data => {   //for custom column setting grid
      this.columns = [];
      this.pageConfig.selectableColumns = <any>data;
      this.setGridColumns();
    })
    this.activeRoute.queryParams.subscribe(data => this.pageId = data.pageId);
  }

  //getiing dynamic column header from service
  setGridColumns() {
    this.pageConfig.selectableColumns && this.pageConfig.selectableColumns.map((o: any) => {
      if (o.flag == 'true') {
        let hasSorting = o?.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
        let preview = null
        preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');
        if (o[keyWords.dataFiledId] == keyWords.organizationDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: hasSorting ? true : false, adaptive: true, calculateCellValue: this.calculateOrganizationDetailsValue });
        }
        else if (o[keyWords.dataFiledId] == keyWords.productDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], adaptive: true, allowSorting: hasSorting ? true : false, calculateCellValue: this.calculateProductDetailsValue });
        }
        else if (o[keyWords.dataFiledId] == keyWords.roleDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], adaptive: true, allowSorting: hasSorting ? true : false, calculateCellValue: this.calculateRoleDetailsValue });
        }
        else if (o[keyWords.dataFiledId] == keyWords.roleStatus) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: hasSorting ? true : false, adaptive: true, cellTemplate: this.createCirclecellTemplate });
        } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
        } else if (o.type == 'numeric') {
          this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.amountTextCss, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false });
        }
        else { //console.log('sorting',o.sorting)
          this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: hasSorting ? true : false, caption: o[keyWords.captionName], adaptive: true, sortingMethod: () => { return false; } })
        }
      }
      else {
        this.columns.push({ dataField: o[keyWords.dataFiledId], allowSorting: false, caption: o[keyWords.captionName], adaptive: true })
      } keyWords.dataFiledId
    });
    //  if(this.identitymanagementPageInfo.pageName=="users"){
    this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.cellTemplate });
    this.columns.push({ dataField: '', caption: '', adaptive: true, cellTemplate: this.deletecellTemplate });
    //  }
    if (this.identitymanagementPageInfo.groupingEnabled) {
      this.columns.length && this.columns.unshift({ dataField: keyWords.action, caption: "", cssClass: keyWords.plusIcon, allowSorting: false, cellTemplate: this.actionCellTemplate })
    }
    let sticky = document.getElementById(keyWords.identityGridContainer)?.children[0]?.children[4];
    sticky?.classList.add(keyWords.fixedHeaders);
  }

  //On hover row is being highlighted
  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }

  getSortedColumn() {
    const instance = this.dataGrid.instance;
    const allColumns = Array.from(Array(instance.columnCount()).keys()).map(index => instance.columnOption(index));
    return allColumns.find(col => col.sortIndex != null);
  }

  onOptionChanged(e) {
    if (e.fullName.endsWith(keyWords.sortOrder)) {
      let el = this.getSortedColumn();
      this.headerConfig[keyWords.sortingColumn] = el.name;
      this.headerConfig[keyWords.sortingOrder] = el.sortOrder.toUpperCase()
      this.headerConfig[keyWords.pageNumber] = this.pageNo ? this.pageNo : String(1);
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  onPageChange(pageNumber: any) {
    if (this.headerConfig[keyWords.pageNumber] != pageNumber) {
      this.headerConfig[keyWords.pageNumber] = pageNumber;
      this.pageNo = pageNumber
      this.applyFiltersEvent.emit(this.filters);
    }
  }

  //this method is for selecting customize column 
  customizeColumns(cols: any[]) {
    cols.forEach(col => col.headerCellTemplate = keyWords.header);

  }

  //this method is for etting data of selected column
  selectColumns() {
    this.columnSettingsModalService.getSelectableColumns(this.headerConfig);
  }

  refresh() {
    this.applyFiltersEvent.emit(this.filters);
  }


  //edit modal
  onActionClick(pageName, data) {
    switch (pageName) {
      case keyWords.identityUserPageName:
        this.rowDetailService.setRowDetail(data);
        this.pageId = this.pageId //+ '.ROLES'
        this.router.navigate([keyWords.idmUserNavigate], { queryParams: { pageId: this.pageId } })
        this.apiService.setdocument(this.pageConfig)
        break;

      case keyWords.identityRolesPageName:
        this.rowDetailService.setRoleRowDetail(data);
        this.router.navigate([keyWords.idmRolesNavigate], { queryParams: { pageId: this.pageId }, state: { error: true, filters: this.filters } })
        break;
    }
  }



  actionCellTemplate(container, options) {
    let div = document.createElement('div')
    let a = document.createElement('a');
    a.classList.add('color-blue')
    let html = '<img src="assets/icons/icon_plusDetail.svg">'

    if (this.dataGrid.instance.isRowExpanded(options.key)) {
      html = '<img src="assets/icons/icon_minusDetail.svg">'
    }
    a.innerHTML = html;
    a.onclick = () => {
      if (this.dataGrid.instance.isRowExpanded(options.key)) {
        this.dataGrid.instance.collapseRow(options.key)
      } else {
        options.component.collapseAll(-1)
        this.dataGrid.instance.expandRow(options.key)
      }
    }
    div.append(a);
    return div;
  }


  onDeleteClick(pageName, data) {
    this.openConfirmationDialog(pageName, data)
  }
  openConfirmationDialog(pageName, data) {
    let resType = { 'request-type': 'delete' };
    let headerConfig = deepClone(this.headerConfig)
    Object.assign(headerConfig, resType)
    this.confirmationDialogService.confirm(this.translate.instant(keyWords.delete), pageName == keyWords.identityUserPageName ? this.translate.instant(keyWords.deleteUser) : pageName == keyWords.identityRolesPageName ? this.translate.instant(keyWords.deleteRoles) : '')

      .then((confirmed) => {
        if (confirmed) {
          this.loader.show()
          switch (pageName) {
            case keyWords.identityUserPageName:
              let userId = data.userId
              this.apiService.getOrUpdateData(ApiPaths.deleteUser, { userId }, headerConfig).subscribe(data => {
                this.notification.showSuccess(this.translate.instant(keyWords.userDeleted))
                this.sharedService.refreshGrid.next();
              },
                err => {
                  this.notification.showError(this.translate.instant(keyWords.serviceNotAvailable))
                  this.loader.hide();
                })
              break;

            case keyWords.identityRolesPageName:
              let roleId = data.roleId;
              this.apiService.getOrUpdateData(ApiPaths.deleteRole, { roleId }, headerConfig).subscribe(data => {
                this.notification.showSuccess(this.translate.instant(keyWords.rolesDeleted));
                this.loader.hide();
                this.sharedService.refreshGrid.next();
              },
                err => {
                  this.notification.showError(this.translate.instant(keyWords.serviceNotAvailable))
                  this.loader.hide();
                })


          }
        }
      })
  }

  cellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? div : div.classList.add(keyWords.disabledAccessed)
    let a = document.createElement('a');
    a.classList.add(keyWords.editIconUrl)
    let html = '<img src="assets/icons/icon_edit.png" atl="edit">'
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.edit ? a.onclick = () => this.actionClick(this.identitymanagementPageInfo.pageName, deepClone(options.key)) : '';
    div.append(a);
    return div;
  }

  deletecellTemplate(container, options) {
    let div = document.createElement('div')
    isUserHasAccess(this.pageConfig?.permissions)?.delete ? div : div.classList.add(keyWords.disabledAccessed)
    let a = document.createElement('a')
    a.classList.add(keyWords.editIconUrl)
    let html = keyWords.imgDeleteCell
    a.innerHTML = html;
    isUserHasAccess(this.pageConfig?.permissions)?.delete ? a.onclick = () => this.deleteRow(this.identitymanagementPageInfo.pageName, deepClone(options.key)) : '';
    div.append(a);
    return div;
  }


  createCirclecellTemplate(container, options) {
    let parentSpan = document.createElement('SPAN')
    let span = document.createElement('span');
    span.style.backgroundColor = options.displayValue == keyWords.active ? colors.green : options.displayValue == keyWords.inactive ? colors.circleRed : '';
    let p = document.createElement('P')
    let textNode = document.createTextNode(options.displayValue);
    p.appendChild(textNode)
    parentSpan.appendChild(span);
    parentSpan.appendChild(p)

    return parentSpan;
  }
  calculateProductDetailsValue(rowdata) {
    let prouctName = "";
    if (rowdata && rowdata?.productDetails) {
      for (let serviceName of rowdata?.productDetails) {
        prouctName = prouctName == '' ? prouctName + serviceName.serviceName : prouctName + ',' + serviceName.serviceName
        // channelId = channelId==''?channelId + ch.channelId:channelId+','+ch.channelId;
      }
    }
    return prouctName
  }

  calculateOrganizationDetailsValue(rowData) {
    let orgName = "";
    if (rowData && rowData?.organizationDetails) {
      for (let name of rowData?.organizationDetails) {
        orgName = orgName == '' ? orgName + name.organizationName : orgName + ',' + name.organizationName;
      }
    }
    return orgName
  }

  calculateRoleDetailsValue(rowData) {
    let roleData = "";
    if (rowData && rowData?.roleDetails) {
      for (let roleName of rowData?.roleDetails) {
        roleData = roleData == '' ? roleData + roleName.roleName : roleData + ',' + roleName.roleName;
      }
    }
    return roleData
  }


  onRightClick(e) {
    if (e.target == keyWords.content) {
      e.items = [{
        text: keyWords.copy,
        onItemClick: () => {
          this.clipboard.copy(e?.targetElement.innerHTML);
        }
      }]

    }

  }

  onwheel() {
    const container = document.getElementsByClassName(keyWords.dxSubmenu)[0];
    if (container?.querySelector('span')?.innerHTML == 'Copy') {
      container.remove()
    }
  }

}
