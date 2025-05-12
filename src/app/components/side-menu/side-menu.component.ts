import { Component, Input, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/services/side-menu.service';
import { StoreService } from 'src/app/services/store.service';
import { DownloadManagerService } from '../download-manager/download-manager.service';
import { SideMenu } from './side-menu';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

  public sideMenu: any = SideMenu;
  public user: any;
  @Input() menuOpen
  constructor(
    public store: StoreService,
    public sideMenuService: SideMenuService,
    public downloadManagerService: DownloadManagerService
  ) {
    this.store.sideMenu.subscribe(sideMenu => {
      this.sideMenu = sideMenu;
    });
  }

  ngOnInit() {
  }

  toggleSubMenu(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.sideMenuService.toggleSubMenu(index);
  }

  menuItemClick(index: number) {
    this.sideMenuService.menuItemClick(index);
  }
  subMenuClick(event, i: number, j: number) {
    event.stopPropagation();
    if (event.target.nodeName == 'DIV')
      this.sideMenuService.subMenuClick(i, j);
  }

  downloadManagerClick() {
    this.downloadManagerService.isDownloading = false;
    this.downloadManagerService.open();
  }


  //preparing context menu on sub menu link right click
  onRightClick(e, i: number, j: number) {
    if (this.menuOpen == true) {
      let test = document.querySelectorAll<HTMLElement>('.side-menu-base')[0].style.overflow = 'visible';
      // console.log('test', test)
      e.preventDefault()
      let menu = document.getElementById('ctxmenu');
      if (menu) {
        // console.log('menu', menu)
        menu.parentElement.removeChild(menu)
        //document.getElementsByClassName('side-menu-base')[0].style.overflow='visible';


      }

      menu = document.createElement("div");
      menu.classList.add('ctxmenu')
      menu.id = "ctxmenu";
      menu.style.top = (e.pageY - 10) + 'px';
      menu.style.left = (e.pageX - 40) + 'px';
      menu.onmouseleave = () => menu.parentElement.removeChild(menu)
      document.body.onclick = () => menu.parentElement.removeChild(menu)
      document.querySelectorAll<HTMLElement>('.side-menu-base')[0].onclick = () => menu.parentElement.removeChild(menu)
      document.querySelectorAll<HTMLElement>('.item-text')[0].onclick = () => menu.parentElement.removeChild(menu)
      menu.onmouseleave = () => document.querySelectorAll<HTMLElement>('.side-menu-base')[0].style.overflowY = 'auto'

      document.querySelectorAll<HTMLElement>('.side-menu-base')[0].onclick = () => document.querySelectorAll<HTMLElement>('.side-menu-base')[0].style.overflowY = 'auto'
      let p = document.createElement('p');
      p.onclick = () => {
        this.sideMenuService.subMenuClick(i, j, true);
      };
      p.innerText = 'Open link in new tab';
      menu.append(p);
      e.target.parentElement.appendChild(menu);
    }

  }
}
