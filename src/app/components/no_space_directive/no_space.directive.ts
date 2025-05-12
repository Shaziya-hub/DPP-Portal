import { Directive, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appNoSpace]'
})
export class NoSpaceDirective implements OnInit {

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {

  }

  ngOnInit(): void {

  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    } else if (event.key === ',') {
      event.preventDefault();
    }
  }

}