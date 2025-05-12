import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KAuthService } from './services/KeycloackAuthService';
import { LoaderService } from './services/loader.service';
import { StoreService } from './services/store.service';
import { mobileCheck } from './shared/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  menuOpen: boolean = false;
  user: any;
  isMobileView: boolean = false;

  loader: boolean = false;

  constructor(
    public store: StoreService,
    public loaderService: LoaderService,
    public authService: KAuthService,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {
    this.loaderService.loader.subscribe(value => {
      this.loader = value;
      //  this.cdRef.detectChanges();
    })
  }
  ngOnInit(): void {
    this.store.sideMenu.subscribe(sideMenu => {
      this.menuOpen = sideMenu.menuOpen;
      this.isMobileView = mobileCheck();
    });
    this.user = this.authService.getLoggedUser();
    if (this.user) {
      let lang = localStorage.getItem('selectedLang') != undefined && localStorage.getItem('selectedLang') != "" && localStorage.getItem('selectedLang') != null ? localStorage.getItem('selectedLang') : this.user.locale;
      lang = lang == null || lang == "" || lang == undefined ? "en" : lang;

      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
      localStorage.setItem('selectedLang', lang);

      let el = document.getElementById('dpp-body');

      if (lang == 'ar') {
        el && el.classList.add('arb');
      } else {
        el && el.classList.remove('arb');
      }

      for (const styleSheet of <any>document.styleSheets) {
        if (styleSheet.href && styleSheet.href.indexOf('06-arabic') > -1) {
          styleSheet.disabled = lang != 'ar';
        }
      }
    }
  }
}
