import { Component, HostListener, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { keyWords } from '../../shared/constant';
import { Subscription, interval } from 'rxjs';
declare var bootstrap: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  cardheading = keyWords.homeHeading
  mySub: Subscription;
  constructor(private notification: NotificationService, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    if (document.readyState !== 'loading') {
      var element = document.getElementById("carouselExampleControls");
      var myCarousel = new bootstrap.Carousel(element);
    }
    else {
      document.addEventListener("DOMContentLoaded", function () {
        var element = document.getElementById("carouselExampleControls");
        var myCarousel = new bootstrap.Carousel(element);
      });
    }
  }


  showSuccess() {
    this.notification.showSuccess('Success message example', 'Success')
  }
  showError() {
    this.notification.showError('Error message example', 'Error')
  }
  showWarning() {
    this.notification.showWarning('Warning message example', 'Warning')
  }
  showInfo() {
    this.notification.showInfo('Info message example', '')
  }

  openConfirmationDialog() {
    this.confirmationDialogService.confirm('Alert', 'Do you really want to {{Action name}} ?')
      .then((confirmed) => console.log('User confirmed:', confirmed))
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

}
