import { Directive, EventEmitter, HostListener, OnDestroy, Output } from "@angular/core";

@Directive({
    selector: '[appDoubleClick]'
})

export class HandlingClicksDirective implements OnDestroy {

    @Output() singleClick = new EventEmitter();
    @Output() doubleClick = new EventEmitter();
    timer;
    stopClick: boolean

    @HostListener('click', ['$event']) onClick(e) {
        this.timer = 0;
        this.stopClick = false;
        const delay = 100;

        this.timer = setTimeout(() => {
            if (!this.stopClick) {
                this.singleClick.emit(e);
            }
        }, delay);

    }

    @HostListener('dblclick', ['$event']) onDBLClick(e) {
        this.stopClick = true;
        clearTimeout(this.timer);
        this.doubleClick.emit(e);

    }

    ngOnDestroy(): void {

    }
}