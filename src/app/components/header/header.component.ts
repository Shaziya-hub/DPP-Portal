import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KAuthService } from 'src/app/services/KeycloackAuthService';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { StoreService } from 'src/app/services/store.service';
import { DownloadManagerService } from '../download-manager/download-manager.service';
import { SideMenu } from '../side-menu/side-menu';
import { Header } from './header';
import { ExcelServicesService } from 'src/app/services/excel.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { pdfArabicFonts, pdfKeywords } from 'src/app/shared/constant';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public header: any = Header;
  public user: any;
  public sideMenu: any = SideMenu;
  selectedLang: any = "";
  nextSelectedLang: any = "";
  userPassword: any = null
  constructor(
    public store: StoreService,
    public sideMenuService: SideMenuService,
    public authservice: KAuthService,
    public translate: TranslateService,
    public downloadManagerService: DownloadManagerService,
    public excelServicesService: ExcelServicesService,
    public datepipe: DatePipe
  ) {
    this.store.header.subscribe(header => {
      this.header = header;
    });

    this.user = authservice.getLoggedUser();

    this.store.sideMenu.subscribe(sideMenu => {
      this.sideMenu = sideMenu;
    })

    let langs = ['en', 'ar'];
    translate.addLangs(langs);
    let lang = localStorage.getItem('selectedLang');
    // console.log("lang is in header",lang);
    if (lang && langs.indexOf(lang) > -1 && lang == 'ar') {
      this.selectedLang = lang;
      this.nextSelectedLang = "en"
      translate.setDefaultLang(lang);
      this.translate.use(lang);
    } else if (lang && langs.indexOf(lang) > -1 && lang == 'en') {
      this.selectedLang = lang;
      this.nextSelectedLang = "ar"
      translate.setDefaultLang(lang);
      this.translate.use(lang);
    }
    else {
      lang = 'en';
      this.selectedLang = lang;
      translate.setDefaultLang(lang);
      this.translate.use(lang);
      localStorage.setItem('selectedLang', lang)
    }
  }

  ngOnInit() {
    let str = this.store.user.getValue().email
    var split = str.split("@");
    let pass = split[0]
    this.userPassword = pass
  }

  toggleMenu() {
    this.sideMenuService.toggleSideMenu();
  }

  switchLang(e: any) {
    let lang = e;//e.target.value;
    // console.log("on switching is ",e);
    localStorage.setItem('selectedLang', lang)
    this.selectedLang = lang;
    localStorage.setItem('selectedLang', this.selectedLang)
    location.reload();
  }

  logout() {
    this.authservice.logOut();
    this.downloadManagerService.clearAll();
  }
  //Download Dropdown 
  downloads = [];
  file: any
  pdfFlag: boolean = false;
  csvFlag: boolean = false;
  closeResult: string;
  percentageCal = "";
  inprogressMethod() {
    this.downloads = this.downloadManagerService.exportedFiles;

    for (let percentage of this.downloads) {
      //  console.log("percentage is ",percentage.percent);
      this.percentageCal = percentage.percent;
      if (this.percentageCal != "") {
        document.getElementById("downloadmanagerid").setAttribute("data-percentage", this.percentageCal);
      }
    }
  }
  downloadManagerClick() {

    this.downloads = this.downloadManagerService.exportedFiles;
  }
  setDownloadFalse() {
    this.downloadManagerService.isDownloading = false;
  }
  close() {
    this.downloadManagerService.close()
  }

  clearAll() {
    this.downloads = [];
    this.downloadManagerService.clearAll();
    this.percentageCal = "";
    document.getElementById("downloadmanagerid").setAttribute("data-percentage", this.percentageCal);
  }

  downloadFile(obj: any) {
    //this.csvFlag = !this.csvFlag;
    // console.log('obj',obj)
    if (obj.xlsxFlag) {
      this.downloadManagerService.downloadexcel(obj)
    } else {
      this.downloadManagerService.download(obj)
    }
  }

  pdfdownload(obj: any) {
    //  this.pdfFlag = !this.pdfFlag;
    this.downloadManagerService.download2(obj);


  }

  deleteFile(obj: any) {
    this.downloadManagerService.delete(obj)
    //console.log('obj', this.downloadManagerService.exportedFiles)
    if (this.downloadManagerService.exportedFiles.length == 0) {
      this.clearAll();
      //console.log('clear')

    }
  }


  /*
    Common Function to create and download pdf for all the pages
  */
  downloadPDF() {
    let pdfFile: any
    let label: any
    let currentTimestamp: any
    let fromDate: any
    let toDate: any
    let reportfromDate: any
    let reporttoDate: any
    let DownloadReportDateFormat: any
    let pageConfig: any
    this.downloadManagerService.selectedSubject$.subscribe((val: any) => {//console.log('val',val)
      label = val.label;
      currentTimestamp = val.currentTimestamp;
      fromDate = val.fromdate;
      toDate = val.todate
      DownloadReportDateFormat = val.pageConfig?.customParams?.DownloadReportDateFormat
      pageConfig = val.pageConfig
      let header = []
      //transaction changes for pdf dynamic header  start
      // console.log('val.selectableColumns',val.selectableColumns,'-----','val.detail',val.dataSource)
      val.selectableColumns.forEach(head => { console.log('head',head)
        if (head.flag == 'true' && head.reportFlag == 'true' && head.id != 'extRefDetails') {
          let renamedObject = Object.assign({}, { dataKey: head.id, title: head.name, type: head.type });
          // console.log(renamedObject);
          header.push(renamedObject)
         // console.log('header.length',header.length)
        }
      }); //console.log('header',header)
      //transaction changes for pdf dynamic header end
      //this will be used in future just commented for now 
      //const doc = new jsPDF('p','mm','a4')
      const doc = new jsPDF.default({
        orientation: header.length > 10 ? 'landscape' : 'p',
        format: header.length <= 5 ? 'a4' : header.length > 5 && header.length <= 9 ? 'a3' : header.length > 9 && header.length <= 14 ? 'a2' : header.length > 14 && header.length <= 22 ? 'a1' : 'a1',
        encryption: {
          userPassword: pageConfig?.customParams?.EnableFilePasswordProtection == 'TRUE' ? this.userPassword : null,
          ownerPassword: 'pass',
          userPermissions: ["print", "modify", "copy", "annot-forms"]
        }
      });

      var tittle = val.pageName.toUpperCase()//this.label
      var summary = this.translate.instant('Summary')
      var imgData = pdfKeywords.cboPdt
      var details = this.translate.instant('Details')
      var NotoSansArabicBold = pdfArabicFonts.NotoSansArabicBold
      var reportDate: any = new Date();
      reportDate = this.datepipe.transform(reportDate, val.pageConfig.customParams.DownloadReportDateFormat)

      if (this.selectedLang == 'en') {
        if (tittle) {
          doc.setFontSize(24),
            doc.setFont('helvetica', 'bold'),
            doc.setFillColor('#113132')
          doc.rect(0, 0, 850, 45, 'F')
          doc.setTextColor('white');
          doc.text(tittle, 5, 38),

            doc.setFontSize(10),
            doc.setFont('helvetica'),
            doc.setTextColor('gray');
          header.length <= 5 ? doc.text(this.translate.instant('Report Date :'), 140, 15) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Report Date :'), 230, 15) : header.length > 10 && header.length <= 15 ? doc.text(this.translate.instant('Report Date :'), 515, 15) : header.length > 15 && header.length <= 22 ? doc.text(this.translate.instant('Report Date :'), 750, 15) : doc.text(this.translate.instant('Report Date :'), 140, 15),

            doc.setFontSize(10),
            doc.setFont('helvetica'),
            doc.setTextColor('white');
          header.length <= 5 ? doc.text(reportDate, 165, 15) : header.length > 5 && header.length <= 10 ? doc.text(reportDate, 255, 15) : header.length > 10 && header.length <= 15 ? doc.text(reportDate, 540, 15) : header.length > 15 && header.length <= 22 ? doc.text(reportDate, 775, 15) : doc.text(reportDate, 165, 15),

            doc.addImage(imgData, 0, 7, 100, 23);
        }

        if (val.reportsFlag == true) {
          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          doc.text(summary, 5, 60)

          doc.setDrawColor('#ECEBEB');
          doc.setFillColor('#F6F8FA')
          header.length <= 5 ? doc.roundedRect(3, 65, 203, 55, 3, 3, 'FD') : header.length > 5 && header.length <= 10 ? doc.roundedRect(3, 65, 290, 55, 3, 3, 'FD') : doc.roundedRect(3, 65, 300, 55, 3, 3, 'FD');

          if (val.reports.attributeName == 'BillsRpt') {
            if (val.reports.billStatus != null) {
              doc.setFontSize(10),
                doc.setFont('helvetica', 'normal'),
                doc.setTextColor('black');
              doc.text(this.translate.instant('Bill Status'), 10, 75)

              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              doc.text(val.reports.billStatus, 10, 85)
            }

          } else if (val.reports.attributeName == 'PmtsRpt') {
            doc.setFontSize(10),
              doc.setFont('helvetica', 'normal'),
              doc.setTextColor('black');
            doc.text(this.translate.instant('Payment Status'), 10, 75)

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            doc.text(val.reports.paymentStatus, 10, 85)
          } else if (val.reports.attributeName == 'Summary') {
            doc.setFontSize(10),
              doc.setFont('helvetica', 'normal'),
              doc.setTextColor('black');
            doc.text(this.translate.instant('Summary Type'), 10, 75)

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            doc.text(val.reports.summaryType, 10, 85)
          } else {
            doc.setFontSize(10),
              doc.setFont('helvetica', 'normal'),
              doc.setTextColor('black');
            doc.text(this.translate.instant('Business Service'), 10, 75)

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            doc.text(val.reports.bizService, 10, 85)

            doc.setFontSize(10),
              doc.setFont('helvetica', 'normal'),
              doc.setTextColor('black');
            doc.text(this.translate.instant('Gateways'), 100, 75)

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            doc.text(val.reports.pmtGateways, 100, 85)
          }

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('black');
          val.reports.attributeName == 'BillsRpt' || val.reports.attributeName == 'PmtsRpt' || val.reports.attributeName == 'Summary' ? doc.text(this.translate.instant('Date Range'), 85, 75) : val.reports.attributeName == 'Details' ? doc.text(this.translate.instant('Date Range'), 10, 100) : doc.text(this.translate.instant('Date Range'), 10, 100)

          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          //doc.text(val.fromdate + ' ' + '-' + ' ' + val.todate, 85, 85)
          val.reports.attributeName == 'BillsRpt' || val.reports.attributeName == 'PmtsRpt' || val.reports.attributeName == 'Summary' ? doc.text(val.fromdate + ' ' + '-' + ' ' + val.todate, 85, 85) : val.reports.attributeName == 'Details' ? doc.text(val.fromdate + ' ' + '-' + ' ' + val.todate, 10, 110) : doc.text(val.fromdate + ' ' + '-' + ' ' + val.todate, 10, 110)

        }

        if (details) {
          doc.setFontSize(14),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('black');
          val.reportsFlag == true ? doc.text(details, 5, 135) : doc.text(details, 5, 60)

          doc.setFontSize(10),
            doc.setFont('helvetica', 'normal'),
            doc.setTextColor('#3498DB');
          val.reportsFlag == true ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + 'records]', 25, 135) : doc.text('[' + ' ' + val.totalRecordsCount + ' ' + 'records]', 25, 60)

        }

        (doc as any).autoTable(header, val.dataSource, {
          margin: { horizontal: 5 },
          bodyStyles: {},
          startY: val.reportsFlag == true ? 143 : 68,
          headStyles: {
            fillColor: 'white',
            fontStyle: 'bold',
            halign: 'left',    //'center' or 'right'   
            textColor: '#1D1556', //White     
            fontSize: 10,
          },
          styles: {
            cellPadding: 3,
            fontSize: 6,
            valign: 'middle',
            overflow: 'linebreak',
            lineWidth: 0,
            cellWidth: 'wrap'
          },
          showHead: "firstPage",
          alternateRowStyles: {},

          didParseCell: function (data) {//console.log('data',data)
            data.table.columns.forEach(c => {
              if (data.section === 'body' && data.column.raw?.type == "amount") {
                data.cell.styles.textColor = "black";
                data.cell.styles.halign = "right";
                data.cell.styles.fontStyle = "bold";
              }
              if (data.section === 'head' && data.column.raw?.type == "amount") {
                data.cell.styles.halign = "right";
              }
            })
          },

          didDrawPage: function (data) {
            if (data.pageCount > 1) { }
          },
        })
        /*
          Starting with Arabic side pdf Changes
        */
      } else if (this.selectedLang == 'ar') {

        if (tittle) {

          doc.addFileToVFS("NotoSansArabic-Bold.ttf", NotoSansArabicBold);
          doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'normal');
          doc.setFont('NotoSansArabic');
          doc.setFontSize(24),
            doc.setFillColor('#1D1556')
          doc.rect(0, 0, 850, 45, 'F')
          doc.setTextColor('white');

          //doc.text(tittle, 250, 38, { align: 'left' })
          header.length <= 5 ? doc.text(tittle, 195, 38, { align: 'right' }) : header.length > 5 && header.length <= 10 ? doc.text(tittle, 275, 38, { align: 'right' }) : header.length > 10 && header.length <= 15 ? doc.text(tittle, 560, 38, { align: 'right' }) : header.length > 15 && header.length <= 22 ? doc.text(tittle, 795, 38, { align: 'right' }) : doc.text(tittle, 195, 38, { align: 'right' })

          doc.setFontSize(10),
            doc.setFont('NotoSansArabic');
          doc.setTextColor('gray');
          doc.text(this.translate.instant('Report Date :'), 5, 15, { align: 'left' })

          doc.setFontSize(10),
            doc.setFont('helvetica'),
            doc.setTextColor('white');
          doc.text(reportDate, 30, 15)

          header.length <= 5 ? doc.addImage(imgData, 130, 5, 80, 20) : header.length > 5 && header.length <= 10 ? doc.addImage(imgData, 210, 5, 80, 20) : header.length > 10 && header.length <= 15 ? doc.addImage(imgData, 500, 5, 80, 20) : header.length > 15 && header.length <= 22 ? doc.addImage(imgData, 740, 5, 80, 20) : doc.addImage(imgData, 130, 5, 80, 20)
          //doc.addImage(imgData, 130, 5, 80, 20);
        }
        if (details && val.reportsFlag != true) {
          doc.addFileToVFS("NotoSansArabic-Bold.ttf", NotoSansArabicBold);
          doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'normal');

          doc.setFont('NotoSansArabic');
          doc.setFontSize(14),
            doc.setTextColor('black');
          header.length <= 5 ? doc.text(details, 185, 60) : header.length > 5 && header.length <= 10 ? doc.text(details, 270, 60) : header.length > 10 && header.length <= 15 ? doc.text(details, 560, 60) : header.length > 15 && header.length <= 22 ? doc.text(details, 795, 60) : doc.text(details, 185, 60)

          doc.setFontSize(10),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('#3498DB');
          header.length <= 5 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 165, 60) : header.length > 5 && header.length <= 10 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 250, 60) : header.length > 10 && header.length <= 15 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 540, 60) : header.length > 15 && header.length <= 22 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 775, 60) : doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 165, 60)

        }

        if (val.reportsFlag == true) {

          doc.addFileToVFS("NotoSansArabic-Bold.ttf", NotoSansArabicBold);
          doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'normal');

          doc.setFont('NotoSansArabic');
          doc.setFontSize(14),
            doc.setTextColor('black');
          header.length <= 5 ? doc.text(this.translate.instant('Summary'), 185, 60, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Summary'), 270, 60, { align: 'left' }) : doc.text(this.translate.instant('Summary'), 185, 60, { align: 'left' });

          doc.setDrawColor('#ECEBEB');
          doc.setFillColor('#F6F8FA')
          header.length <= 5 ? doc.roundedRect(3, 65, 203, 55, 3, 3, 'FD') : header.length > 5 && header.length <= 10 ? doc.roundedRect(3, 65, 290, 55, 3, 3, 'FD') : doc.roundedRect(3, 65, 203, 55, 3, 3, 'FD');


          doc.setFontSize(10),
            doc.setFont('NotoSansArabic');
          doc.setTextColor('black');
          header.length <= 5 ? doc.text(this.translate.instant('Details'), 185, 135) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Details'), 270, 135) : header.length > 10 && header.length <= 15 ? doc.text(this.translate.instant('Details'), 560, 135) : header.length > 15 && header.length <= 22 ? doc.text(this.translate.instant('Details'), 795, 135) : doc.text(this.translate.instant('Details'), 185, 135)



          if (val.reports.attributeName == 'BillsRpt') {

            if (val.reports.billStatus != null) {
              doc.setFontSize(10),
                doc.setFont('NotoSansArabic');
              doc.setTextColor('black');
              header.length <= 5 ? doc.text(this.translate.instant('Bill Status'), 175, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Bill Status'), 265, 75, { align: 'left' }) : doc.text(this.translate.instant('Bill Status'), 175, 75, { align: 'left' })

              doc.setFontSize(10),
                doc.setFont('NotoSansArabic');
              doc.setTextColor('black');
              header.length <= 5 ? doc.text(this.translate.instant('Date Range'), 95, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Date Range'), 175, 75, { align: 'left' }) : doc.text(this.translate.instant('Date Range'), 95, 75, { align: 'left' })

              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              header.length <= 5 ? doc.text(val.reports.billStatus, 190, 85, { align: 'right' }) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.billStatus, 285, 85, { align: 'right' }) : doc.text(val.reports.billStatus, 190, 85, { align: 'right' })

              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              header.length <= 5 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 10, 85) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 90, 85) : doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 10, 85)

            }

          } else if (val.reports.attributeName == 'PmtsRpt') {
            if (val.reports.paymentStatus != null) {
              doc.setFontSize(10),
                doc.setFont('NotoSansArabic');
              doc.setTextColor('black');
              header.length <= 5 ? doc.text(this.translate.instant('Payment Status'), 175, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Payment Status'), 265, 75, { align: 'left' }) : doc.text(this.translate.instant('Payment Status'), 175, 75, { align: 'left' })

              doc.setFontSize(10),
                doc.setFont('NotoSansArabic');
              doc.setTextColor('black');
              header.length <= 5 ? doc.text(this.translate.instant('Date Range'), 95, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Date Range'), 175, 75, { align: 'left' }) : doc.text(this.translate.instant('Date Range'), 95, 75, { align: 'left' })


              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              header.length <= 5 ? doc.text(val.reports.paymentStatus, 190, 85, { align: 'right' }) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.paymentStatus, 285, 85, { align: 'right' }) : doc.text(val.reports.paymentStatus, 190, 85, { align: 'right' })

              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              header.length <= 5 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 10, 85) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 90, 85) : doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 10, 85)
            }
          } else if (val.reports.attributeName == 'Summary') {
            if (val.reports.summaryType != null) {
              doc.setFontSize(10),
                doc.setFont('NotoSansArabic');
              doc.setTextColor('black');
              header.length <= 5 ? doc.text(this.translate.instant('Summary Type'), 175, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Summary Type'), 265, 75, { align: 'left' }) : doc.text(this.translate.instant('Summary Type'), 175, 75, { align: 'left' })

              doc.setFontSize(10),
                doc.setFont('NotoSansArabic');
              doc.setTextColor('black');
              header.length <= 5 ? doc.text(this.translate.instant('Date Range'), 95, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Date Range'), 175, 75, { align: 'left' }) : doc.text(this.translate.instant('Date Range'), 95, 75, { align: 'left' })

              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              header.length <= 5 ? doc.text(val.reports.summaryType, 190, 85, { align: 'right' }) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.summaryType, 265, 85, { align: 'right' }) : doc.text(val.reports.summaryType, 190, 85, { align: 'right' })

              doc.setFontSize(14),
                doc.setFont('helvetica', 'bold'),
                doc.setTextColor('black');
              header.length <= 5 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 10, 85) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 90, 85) : doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 10, 85)
            }
          } else {
            doc.setFontSize(10),
              doc.setFont('NotoSansArabic');
            doc.setTextColor('black');
            //doc.text(this.translate.instant('Business Service'), 177, 75, { align: 'left' })
            header.length <= 5 ? doc.text(this.translate.instant('Business Service'), 177, 75, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Business Service'), 262, 75, { align: 'left' }) : doc.text(this.translate.instant('Business Service'), 177, 75, { align: 'left' })

            doc.setFontSize(10),
              doc.setFont('NotoSansArabic');
            doc.setTextColor('black');
            // doc.text(this.translate.instant('Gateways'), 185, 100, { align: 'left' })
            header.length <= 5 ? doc.text(this.translate.instant('Gateways'), 185, 100, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Gateways'), 275, 100, { align: 'left' }) : doc.text(this.translate.instant('Gateways'), 185, 100, { align: 'left' })

            doc.setFontSize(10),
              doc.setFont('NotoSansArabic');
            doc.setTextColor('black');
            header.length <= 5 ? doc.text(this.translate.instant('Date Range'), 90, 100, { align: 'left' }) : header.length > 5 && header.length <= 10 ? doc.text(this.translate.instant('Date Range'), 210, 100, { align: 'left' }) : doc.text(this.translate.instant('Date Range'), 90, 100, { align: 'left' })

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            header.length <= 5 ? doc.text(val.reports.bizService, 160, 85) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.bizService, 247, 85) : doc.text(val.reports.bizService, 160, 85)

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            header.length <= 5 ? doc.text(val.reports.pmtGateways, 180, 110) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.pmtGateways, 268, 110) : doc.text(val.reports.pmtGateways, 180, 110)

            doc.setFontSize(14),
              doc.setFont('helvetica', 'bold'),
              doc.setTextColor('black');
            header.length <= 5 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 20, 110) : header.length > 5 && header.length <= 10 ? doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 142, 110) : doc.text(val.reports.fromdate + ' ' + '-' + ' ' + val.reports.todate, 20, 110)

          }
          doc.setFontSize(10),
            doc.setFont('helvetica', 'bold'),
            doc.setTextColor('#3498DB');
          header.length <= 5 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 165, 135) : header.length > 5 && header.length <= 10 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 250, 135) : header.length > 10 && header.length <= 15 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 540, 135) : header.length > 15 && header.length <= 22 ? doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 775, 135) : doc.text('[' + ' ' + val.totalRecordsCount + ' ' + ']', 165, 135)
        }

        (doc as any).autoTable(header, val.dataSource, {
          margin: { horizontal: 5 },
          bodyStyles: {},
          startY: val.reportsFlag == true ? 143 : 68,
          headStyles: {
            fillColor: 'white',
            fontStyle: 'bold',
            font: 'NotoSansArabic',
            halign: 'right',    //'center' or 'right'   
            textColor: '#1D1556', //White     
            fontSize: 10,
          },
          styles: {
            cellPadding: 3,
            fontSize: 8,
            valign: 'middle',
            overflow: 'linebreak',
            lineWidth: 0,
          },
          showHead: "firstPage",
          alternateRowStyles: {},

          didParseCell: function (data) { //console.log('data',data)
            data.table.columns.forEach(c => {
              if (data.section === 'body') {
                data.cell.styles.halign = "right";
                if (data.column.raw?.type == "amount") {
                  data.cell.styles.textColor = "black";
                  data.cell.styles.fontStyle = "bold";
                }
              }
              if (data.section === 'head') {
                data.cell.styles.halign = "right";
              }
            })
          },
          didDrawPage: function (data) {
            if (data.pageCount > 1) { }
          },
        })
      }
      pdfFile = doc
    });

    pdfFile.save(label + '_' + currentTimestamp + '_' + fromDate + '_' + toDate + '.pdf')
  }

}
