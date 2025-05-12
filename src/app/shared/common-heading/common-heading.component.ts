import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-common-heading',
  template: '<div class="pageHeadings"><span class="page-heading2">{{parentPage | translate}} &nbsp;<span class="subpage-heading2">/&nbsp;{{childPage |translate}}</span></span><hr></div>',
})
export class CommonHeadingComponent {
  parentPage = '';
  childPage = "";
  pageId: any;
  constructor(private activeRoute: ActivatedRoute, private store: StoreService) { }
  ngOnInit() {

    this.activeRoute.queryParams.subscribe((params) => {
      this.pageId = params.pageId;
    })
    this.store.sideMenu.subscribe(sideMenu => {
      sideMenu.menuItems.forEach(menu => {

        menu?.subMenu.filter(submenu => {
          if (submenu.pageId == this.pageId) {
            this.childPage = submenu.text;
            this.parentPage = menu.text
          }
        })
      })
    });
  }
}
