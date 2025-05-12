import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {

  @Input() pageConfig;
  @Input() headerConfig;
  @Input() operationsPageInfo;
  @Output() applyFiltersEvent = new EventEmitter();

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
