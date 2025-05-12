import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Input() pageConfig;
  @Input() headerConfig;
  @Input() transactionsPageInfo;
  @Input() dataSource;
  @Input() cardAttriute;
  @Input() transactionId;
  @Input() logVal;
  @Input() searchFilter;
  @Input() actionKey
  @Input() cardServiceAttribute
  @Input() cardsUrl


  @Output() applyFiltersEvent = new EventEmitter();
  @Output() applyPmtCards = new EventEmitter();

  pageAPIInfo;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      let ele = document.getElementById('main-content');
      ele.addEventListener("scroll", () => {
        this.scrollHandler();
      });
    }, 1000);
  }

  pmtCards(cardsUrl) {
    this.cardsUrl = cardsUrl
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

}
