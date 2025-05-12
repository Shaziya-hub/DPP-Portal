import { Component } from '@angular/core';
import { GenerateInvoiceModalService } from './genereate-invoice-modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generate-invoice-modal',
  templateUrl: './generate-invoice-modal.component.html',
  styleUrls: ['./generate-invoice-modal.component.scss']
})
export class GenerateInvoiceModalComponent {
  billNumber: any;
  constructor(private generateService: GenerateInvoiceModalService) {
    this.billNumber = this.generateService.billNumber;
  }
  close() {
    this.generateService.close();
  }
  goBack() {
    this.generateService.close();
  }
}
