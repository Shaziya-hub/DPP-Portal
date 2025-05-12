import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',


})

export class FiltersComponent implements OnInit {
  @Input() pageConfig;
  @Input() dataSource
  @Input() headerConfig;
  @Input() reportPageInfo;
  @Output() applyFiltersEvent = new EventEmitter();
  @Input() url;
  @Output() selectedValue = new EventEmitter();
  @Output() selectedFromDate: EventEmitter<any> = new EventEmitter();
  @Output() selectedToDate: EventEmitter<any> = new EventEmitter();
  @Input() pageConfig2
  //pageConfig2 = null;


  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    setTimeout(() => {
      let ele = document.getElementById('main-content');
      ele.addEventListener("scroll", () => {
        this.scrollHandler();
      });
    }, 1000);
  }
  fadeOutOnScroll(element) {
    if (!element) {
      return;
    }

    var distanceToTop = window.pageYOffset + element.getBoundingClientRect().top;
    var elementHeight = element.offsetHeight;
    var scrollTop = document.documentElement.scrollTop;

    var opacity = 1;

    if (scrollTop > distanceToTop) {
      opacity = 0.7 - (scrollTop - distanceToTop) / elementHeight;
    }

    if (opacity >= 0) {
      element.style.opacity = opacity;
    }
  }

  scrollHandler() {
    var header = document.getElementById('filter-section');
    this.fadeOutOnScroll(header);
  }



  onUrlChange(pageAPIInfo: any) {
    this.selectedValue.emit(pageAPIInfo)
  }

  bsValueChange(data: any) {
    this.selectedFromDate.emit(data)
  }
  onMonthlyChange(data2: any) {
    this.selectedToDate.emit(data2)
  }




}