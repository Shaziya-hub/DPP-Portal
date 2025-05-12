import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KAuthService } from 'src/app/services/KeycloackAuthService';

@Component({
  selector: 'app-permission-denied',
  templateUrl: './permission-denied.component.html',
  styleUrls: ['./permission-denied.component.scss']
})
export class PermissionDeniedComponent implements OnInit {

  constructor(private authenticationService: KAuthService, private translate: TranslateService) { }

  ngOnInit(): void {
  }

  logout() {
    this.authenticationService.logOut();
  }

}
