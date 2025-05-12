import { Injectable } from '@angular/core';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import XlsxPopulate from "src/assets/js/xlsx-populate.js"
import ExcelJS from "src/assets/js/exceljs.min.js"
import { DownloadManagerService } from '../components/download-manager/download-manager.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelServicesService {
  // constructor(private encryptor:Encryptor) { }  

  excelDownloads: any = []

  constructor(
    public downloadManagerService: DownloadManagerService,
    private store: StoreService
  ) {

  }

  public async exportAsExcelFile(excelObj): Promise<void> {
    this.excelDownloads = excelObj
    let array = this.excelDownloads.mainHeader
    let passwordEnable = this.excelDownloads?.pageConfig?.customParams?.EnableFilePasswordProtection
    const workbook = new ExcelJS.Workbook();
    let trx: String = excelObj.sheet
    const worksheet = workbook.addWorksheet(trx);

    // const worksheet= workbook.addWorksheet("Employee");
    const headerRow = worksheet.addRow(array)
    headerRow.eachCell(cell => {
      cell.font = { bold: true }
    })

    this.excelDownloads.falseKeys.forEach(key => {//console.log('key',key)
      this.excelDownloads.updateData.forEach(d => { //console.log('d',d)
        delete d[key]
      })
    })

    this.excelDownloads.updateData.forEach(d => {
      let arry = []
      Object.values(d).find((val: any) => {
        if (val != null) {
        //  console.log()
          d.batchId == val || d.paymentRef == val || d.billNumber == val || d.serviceNumber == val || d.accountNumber == val || d.billRefInfo == val || d.date == val || d.profileId == val || d.paymentRef == val || d.userAgentId == val || d.extSysRefId == val || d.fileName == val
            || d.SADADPmt_billNumber == val || d.SADADPmt_accountNumber || d.SADADPmt_pmtSystemTransId || d.SADADPmt_pmtSystemTransDate || d.SADADPmt_bankTransDate || d.SADADPmt_bankTransId || d.SADADPmt_pmtReceivedDate
            || d.billGenerationDate == val || d.receivedDate == val || d.processDate == val ? arry.push("'" + val) : arry.push(val);
        } else if (val == null) {
          arry.push(' ');
        }


      })



      worksheet.addRow(arry)
    })

    let updateData = this.excelDownloads.updatedData
    let download = this.downloadManagerService
    let str = this.store.user.getValue().email
    var split = str.split("@");
    let password = split[0];
    let id = this.excelDownloads.id;
    let name = this.excelDownloads.name
    let totalCount = this.excelDownloads.totalCount;
    let date = this.excelDownloads.date;
    let percent = this.excelDownloads.percent;
    let pass = {
      password: passwordEnable == 'TRUE' ? password : null
    }

    workbook.xlsx.writeBuffer().then(function (buffer) {
      //    console.log('buffer', buffer)
      XlsxPopulate.fromDataAsync(buffer).then(function (workbook) {

        workbook.outputAsync(pass).then(function (blob) {
          //  console.log('blob', blob)

          var fileReader = new FileReader();

          fileReader.onload = (evt) => {
            var result = evt.target.result;
            // console.log('result', result)
            let storeData = {
              blob: blob,
              fileName: 'xlsx',
              id: id,
              name: name,
              totalCount: totalCount,
              date: date,
              percent: percent,
              xlsxFlag: true
            }

            let index = download.exportedFiles.findIndex(o => o.id == id);

            if (index >= 0) {
              download.exportedFiles[index] = storeData;
            } else {
              download.exportedFiles.push(storeData);
            }
            try {
              sessionStorage.setItem('exportedFiles', JSON.stringify(download.exportedFiles));
            } catch (e) {
            }
          };
          fileReader.readAsDataURL(new Blob([updateData], { type: 'text/xlsx' }));
        });
      });
    });
  }

}  