import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd } from '@angular/router';
import { MenuItem } from '../components/side-menu/menu-item';
import { SideMenu } from '../components/side-menu/side-menu';
import { RestApiService } from './rest-api.service';
import { LoaderService } from './loader.service';
import { NavigationService } from './navigation.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
  constructor(
    public store: StoreService,
    public navigation: NavigationService,
    private loaderService: LoaderService,
    private restApiService: RestApiService,
    private titleService: Title
  ) {
    this.navigation.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loaderService.hide();
        if (event.urlAfterRedirects.indexOf('home') > -1) {
          this.titleService.setTitle('Home')
        }
        let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
        sideMenu.menuItems.forEach(menuItem => {
          menuItem.active = false;
          if (event.url.startsWith(menuItem.link)) {
            menuItem.active = true;
          }
          if (menuItem.subMenu && menuItem.subMenu.length > 0) {
            menuItem.subMenu.forEach(subMenuItem => {
              if (event.url.startsWith(subMenuItem.link)) {
                menuItem.active = true;
                subMenuItem["selected"] = "custom-class";
              }
            })
          }
        });
        this.store.sideMenu.next(sideMenu);
      }
    });

    let sideMenu = new SideMenu();
    this.loaderService.show();
    let user = this.store.user.getValue();

    let params: any = {
      //userId: user.id =="768c5dcf-daf1-4b4e-adad-cf818cd57673"?'U10001':user.id  // 'U10001' //user.id
      userId: user.id == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc" ? 'aee080f6-77f4-4c95-bbac-1748848e9a04' : user.id
      // portalTimestamp: "" //Potal Timestamp is removed from the payload
    };

    this.restApiService.getMenuByUser(params).subscribe((res) => {
      if (location.href.indexOf('permission-denied') > -1) {
        this.navigation.navigateByUrl('DPP');
      }
      let menu = res.menu;
      let navItems: any[] = [];
      Object.keys(menu).forEach((o) => {
        let menuData = menu[o];
        let item = new MenuItem().copy(<any>{
          icon: menuData.iconPath, text: menuData.displayName, subMenu: [], dropdown: false, active: menuData.active, link: menuData.resourcePath, menuData: menuData
        });
        navItems.push(item);
      });

      navItems.forEach((o) => {
        let subMenu: any[] = [];

        Object.keys(o.menuData).forEach((key) => {
          if (typeof o.menuData[key] == 'object') {
            let subMenuData = o.menuData[key];
            if (subMenuData && location.href.indexOf(subMenuData.resourcePath) > -1) {
              this.titleService.setTitle(subMenuData.pageTitle)
            }
            subMenuData && subMenu.push(new MenuItem().copy(<any>{ pageId: subMenuData.id, icon: "far fa-circle", text: subMenuData.displayName, pageTitle: subMenuData.pageTitle, subMenu: [], dropdown: false, active: subMenuData.active, link: subMenuData.resourcePath }))
          }
        });
        if (subMenu.length) {
          o.subMenu = subMenu;
        }
      });

      navItems.forEach(item => {
        sideMenu.menuItems.push(item);
      })
      this.store.sideMenu.next(sideMenu);
      this.loaderService.hide();
    }, err => {
      this.loaderService.hide();
      this.navigation.navigateByUrl('permission-denied');
    })
  }

  toggleSideMenu() {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    sideMenu.menuOpen = !sideMenu.menuOpen;
    if (!sideMenu.menuOpen) {
      sideMenu.menuItems.forEach(item => item.dropdown = false);
    }
    this.store.sideMenu.next(sideMenu);
  }

  toggleSubMenu(index: number) {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    sideMenu.menuItems.forEach((menu, i) => {
      if (i == index)
        menu.dropdown = !menu.dropdown;
      else
        menu.dropdown = false
    });
    this.store.sideMenu.next(sideMenu);
  }

  menuItemClick(index: number) {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    sideMenu.menuItems.forEach(item => item.dropdown = false);
    let selectedItem = sideMenu.menuItems[index];
    if (selectedItem.subMenu.length > 0) {
      sideMenu.menuOpen = true;
      selectedItem.dropdown = !selectedItem.dropdown;
      this.store.sideMenu.next(sideMenu);
    } else {
      sideMenu.menuOpen = false;
      sideMenu.menuItems.forEach(item => { item.dropdown = false; item.active = false });
      this.store.sideMenu.next(sideMenu);
      this.navigation.navigateByUrl(selectedItem.link);
    }
  }

  subMenuClick(i: number, j: number, openInNewTab = false) {
    let sideMenu = new SideMenu().copy(this.store.sideMenu.value);
    let selectedSubItem = sideMenu.menuItems[i].subMenu[j];

    if (openInNewTab) {
      window.open(location.origin + '/DPP/#' + selectedSubItem.link + '?pageId=' + selectedSubItem.pageId, '_blank');
    } else {
      sideMenu.menuOpen = true;
      sideMenu.menuItems.forEach(item => { item.dropdown = false; item.active = false; });
      sideMenu.menuItems.forEach(item => { item.subMenu.forEach(itm => { itm.selected = "" }) })
      sideMenu.menuItems.forEach(item => {item.subMenu.forEach(itm => { if(itm.pageId ==selectedSubItem.pageId){item.dropdown=true}}) })
      this.store.sideMenu.next(sideMenu);

      selectedSubItem["selected"] = "custom-class";
      sideMenu.menuItems[i].active = true;
      this.titleService.setTitle(selectedSubItem.pageTitle)
      this.navigation.navigateByUrl(selectedSubItem.link + '?pageId=' + selectedSubItem.pageId);
    }
  }
}
