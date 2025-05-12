import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { RestApiService } from 'src/app/services/rest-api.service';
import { StoreService } from 'src/app/services/store.service';
import { keyWords } from 'src/app/shared/constant';
import { ApiPaths, customizeText, customizeText2 } from 'src/app/shared/utils';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'detail-grid',
  templateUrl: './detail-grid.component.html',
  styleUrls: ['./detail-grid.component.scss']
})
export class DetailGridComponent {
  @Input() key;
  @Input() pageConfig;
  @Input() filters

  dataSource = null;
  pixelWidth = require('string-pixel-width');
  columns: any[] = [];

  config = keyWords.config
  showNoDetailRecords: boolean = false;
  serviceNotRespond: boolean = false;
  loading: boolean

  constructor(private restApiService: RestApiService, private storeService: StoreService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    let filters = {
      SearchFilters: {
        userId: this.key.userId
      }
    }
    this.loading = true;
    this.restApiService.getTableData(ApiPaths.getUserDetails, filters, this.config).subscribe(data => {
      //let dataSource = data.body.PaymentTransactionDetails;

      data.body ? this.loading = false : this.loading = true


      let dataSource = data?.body?.UserDetails;
      /*
         for column where it as 'type'='sensitive', it will be sent as encrypted. portal needs to decrypt this fields as soon as the receive response from API, 
         no need for on click event from user
       */
      this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
        if (o.type == 'sensitive') {
          dataSource.map((d: any) => {
            let key = Object.keys(d).find(key => key == o[keyWords.dataFiledId]);
            if (d[key] != null) {

              // Same key used in Java
              let secretKey = 'ec5582d0fccd6o41';
              const bytes = CryptoJS.AES.decrypt(d[key], CryptoJS.enc.Utf8.parse(secretKey), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
              });

              return d[key] = bytes.toString(CryptoJS.enc.Utf8);

            }
          })
        }

      })
      this.columns = [];
      this.setColumns(dataSource);
      dataSource != null && dataSource != undefined && dataSource.length > 0 ? this.showNoDetailRecords = false : this.showNoDetailRecords = true
    },
      (err) => {
        this.serviceNotRespond = true;
        //this.notification.showError(err.message);
      });
  }

  setColumns(dataSource) {
    this.pageConfig.selectableColumnsDetails && this.pageConfig.selectableColumnsDetails.map((o: any) => {
      let hasSorting = o.sorting//this.pageConfig.sortingColumns.find((el: any) => el.id == o.id && el.flag == 'true');
      let preview = null
      preview = this.pageConfig.permissions.find((el: any) => el.type == 'PrivView' && el.flag == 'true');
      if (o.flag == 'true') {
        if (o[keyWords.dataFiledId] == keyWords.organizationDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: hasSorting, adaptive: true, calculateCellValue: this.calculateOrganizationDetailsValue });
        }
        else if (o[keyWords.dataFiledId] == keyWords.productDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: false, adaptive: true, calculateCellValue: this.calculateProductDetailsValue });
        }
        else if (o[keyWords.dataFiledId] == keyWords.roleDetails) {
          this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], allowSorting: false, adaptive: true, calculateCellValue: this.calculateRoleDetailsValue });
        }
      } else if (o[keyWords.dataFieldType]?.toLowerCase().indexOf(keyWords.sensitiveType) > -1) {
        this.columns.push({ dataField: o[keyWords.dataFiledId], caption: o[keyWords.captionName], cssClass: 'passwordCss', width: this.pixelWidth(o[keyWords.captionName], { size: 14, weight: 700 }) + 75, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false, cellTemplate: preview ? customizeText : customizeText2 });
      } else if (o.type == 'numeric') {
        this.columns.push({ dataField: o['id'], alignment: keyWords.right, caption: o['name'], cssClass: keyWords.amountTextCss, allowSorting: hasSorting ? true : false, adaptive: true, allowColumnResizing: false });
      } else {
        this.columns.push({ dataField: o['id'], caption: o['name'], allowSorting: false, adaptive: true });
      }
      this.dataSource = new DataSource({
        store: new ArrayStore({
          data: dataSource
        }),
        // filter: ['EmployeeID', '=', this.key],
      });
    })
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

  onCellDetailDblClick(e) {
    // this.clipboard.copy(e?.text);
  }

  //On hover row is being highlighted
  onFocusedCellChanging(e) {
    e.isHighlighted = false;
  }
}
