import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Header } from '../components/header/header';
import { SideMenu } from '../components/side-menu/side-menu';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public header = new BehaviorSubject<Header>(new Header());

  public sideMenu = new BehaviorSubject<SideMenu>(new SideMenu());

  public user = new BehaviorSubject<User>(new User());

  public selectableColumns = new Subject<any[]>();

  public selectableColumnsDetails = new Subject<any[]>();

  public pageConfigServiceCall = new BehaviorSubject(false);
  public roleId = new BehaviorSubject(false)
}
