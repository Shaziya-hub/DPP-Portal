import { Component, OnInit } from '@angular/core';
import { DownloadManagerService } from './download-manager.service';

@Component({
  selector: 'download-manager',
  templateUrl: './download-manager.component.html',
  styleUrls: ['download-manager.component.scss']
})
export class DownloadManagerComponent implements OnInit {
  closeResult: string;

  constructor(private downloadManagerService: DownloadManagerService) { }
  downloads = [];
  file: any
  pdfFlag: boolean = false;
  csvFlag: boolean = false;

  ngOnInit(): void {
    this.downloads = this.downloadManagerService.exportedFiles;
  }

  close() {
    this.downloadManagerService.close()
  }

  clearAll() {
    this.downloads = [];
    this.downloadManagerService.clearAll();
  }

  downloadFile(obj: any) {
    //this.csvFlag = !this.csvFlag;
    this.downloadManagerService.download(obj)

  }

  pdfdownload(obj: any) {
    //  this.pdfFlag = !this.pdfFlag;
    this.downloadManagerService.download2(obj);


  }
  //pdffile:any
  receivefile() {

    this.downloadManagerService.selectedSubject$.subscribe((val: any) => {
      this.file = val;
    });

    // this.file.save("monthly-report.pdf")

  }

  deleteFile(obj: any) {
    this.downloadManagerService.delete(obj)
  }
}
