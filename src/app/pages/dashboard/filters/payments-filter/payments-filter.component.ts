import { DatePipe } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, OnInit, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import Chart from 'chart.js/auto'
import { PageConfig } from "src/app/model/page-config";
import { RestApiService } from "src/app/services/rest-api.service";
import { ApiPaths, constantField, deepClone, validateDate } from "src/app/shared/utils";
import { FiltersComponent } from "../filters.component";
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { LoaderService } from "src/app/services/loader.service";
import { DashboardPaymentModalService } from "../../payment-modal/payment-modal.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { NotificationService } from "src/app/services/notification.service";
import { colors, doughnutConst, doughnutData, dropdown, fonts, keyWords } from '../../../../shared/constant'
import { Title } from "@angular/platform-browser";
import { BehaviorSubject, Observable } from "rxjs";
declare var skyscanner: any;
@Component({
  selector: 'payments-filter',
  templateUrl: './payments-filter.component.html',
  styleUrls: ['./payments-filter.component.scss'],
})

export class PaymentsFilterComponent implements OnInit {
  @Input() pageConfig: PageConfig;//interface
  @Input() dashboardPageInfo; //object of getAPIInfo is passed 
  @Input() pmtGaugeData;
  @Input() pmtDoughnutData;
  @Input() pmtReportData;
  @Input() pmtCardData;
  @Input() pmtLineData;
  @Input() applyFiltersEvent = new EventEmitter();
  backgroundColor = [colors.lightGreen, colors.yellow, colors.chartBlue, colors.lightOrange, colors.pinkPurple, colors.chartBlue2, colors.grayishGreen, colors.peach]
  public google: any;


  fromdateInputFlag: boolean = true;
  todateInputFlag: boolean = true;
  reset: boolean = false;
  reset2: boolean = false
  reset3: boolean = false;
  isFromReset: boolean = false;
  isToReset: boolean = false;
  isOpen: boolean = false;
  fromDateFlag: boolean = true;
  toDateFlag: boolean = true;
  selectedList = [];
  cardData: any
  ratioData: any;
  serviceQueryParam: any;
  dashboardFlag: boolean = true;
  disabled: boolean = false;
  channelDisabled: boolean = false;
  methodDisabled: boolean = false;
  serviceDisabled: boolean = false;
  bankDisabled: boolean = false;
  lang = localStorage.getItem(keyWords.selectedLang);
  doughnutArrayDemo = [];
  zeroFlag = { chartName: '', flag: '' }
  zeroOrNoZero = new BehaviorSubject(this.zeroFlag);

  PmtStats=[
    {'statType':keyWords.channelStats},
    {'statType':keyWords.methodStats},
    {'statType':keyWords.serviceTypeStats},
    {'statType':keyWords.bankStats}
  ]

  constructor(private translate: TranslateService, public datepipe: DatePipe, public filtersComponent: FiltersComponent, private restApiService: RestApiService, private loaderService: LoaderService,
    private dashboardPaymentModalService: DashboardPaymentModalService, private router: Router, private spinner: NgxSpinnerService, private notificationService: NotificationService, private titleService: Title) { }


  searchFilters = {
    serviceId: [],
    //statType: [],
    fromDate: new Date(new Date().setHours(0, 0, 0, 0)),
    toDate: new Date(new Date().setHours(23, 59, 59, 0)),
    //  interval:'hour',

  };
  bsRangeValueFromDashBoard = []
  latestPayment;
  doughnutArray = [];
  gaugeChart: any;
  gaugeChartDisabled: boolean = false;

  htmlLegendPlugin: any
  //
  doughnutChart0: any;
  doughnutChart1: any;
  doughnutChart2: any;
  doughnutChart3: any;
  lineChart: any;
  chart: any;
  // tooltip={
  //   backgroundColor:'rgba(116, 124, 145, 0.69)',
  // }

  //gauge legend
  hideSuccess: boolean = false;
  hideFailed: boolean = false;
  successDisabled: boolean = false;
  failedDisabled: boolean = false;
  successCount = 0;
  failedCount = 0
  greenTo;
  gData = [];
  config = keyWords.config
  //errors
  reportError;
  cardError;
  gaugeError;
  doughnutError;
  lineError;

  dropdownchange: boolean = false
  bsValue
  //tooltips
  tooltips = {
    enabled: true,
    intersect: false,
    backgroundColor: colors.raven,
    rtl: this.lang == 'ar' ? true : false,
    textDirection: this.lang == 'ar' ? 'rtl' : 'ltr',
    titleFont: {
      family: fonts.frutigerLTArabic45Light,
      weight: fonts.weight300,
      size: 10
    },
    bodyFont: {
      family: fonts.frutigerLTArabicmix,
      weight: fonts.weight400,
      size: 15
    }
  }
  //datepicker
  ngOnInit(): void {
    //service calling
    setTimeout(() => {

      //this.pageConfig.listOfValues.bizServices.find(el => { this.selectedList.push(el) })
      // this.searchFilters.serviceId = this.selectedList;
      this.searchFilters.fromDate = new Date(new Date().setHours(0, 0, 0, 0));
      this.searchFilters.toDate = new Date(new Date().setHours(23, 59, 59, 0));
      this.search();

    }, 500)
  }

  onChange(event) {
    this.dropdownchange = true
  }
  dropdownSettings = {
    singleSelection: false,
    text: this.translate.instant(dropdown.allOrganizations),

  }

  //Business Service Dropdown for multiselect
  getBizServicesSetting() {
    let commonSettings = deepClone(this.dropdownSettings);
    let specificSetting = {
      singleSelection: false,
      text: this.translate.instant(dropdown.allBizService),
      primaryKey: keyWords.serviceId,
      labelKey: keyWords.serviceName,
      enableSearchFilter: true,
      badgeShowLimit: 1,
      classes: 'inputField',
      searchPlaceholderText: this.translate.instant(dropdown.search),
    }
    return Object.assign(commonSettings, specificSetting);
  }

  //change
  displayGaugeChart() {
    setTimeout(() => {
      this.gaugeChartDisabled = +this.pmtGaugeData?.ttlPmtCnt == 0 ? true : false;
      this.greenTo = ((+this.pmtGaugeData.successPmtCnt / +this.pmtGaugeData.ttlPmtCnt) * 100).toFixed(1);
      //  this.greenTo == "NaN"? this.greenTo="0":this.greenTo
      this.chart = {
        type: keyWords.gauge,
        data: [
          [keyWords.success, { v: +this.greenTo, f: this.greenTo == "NaN" ? '0' + '%' : +this.greenTo + '%' }]
        ],
        options: {
          width: 300,
          height: 235,
          greenFrom: 0,
          greenTo: this.greenTo,
          greenColor: colors.green,
          redFrom: this.greenTo,
          redTo: 100,
          redColor: colors.red,
          majorTicks: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
          minorTicks: 10,
          min: 0,
          max: 100,
          majorTickColor: colors.darkBlue,
        }
      };

    }, 200)
  }


  //custom legend document
 statsType:any=''
  displayDoughnutChart() {
    this.doughnutArray = [];
    this.pmtDoughnutData?.forEach((data, i) => {
      data.statsDetails?.forEach(stats => {
        let doughnutChartApiData = {
          chartTitle: this.PmtStats[i]?.statType, //data.name == null ? 'null' : data.name,
          name: stats.name,
          totalAmt: stats.ttlAmt,
          totalCnt: stats.ttlCnt,
        }
        this.doughnutArray.push(doughnutChartApiData);
      });
    });
    //
    let methodLabel = [];
    let methodData = [];
    let serviceTypeLabel = [];
    let serviceTypeData = [];
    let bankLabel = [];
    let bankData = [];
    let channelLabel = [];
    let channelData = [];
    this.doughnutArray.forEach(data => {
      data.chartTitle == keyWords.channelStats ? channelLabel.push(data.name == null ? 'null' : data.name) && channelData.push(data.totalAmt == null ? '0' : data.totalAmt) :
        data.chartTitle == keyWords.methodStats ? methodLabel.push(data.name == null ? 'null' : data.name) && methodData.push(data.totalAmt == null ? '0' : data.totalAmt) :
          data.chartTitle == keyWords.serviceTypeStats ? serviceTypeLabel.push(data.name == null ? 'null' : data.name) && serviceTypeData.push(data.totalAmt == null ? '0' : data.totalAmt) :
            data.chartTitle == keyWords.bankStats ? bankLabel.push(data.name == null ? 'null' : data.name) && bankData.push(data.totalAmt == null ? '0' : data.totalAmt) : ''
    })

    channelData.length == 1 && channelData[0] == "0" ? this.channelDisabled = true : this.channelDisabled = false;
    methodData.length == 1 && methodData[0] == '0' ? this.methodDisabled = true : this.methodDisabled = false;
    serviceTypeData.length == 1 && serviceTypeData[0] == "0" ? this.serviceDisabled = true : this.serviceDisabled = false;
    bankData.length == 1 && bankData[0] == "0" ? this.bankDisabled = true : this.bankDisabled = false;
    this.tooltips.enabled = true
    const options: any = {
      reponsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false,
        },
        // tooltip:this.tooltip,
        tooltip: this.tooltips,
      }
    }

    let zeroCharData = {
      id: keyWords.customPluginName,
      beforeInit: function (chart) {
        if (chart.config.type == keyWords.doughnut) {
          var data = chart.data.datasets[0].data;
          var isAllZero = data.reduce((a, b) => +a + +b) > 0 ? false : true;
          if (!isAllZero) return;
          // when all data values are zero...
          chart.data.datasets[0].data = data.map((e, i) => i > 0 ? 0 : 1); //add one segment
          chart.data.datasets[0].backgroundColor = colors.grayish; //change bg color
          chart.data.datasets[0].borderWidth = 0; //no border
          chart.options.plugins.tooltip.enabled = false; //disable tooltips
          //chart.options.plugins.legend.onClick = null; //disable legend click
        }

      }
    }

    //
    setTimeout(() => {
      let channelDataDemo = ['0']
      this.doughnutChart0 != null ? this.doughnutChart0.destroy() : '';
      this.doughnutChart0 = new Chart(<HTMLCanvasElement>document.getElementById(keyWords.chart0), {
        type: 'doughnut',
        data: {
          labels: channelLabel,
          datasets: [{
            data: channelData.length == 0 ? channelDataDemo : channelData,
            backgroundColor: this.backgroundColor
          }]
        },
        options,
        plugins: [zeroCharData]
      })
      let methodDataDemo = ['0']
      this.doughnutChart1 != null ? this.doughnutChart1.destroy() : '';
      this.doughnutChart1 = new Chart(<HTMLCanvasElement>document.getElementById(keyWords.chart1), {
        type: 'doughnut',
        data: {
          labels: methodLabel,
          datasets: [{
            data: methodData.length == 0 ? methodDataDemo : methodData,
            backgroundColor: this.backgroundColor
          }]
        },
        options,
        plugins: [zeroCharData]
      })
      let serviceData = ['0']
      let servicelabel = 'Demo'
      this.doughnutChart2 != null ? this.doughnutChart2.destroy() : '';
      this.doughnutChart2 = new Chart(<HTMLCanvasElement>document.getElementById(keyWords.chart2), {
        type: 'doughnut',
        data: {
          labels: serviceTypeLabel,
          datasets: [{
            data: serviceTypeData.length == 0 ? serviceData : serviceTypeData,
            backgroundColor: this.backgroundColor
          }]
        },
        options,
        plugins: [zeroCharData]
      })
      let bankDataDemo = ['0']
      this.doughnutChart3 != null ? this.doughnutChart3.destroy() : '';
      this.doughnutChart3 = new Chart(<HTMLCanvasElement>document.getElementById(keyWords.chart3), {
        type: 'doughnut',
        data: {
          labels: bankLabel,
          datasets: [{
            data: bankData.length == 0 ? bankDataDemo : bankData,
            backgroundColor: this.backgroundColor
          }]
        },
        options,
        plugins: [zeroCharData]
      })
    }, 500)

  }


  //
  displayLineChart() {
    let labels = []
    let lineData = []
    this.pmtLineData.forEach(element => {
      labels.push(element.intervalStart);
      lineData.push(element.ttlPmtCnt);
    })
    setTimeout(() => {
      this.lineChart != null ? this.lineChart.destroy() : '';
      this.lineChart = new Chart(<HTMLCanvasElement>document.getElementById(keyWords.lineChart), {
        type: 'line',
        data: {
          labels: labels.reverse(),
          datasets: [{
            label: this.translate.instant(keyWords.payments),
            data: lineData.reverse(),
            backgroundColor: colors.lightBlue,
            borderColor: colors.lightBlueB,
            borderCapStyle: 'butt',
            borderJoinStyle: 'miter',
            borderWidth: 2,
            pointBorderColor: colors.lightBlueB,
            pointBackgroundColor: colors.white,
            pointBorderWidth: 2,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.darkBlue,
            pointHoverBorderColor: colors.darkBlue,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            fill: true
          }]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          // interaction: {
          //   mode: 'index',
          //   intersect: true,
          // },
          scales: {
            x: {
              reverse: true,
              offset: true,
              border: {
                display: false
              },
              grid: {
                display: false,
              },
              ticks: {
                color: colors.darkBlue,
                font: {
                  family: fonts.roboto,
                  size: 12,
                  weight: fonts.weight400,
                }
              }
            },
            y: {
              border: {
                display: false,
              },
              ticks: {
                color: colors.darkBlue,
                font: {
                  family: fonts.roboto,
                  size: 12,
                  weight: fonts.weight400,
                }
              },
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              color: colors.gray20,
              font: {
                size: 12,
                weight: 400,
                family: fonts.roboto,
              },
              align: 'end',
            },
            tooltip: this.tooltips
          }
        },
        plugins: [ChartDataLabels]
      })
    }, 200)
  }
  morePayment() {
    this.titleService.setTitle(keyWords.dashboardPmtRedirect)
    this.router.navigate([keyWords.paymentUrl], { queryParams: { pageId: keyWords.rES002 }, state: { serviceId: this.serviceQueryParam, fromDate: this.searchFilters.fromDate, toDate: this.searchFilters.toDate, dashboardFlag: this.dashboardFlag } })
  }
  onClose(event) {
    this.dropdownchange ? this.search() : ''
    this.dropdownchange = false;
  }
  customDate(_event, buttonName: any) {
    let lang = localStorage.getItem(keyWords.selectedLang);
    let self = this
    var el = document.querySelectorAll<HTMLElement>('.filter .col-md-3');
    for (let i = 0; i < el.length; i++) {

      el[i].onclick = function () {
        var c = 0;
        while (c < el.length) {
          el[c++].children[0].className = 'date-link';
        }
        if (lang == 'en') {
          el[i].children[0].innerHTML == keyWords.today ? el[i].children[0].className = 'today-btn' : el[i].children[0].className = 'today-btn marginLeft0';
        }
        else if (lang == 'ar') {
          el[i].children[0].innerHTML == self.translate.instant(keyWords.today) ? el[i].children[0].className = 'today-btn marginRight10' : el[i].children[0].innerHTML == self.translate.instant(keyWords.thisMonth) ? el[i].children[0].className = 'today-btn marginRight0' : el[i].children[0].className = 'today-btn'
        }

      };
    }

    var curr = new Date();
    if (buttonName == keyWords.today) {
      this.searchFilters.fromDate = new Date(curr.setHours(0, 0, 0, 0));
      this.searchFilters.toDate = new Date(curr.setHours(23, 59, 59, 0));
      this.bsRangeValueFromDashBoard = []
    }
    else if (buttonName == keyWords.yesterday) {
      this.searchFilters.fromDate = new Date(curr.setHours(0, 0, 0, 0));
      this.searchFilters.fromDate.setDate(this.searchFilters.fromDate.getDate() - 1);
      this.searchFilters.toDate = new Date(this.searchFilters.fromDate)
      this.searchFilters.toDate.setHours(23, 59, 59, 0);
      this.bsRangeValueFromDashBoard = []
      //this.searchFilters.interval = 'hour';
    }
    else if (buttonName == keyWords.thisWeek) {
      var firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));
      this.searchFilters.fromDate = new Date(firstDay);
      this.searchFilters.fromDate.setHours(0, 0, 0, 0);
      this.searchFilters.toDate = new Date();
      this.searchFilters.toDate.setHours(23, 59, 59, 0);
      this.bsRangeValueFromDashBoard = []
    }
    else if (buttonName == keyWords.thisMonth) {
      this.searchFilters.fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
      this.searchFilters.toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      // this.searchFilters.interval = 'day';
      this.searchFilters.toDate.setHours(23, 59, 59, 0);
      this.bsRangeValueFromDashBoard = []
    }
    this.search()
  }

  search() {
    let preparedFilters = deepClone(this.searchFilters);
    let preparedFilter2;
    Object.keys(preparedFilters).forEach(o => {
      let obj = preparedFilters[o];

      if (Array.isArray(obj)) {
        preparedFilters[o] = obj.map(d => o == 'organizationId' ? d['orgId'] : d[o] || d['name']);
      }
      if (o.indexOf('Date') > -1) {
        let now = new Date(preparedFilters[o]);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        preparedFilters[o] = now.toISOString().substring(0, 19);
      }
    })

    this.getUpdatedValuesForAllSelections(preparedFilters)
    this.serviceQueryParam = preparedFilters.serviceId;
    //let statType={statType:[ keyWords.channel,keyWords.method,keyWords.serviceType,keyWords.bank]};
    //  preparedFilter2 = {...preparedFilters,...statType}
    // this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });


    this.spinner.show(keyWords.gaugeCardSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getPmtRatio, { SearchFilters: preparedFilters }, this.config).subscribe((pmtRatioData) => {
      this.pmtGaugeData = pmtRatioData?.PmtRatio;
      this.pmtGaugeData != undefined ? this.displayGaugeChart() : ''
      this.spinner.hide(keyWords.gaugeCardSpinner)
    },
      (err) => {
        this.spinner.hide(keyWords.gaugeCardSpinner);
        this.pmtGaugeData = '{}';
        this.gaugeError = err;
      }
    );

    this.spinner.show(keyWords.pmtDoughnutSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getPmtStats, { SearchFilters: preparedFilters }, this.config).subscribe((pmtStastData) => {
      let statArray = []
      pmtStastData?.PmtStats.forEach(stat=>{
        if (stat.statType === "Channel") {
          this.statsType = stat.statType
          statArray.splice(0, 0, stat);
          
         }else if(stat.statType === "Method"){
          this.statsType = stat.statType
          statArray.splice(1, 0, stat);
          
         } else if(stat.statType === "ServiceType"){
          this.statsType = stat.statType
          statArray.splice(2, 0, stat);
         }else if(stat.statType === "Bank"){
          this.statsType = stat.statType
          statArray.splice(3, 0, stat);
        }
       
      })
      this.pmtDoughnutData = statArray//pmtStastData?.PmtStats;
      this.pmtDoughnutData != undefined ? this.displayDoughnutChart() : '';
      this.spinner.hide(keyWords.pmtDoughnutSpinner)
    },
      (err) => {
        this.pmtDoughnutData = null;
        this.spinner.hide(keyWords.pmtDoughnutSpinner)
        this.doughnutError = err;
      }
    );

    this.spinner.show(keyWords.pmtReportSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getLatestPmts, { SearchFilters: preparedFilters }, this.config).subscribe((latestPmtsData) => {
      this.pmtReportData = latestPmtsData?.LatestPmts.slice(-5);
      // this.pmtReportData != undefined ?  this.spinner.hide('pmtReportSpinner'):''
      this.spinner.hide(keyWords.pmtReportSpinner)
    },
      (err) => {
        this.pmtReportData = '{}';
        this.spinner.hide(keyWords.pmtReportSpinner)
        this.reportError = err;
      }
    );

    this.spinner.show(keyWords.pmtCardSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getPmtAddtnlStats, { SearchFilters: preparedFilters }, this.config).subscribe((pmtAddnlStatsData) => {
      this.pmtCardData = pmtAddnlStatsData?.CardsRs;
      // this.pmtCardData != undefined ?  this.spinner.hide('pmtCardSpinner'):''
      this.spinner.hide(keyWords.pmtCardSpinner);
    },
      (err) => {
        this.pmtCardData = '{}';
        this.spinner.hide(keyWords.pmtCardSpinner);
        this.pmtCardData = null
        this.cardError = err;
      }
    );

    this.spinner.show(keyWords.pmtLineSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getPmtFrequency, { SearchFilters: preparedFilters }, this.config).subscribe((frequency) => {
      this.pmtLineData = frequency?.PmtFrequency;
      this.pmtLineData != undefined ? this.displayLineChart() : ''
      // this.pmtLineData != undefined ?  this.spinner.hide('pmtLineSpinner'):''
      this.spinner.hide(keyWords.pmtLineSpinner)
    },
      (err) => {
        this.spinner.hide(keyWords.pmtLineSpinner);
        this.pmtLineData = null;
        this.lineError = err;
      }
    );
  }
  getUpdatedValuesForAllSelections(preparedFilters) {
    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
  }
  openModal(chartId, chartHeading) {

    let chart = chartId == keyWords.chart0 ? this.doughnutChart0 : chartId == keyWords.chart1 ? this.doughnutChart1 : chartId == keyWords.chart2 ? this.doughnutChart2 :
      chartId == keyWords.chart3 ? this.doughnutChart3 : chartId == keyWords.lineChart ? this.lineChart : chartId == keyWords.googleChart ? this.pmtGaugeData : ''
      chartHeading== keyWords.channelStats ? this.statsType = 'Channel' : chartHeading == keyWords.methodStats ? this.statsType = 'Method' : chartHeading == keyWords.serviceTypeStats ? this.statsType = 'ServiceType' : chartHeading == keyWords.bankStats ? this.statsType = 'Bank' : ''
      
    this.dashboardPaymentModalService.open(chartId, chart, chartHeading, this.pmtDoughnutData, this.doughnutArray, this.statsType)
  }


  //datepicket
  dateRangeChange(rangedate) {
    if (rangedate != undefined && rangedate != null && rangedate.length != 0) {
      this.searchFilters.fromDate = rangedate[0];
      this.searchFilters.fromDate.setHours(0, 0, 0, 0)
      let toDate: any = this.datepipe.transform(rangedate[1], keyWords.todateF)
      this.searchFilters.toDate = toDate;
      let div = document.querySelector('.today-btn');
      div != undefined && div != null ? div.classList.remove('today-btn') : '';
      div != undefined && div != null ? div.classList.add('date-link') : ''
      let filter = {
        "SearchFilters": {
          fromDate: this.searchFilters.fromDate,
          toDate: this.searchFilters.toDate
        }
      }
      if (this.searchFilters.fromDate && this.searchFilters.toDate) {

        let days = validateDate(filter, this.searchFilters.fromDate, this.searchFilters.toDate, this.datepipe) + 1;
        if (days != null && days > +this.pageConfig?.customParams?.SearchDateRange) {
          /*
          text message for date range was not correct days was supposed to be in string format
          */
          this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + ' days'));
          return;
        }
        this.search();
      }

    }
  }
  removeDuplicatesColumns(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }
}




