import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, ChangeDetectorRef, AfterViewInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
//import { DateTime } from './Datetime';
import { DatePipe } from '@angular/common';
import { BsDatepickerDirective, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { event } from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { keyWords } from 'src/app/shared/constant';
import { arLocale, defineLocale, listLocales } from 'ngx-bootstrap/chronos';

@Component({
  //changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dateTimepicker',
  templateUrl: './dateTimepicker.component.html',
  styleUrls: ['dateTimepicker.component.scss'],

})
export class DateTimepickerComponent implements OnInit, OnDestroy {

  @Output() public selectedDate: EventEmitter<any>;
  @Output() public dateSelected: EventEmitter<any>;
  @Output() public dateRange: EventEmitter<any>;
  @ViewChild(BsDatepickerDirective, { static: false })
  datepicker?: BsDatepickerDirective;
  private _picker: BsDatepickerDirective;
  @Input() public bsConfig
  @Input() public toDateFlag;
  @Input() public fromDateFlag;
  @Input() public dateFlag;
  @Input() public fromdateInputFlag;
  @Input() public reconciliationFlag;
  @Input() public settlementFlag;
  @Input() public todateInputFlag;
  @Input() public value;
  @Input() public value2;
  @Input() public reset;
  @Input() public reset2;
  @Input() public reset3;
  @Input() public monthly;
  @Input() public placeholder;
  @Input() public minDate: any = new Date();
  @Input() public merchantFlag;
  @Input() public toPickerDisplay;
  @Input() public fromPickerDisplay;
  @Input() public monthDisplay;
  @Input() public dashboardFlag;
  @Input() logVal;
  @Input() searchFilter: any;
  @Input() bsdateRange;
  @Input() gridFlag;
  @Input() public bsRangeValueFromDashBoard;
  @Input() public landingDateRange
  @Input() public generateInvoiceFlag
  //Daterange
  bsRangeValue: Date[];
  bsStartDateValue: any = new Date(new Date().setHours(0, 0, 0, 0));
  bsEndDateValue: any = new Date(new Date().setHours(23, 59, 59, 999));
  bsStartTime: any = new Date(new Date().setHours(0, 0, 0, 0));
  bsEndTime: any = new Date(new Date().setHours(23, 59, 59, 999));
  bsRangeTime: any = [];

  time = { hour: 13, minute: 30 };

  myStartDateValue: any = new Date(new Date().setHours(0, 0, 0, 0));
  myEndDateValue: any = new Date(new Date().setHours(23, 59, 59, 999));
  myStartTime: any = new Date(new Date().setHours(0, 0, 0, 0));
  myEndTime: any = new Date(new Date().setHours(23, 59, 59, 999));
  public timepickerClose: boolean = true;
  setPlaceHolder: any
  hoursPlaceholder = 'hh';
  minutesPlaceholder = 'mm';
  myDateValue = null;
  minMaxDate: any = new Date();
  datee: any = new Date()
  date: any = new Date(new Date().setHours(0, 0, 0, 0));
  date2: any = new Date(new Date().setHours(23, 59, 59, 999));
  timeVisible: boolean = false;
  isOpen = false;
  date3: any = new Date(new Date().setHours(0, 0, 0, 0));
  date4 = null;
  customDateRange = []
  customstartDate: any = new Date(new Date().setHours(0, 0, 0, 0));
  maxDate: any = new Date()

  customButtonsSubscription: Subscription;
  customButtons;
  lang = localStorage.getItem('selectedLang');
  monthsFull: any = [{ name: 'january', value: 'يناير' }, { name: 'february', value: 'فبراير' }, { name: 'march', value: 'مارس' }, { name: 'april', value: 'إبريل' }, { name: 'may', value: 'مايو' }, { name: 'june', value: 'يونيو' }, { name: 'july', value: 'يوليو' }, { name: 'august', value: 'أغسطس' }, { name: 'september', value: 'سبتمبر' }, { name: 'october', value: 'أكتوبر' }, { name: 'november', value: 'نوفمبر' }, { name: 'december', value: 'ديسمبر' }];
  monthsShort: any = [{ name: 'Jan', value: 'يناير' }, { name: 'Feb', value: 'فبراير' }, { name: 'Mar', value: 'مارس' }, { name: 'Apr', value: 'إبريل' }, { name: 'May', value: 'مايو' }, { name: 'Jun', value: 'يونيو' }, { name: 'Jul', value: 'يوليو' }, { name: 'Aug', value: 'أغسطس' }, { name: 'Sep', value: 'سبتمبر' }, { name: 'Oct', value: 'أكتوبر' }, { name: 'Nov', value: 'نوفمبر' }, { name: 'Dec', value: 'ديسمبر' }];
  weekdaysShort: any = [{ name: 'Sun', value: 'الأحد' }, { name: 'Sat', value: 'السبت' }, { name: 'Fri', value: 'الجمعه' }, { name: 'Thu', value: 'الخميس' }, { name: 'Wed', value: 'الأربعاء' }, { name: 'Tue', value: 'الثلاثاء' }, { name: 'Mon', value: 'الأثنين' }];
  constructor(private cdr: ChangeDetectorRef, public datepipe: DatePipe, private localeService: BsLocaleService, private translate: TranslateService) {
    this.selectedDate = new EventEmitter<any>();
    this.dateSelected = new EventEmitter<any>();

    //DateRange
    this.dateRange = new EventEmitter<any>();
  }


  // locale = 'en';
  //   locales = listLocales();
  checklanding = false;
  ngOnInit(): void {
    // this.localeService.use(this.locale);
    this.bsStartDateValue = new Date(new Date());
    this.bsEndDateValue = new Date(new Date());
    this.checklanding = true
    if (this.landingDateRange != null && this.landingDateRange != '' && this.landingDateRange != undefined) {
      this.bsStartDateValue.setMinutes(this.bsStartDateValue.getMinutes() - this.landingDateRange)
    }

    this.bsRangeValue = [this.bsStartDateValue, this.bsEndDateValue];
    this.bsdateRange
    //DateRangePicker
    if (this.logVal == keyWords.backFromLogger) {
      let bsStartDateValue2 = new Date(this.searchFilter[0].fromDate)
      let bsEndDateValue2 = new Date(this.searchFilter[0].toDate)
      this.bsdateRange = [bsStartDateValue2, bsEndDateValue2]
      this.bsRangeValue = [bsStartDateValue2, bsEndDateValue2];
    }
    if (this.gridFlag) {
      let bsStartDateValue2 = new Date(this.searchFilter.fromDate)
      let bsEndDateValue2 = new Date(this.searchFilter.toDate)
      this.bsdateRange = [bsStartDateValue2, bsEndDateValue2]
      this.bsRangeValue = [bsStartDateValue2, bsEndDateValue2];
      // console.log("Datepicker", this.bsdateRange)
    }
    this.bsEndDateValue.setDate(this.bsEndDateValue.getDate());

    this.isOpen = false;
    this.timeVisible = false;
    this.myStartDateValue = new Date(new Date().setHours(0, 0, 0, 0));
    this.myEndDateValue = new Date(new Date().setHours(23, 59, 59, 999));
    if (this.settlementFlag) {
      this.setPlaceHolder = this.monthly == true ? 'MM/YYYY' : 'MM/DD/YYYY'
    } else {
      this.setPlaceHolder = this.monthly == false ? 'MM/YYYY' : 'MM/DD/YYYY'
    }

    this.myDateValue = null;
    this.minDate = new Date();
    this.minMaxDate = new Date();

    if (this.generateInvoiceFlag == true) {
      this.minMaxDate.setDate(this.minMaxDate.getFullYear())
      this.minDate.setDate(this.minDate.getDate()+1)//disable today date for generate invioce
    } else {
      this.minDate.setFullYear(this.minDate.getFullYear() - 18);
      this.minMaxDate.setDate(this.minMaxDate.getDate())
    }


  }

  onValueChange(value: any) {
    this.bsConfig.dateInputFormat = 'MM/DD/YYYY, HH:mm'
    this.selectedDate.emit(value);
    this.fromDateFlag = false;
  }

  dateRangeChange(value: any) {
    this.checklanding = false
    this.bsConfig.dateInputFormat = 'MM/DD/YYYY, HH:mm'
    this.dateRange.emit(value);
  }


  onClickedOutside() {
    this.timeVisible = false;
  }


  showDate(event) {
    this.timeVisible = false;
    this.isOpen = true;
  }


  ngAfterViewChecked() {
    //your code to update the model
    this.cdr.detectChanges();
    if (this.lang == 'ar') {
      this.setDatepickerLanguage()
    }
  }


  onChangedate(val: Date) {
    this.dateSelected.emit(val);
    this.fromDateFlag = false;
    this.dateFlag = false;
    this.toDateFlag = false;
  }


  changed(): void {

  }


  circulateEvent(e) {
    switch (e.target.id) {
      case 'dpTodayButton':
        this.setDate();
        break;

      case 'dpResetButton':
        this.resetButton();
        break;

      case 'dpTimeButton':
        this.timeButton();
        break;

      case 'dpCloseButton':
        this.hideDatePicker(event);
        this.isOpen = false;
        this.timeVisible = false;;
        break;
    }
  }



  setDate() {
    //DateRangePicker
    this.bsStartDateValue = new Date(new Date().setHours(0, 0, 0, 0));
    this.bsEndDateValue = new Date(new Date().setHours(23, 59, 59, 999));

    this.myStartDateValue = new Date(new Date().setHours(0, 0, 0, 0));
    this.myEndDateValue = new Date(new Date().setHours(23, 59, 59, 999));
    this.myDateValue = new Date();
    this.date = new Date(new Date().setHours(0, 0, 0, 0));
    this.date2 = new Date(new Date().setHours(23, 59, 59, 999));
    this.bsRangeValue = [this.myStartDateValue, this.myEndDateValue];
    this.isOpen = false;
  }


  hideDatePicker(event) {
    let d = document.querySelector('bs-datepicker-container');
    if (d) {
      d.remove();
    }
  }

  timeButton() {
    this.timeVisible = true;
    this.isOpen = false;
  }

  resetButton() {

    //DateRangePicker
    this.bsStartDateValue = new Date(new Date().setHours(0, 0, 0, 0));
    this.bsEndDateValue = new Date(new Date().setHours(23, 59, 59, 999));


    this.myStartDateValue = new Date(new Date().setHours(0, 0, 0, 0));
    this.myEndDateValue = new Date(new Date().setHours(23, 59, 59, 999));
    this.date = new Date(new Date().setHours(0, 0, 0, 0));
    this.date2 = new Date(new Date().setHours(23, 59, 59, 999));
    this.bsRangeValue = [this.myStartDateValue, this.myEndDateValue];
    this.myDateValue = null;
    this.isOpen = false;
  }


  clear() {
    this.myStartTime = null;
    this.myEndTime = null;
  }


  now() {
    let time = new Date();
    this.myStartTime = time;
    this.myEndTime = time;
  }


  close(event) {
    this.timeVisible = false;
  }


  ngOnDestroy(): void {
    if (this.customButtonsSubscription) {
      this.customButtonsSubscription.unsubscribe();
    }
  }


  loadCal() {
    this.hideDatePicker(event);
    //this.handler("");
  }

  setDatepickerLanguage() {
    //setTimeout(()=>{
    //head
    let doc = document.querySelector('.bs-datepicker-container')
    let head = doc != null ? doc.querySelectorAll('.bs-datepicker-head') : null

    if (head != null && head != undefined) {
      let button = head != null ? head[0]?.querySelectorAll("button") : null;
      let button2 = head != null ? head[1]?.querySelectorAll("button") : null;
      let month = button != null ? button[1]?.innerText : null;
      let month2 = button2 != null ? button2[1]?.innerText : null;
      this.monthsFull.forEach(el => {
        el.name == month?.toLowerCase() ? button[1].innerText = el.value : null;
        el.name == month2?.toLowerCase() ? button2[1].innerText = el.value : null
      })
    }
    //body
    let tdMonthspan
    let body = doc != null ? doc.querySelectorAll('.bs-datepicker-body') : null

    body != null ? body.forEach((body) => {
      let table = body != null ? body.querySelector('table') : null
      let monthClass = table != null ? table.classList.contains('months') : null;
      let weekCkass = table != null ? table.classList.contains('days') : null;
      if (monthClass == true) {
        let tData: any = table != null ? table.querySelectorAll('td') : null;
        for (let demo of tData) {
          let tdMonthSpan = demo != null ? demo.querySelector('span') : null
          let tdMonthName = tdMonthSpan != null ? tdMonthSpan.innerText : null
          this.monthsShort.forEach(el => {
            el.name == tdMonthName ? tdMonthSpan.innerText = el.value : ''
          })
        }
      }
      else if (weekCkass == true) {
        let th = table != null ? table.querySelectorAll('th') : null;
        th.forEach(thElement => {
          this.weekdaysShort.forEach(el => {
            el.name == thElement.innerText ? thElement.innerText = el.value : ''
          })
        })

      }
      //timepicker
      var timeContainer = document.querySelectorAll('timepicker')
      timeContainer != null ? timeContainer.forEach(time => {
        let button = time.querySelector('button');
        button.innerText = this.translate.instant(button.innerText)


      }) : ''

    }) : ''
  }
}

