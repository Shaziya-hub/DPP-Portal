import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { Header } from '../components/header/header';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(public store: StoreService) {
    this.getMailCount();
  }

  getMailCount() {
    let header = new Header().copy(this.store.header.value);
    header.mailCount = 253;
    this.store.header.next(header);
  }

}