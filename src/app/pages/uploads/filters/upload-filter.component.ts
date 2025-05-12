import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: 'upload-filter',
  templateUrl: './upload-filter.component.html',
  styleUrls: ['./upload-filter.component.scss']

})
export class UploadFilterComponent implements OnInit {

  @Input() pageConfig;
  @Input() headerConfig;
  @Input() uploadsPageInfo;
  @Input() dataSource;
  @Output() applyFiltersEvent = new EventEmitter();

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