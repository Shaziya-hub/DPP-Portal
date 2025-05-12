import { Component, Input, OnInit, Output, EventEmitter, NgModule } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Console } from 'console';
import * as _ from 'lodash';
import { AppComponent } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { mobileCheck } from '../../shared/utils';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']

})

export class PaginationComponent implements OnInit {
  @Input() totalItems: number = 0;
  @Input() page = 1;
  @Input() pageSize: number;
  @Input() ttlPagesCnt: any;
  @Input() responseCount: any
  @Input() inboxRefunds
  @Output() pageChange: EventEmitter<any>;
  showBoundaryLinks: boolean = true;
  maxSize = 5;
  totalcntDrop: number[] = []
  //calculateTotal:number;
  isDropup = true;
  constructor(private translate: TranslateService) {
    this.pageChange = new EventEmitter<any>();
  }

  showingStr = this.translate.instant("Showing");
  entries = this.translate.instant("entries out of");
  first = this.translate.instant("First")
  last = this.translate.instant("Last");
  totalCountDrop = 0;
  ngOnInit(): void {
    this.showBoundaryLinks = !mobileCheck();
    !this.showBoundaryLinks && (this.maxSize = 3);

  }

  //this.updateDropdownCnt(this.totalItems,this.pageSize)
  ngOnChanges() { //console.log("totalItems changes",this.totalItems)
    this.totalCountDrop = this.totalItems;

    if (this.totalItems != null && this.totalItems != undefined && this.totalItems != 0 && this.pageSize != null && this.pageSize != undefined && this.pageSize != 0) {
      let ltotalcntDrop = new Array(Math.ceil(this.totalItems / this.pageSize));
      // console.log("Array size:",this.totalcntDrop.length);
      for (var i = 1; i < ltotalcntDrop.length + 1; i++) {
        // console.log(i);
        this.totalcntDrop.push(i);

      }
    }

    this.updateDropdownCnt(this.totalItems, this.pageSize)
  }


  updateDropdownCnt(totalItem, pageSize) {
    this.totalcntDrop = []
    this.totalCountDrop = totalItem;
    let ltotalcntDrop = new Array(Math.ceil(totalItem / pageSize));
    for (var i = 1; i < ltotalcntDrop.length + 1; i++) {
      // console.log(i);
      this.totalcntDrop.push(i);

    }
  }
  changeDropdown(page) {
    //console.log(page);
    this.setPage(page)
  }
  setPage(page) {

    if (page < 1 || page > Math.ceil(this.totalItems / this.pageSize)) {
      return;
    } else {
      this.pageChange.emit(String(page));
    }
  }
  // setPage(page) {
  //   if (page < 1 || page > Math.ceil(this.totalItems / this.pageSize)) {
  //     return;
  //   } else {
  //     this.pageChange.emit(String(page));
  //   }
  // }
}

