import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadManagerComponent } from './download-manager.component';
import { saveAs } from 'file-saver';
import { Observable, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';



@Injectable()
export class DownloadManagerService {

  subject = new Subject<any>();
  private subject$ = new BehaviorSubject<any>({});
  selectedSubject$ = this.subject$.asObservable();

  constructor(private modalService: NgbModal) {
    if (this.exportedFiles.length == 0 && sessionStorage.getItem("exportedFiles")) {
      this.exportedFiles = JSON.parse(sessionStorage.getItem("exportedFiles")) || []
    }
  }

  exportedFiles = [];
  isDownloading = false;
  excelObjectArry = []

  open() {
    this.modalService.open(DownloadManagerComponent, { modalDialogClass: 'dark-modal', centered: true, size: 'lg', backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
  }

  download(obj) {
    saveAs(obj.blob, obj.name + '.csv')
  }

  downloadexcel(obj) {
    // console.log('Excel obj', obj)
    saveAs(obj.blob, obj.name + '.xlsx')
  }

  download2(obj) {

    saveAs(obj.blob, obj.name + '.pdf')
    //this.receivepdf();
  }

  sendpdf(file: any) {
    this.subject.next(file)
  }

  receivepdf(): Observable<any> {
    return this.subject.asObservable();
  }

  setdocument(value: any) {
    this.subject$.next(value);
  }

  delete(obj) {
    let index = this.exportedFiles.findIndex(o => o.id == obj.id);
    index >= 0 && this.exportedFiles.splice(index, 1);
    sessionStorage.setItem("exportedFiles", JSON.stringify(this.exportedFiles));
  }

  clearAll() {
    this.exportedFiles = [];
    sessionStorage.setItem("exportedFiles", "");
  }

}