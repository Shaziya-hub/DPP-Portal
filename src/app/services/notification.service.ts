import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService, private translate: TranslateService) { }

  showSuccess(message, title = null) {
    this.toastr.success(message, title)
  }

  showError(message, title = null) {
    this.toastr.error(message, title)
  }

  showInfo(message, title = null) {
    this.toastr.info(message, title)
  }

  showWarning(message, title = null) {
    this.toastr.warning(message, title)
  }

}