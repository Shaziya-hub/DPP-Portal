import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(public router: Router) { }

  navigateByUrl(url: string) {
    this.router.navigateByUrl(url);
  }
}
