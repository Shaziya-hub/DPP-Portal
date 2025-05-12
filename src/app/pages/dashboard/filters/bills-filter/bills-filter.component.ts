import { Component, ElementRef, EventEmitter, Input, ViewChild } from "@angular/core";
import { Chart } from "chart.js";
import { RestApiService } from "src/app/services/rest-api.service";
import { ApiPaths, commify, constantField, deepClone, validateDate } from "src/app/shared/utils";
import { DashboardPaymentModalService } from "../../payment-modal/payment-modal.service";
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { FiltersComponent } from "../filters.component";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { range } from "lodash";
import { NotificationService } from "src/app/services/notification.service";
import { colors, dropdown, fonts, keyWords } from "src/app/shared/constant";
import { Title } from "@angular/platform-browser";
Chart.defaults.font.size = 14
//Chart.defaults.font.family = 'Frutiger LT Arabic'
Chart.defaults.font.weight = '400'
Chart.defaults.color = colors.raven

@Component({
  selector: 'bills-dashboard-filter',
  templateUrl: './bills-filter.component.html',
  styleUrls: ['bills-filter.component.scss']
})
export class DashBoardBillComponent {
  @Input() pageConfig;
  @Input() billReportData;
  @Input() billCardData;
  @Input() billBarData;
  @Input() billDoughnutData;
  @Input() billLineData;
  @Input() applyFiltersEvent = new EventEmitter();
  fromdateInputFlag: boolean = true;
  dashboardFlag: boolean = true;
  barChart: any
  doughnutChart: any;
  lineChart: any;

  //passing data variables
  barDataArray = [];
  doughnutDataArray = [];
  lineDataArray = [];
  disabled: boolean = false;
  //passing options
  douhnutOption: any;
  type = "PieChart";
  lang = localStorage.getItem('selectedLang');
  //tooltip
  tooltips = {
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
  //errors
  reportError;
  cardError;
  barError;
  doughnutError;
  lineError;
  config = keyWords.config
  bsRangeValueFromDashBoard = [];
  selectedList = [];
  doughnutLegendDate;
  disabledDoughnutChart: boolean = false;
  searchFilters = {
    serviceId: [],
    fromDate: new Date(new Date().setHours(0, 0, 0, 0)),
    toDate: new Date(new Date().setHours(23, 59, 59, 59)),
  };
  loadingColor = colors.loadingColor;
  serviceQueryParam: any;
  constructor(private restApiService: RestApiService, private paymentdashboard: DashboardPaymentModalService, public filtersComponent: FiltersComponent,
    private translate: TranslateService, private router: Router, public datepipe: DatePipe, private spinner: NgxSpinnerService, private notificationService: NotificationService, private titleService: Title) { }

  getBizServicesSetting = {
    singleSelection: false,
    text: this.translate.instant(dropdown.allBizService),
    primaryKey: keyWords.serviceId,
    labelKey: keyWords.serviceName,
    enableSearchFilter: true,
    badgeShowLimit: 1,
    classes: dropdown.classes,
    searchPlaceholderText: this.translate.instant(dropdown.search),
  }
  ngOnInit() {
    setTimeout(() => {
      // this.pageConfig.listOfValues.bizServices.find(el => { this.selectedList.push(el) })
      // this.searchFilters.serviceId = this.selectedList;
      this.search();
    }, 500)
  }
  dropdownchange: boolean = false
  onChange(event) {
    this.dropdownchange = true

  }

  displayBarChart() {
    let label = [];
    let billType = [];
    let barChartData1 = [];
    let list = []
    // let a = {
    //   "intervalStart": "2024-02-02",
    //   "statDetails": [
    //     {
    //       "billType": "EXPIRY_BILL",
    //       "cnt": "30"
    //     },
    //     {
    //       "billType": "NEW_BILL",
    //       "cnt": "90"
    //     },
    //     {
    //       "billType": "UPDATE_BILL",
    //       "cnt": "60"
    //     }
    //   ]
    // }
    // this.billBarData.push(a)
    this.billBarData?.forEach(labelEl => {
      label.push(labelEl.intervalStart);

      //How many types of bar
      labelEl?.statDetails?.forEach(type => type.billType != null && type.billType != '' ? billType.push(type.billType) : '')
      list = this.removeDuplicates(billType);
      let dataSet = ''


      list.forEach(type => {
        dataSet = ''
        labelEl?.statDetails?.forEach(stats => {
          if (stats.billType == type) {

            dataSet = stats.cnt;
          }
        })

        //
        let barData = {
          label: this.translate.instant(type),
          data: dataSet,
          backgroundColor: barChartData1.length == 1 ? colors.skyBlue : barChartData1.length == 2 ? colors.darkPurple : colors.lightMango
        }
        barChartData1?.push(barData);
      })


    })

    let dataSet = []
    list.forEach(billType => {
      let data = [];
      let color;
      barChartData1.map(fil => {
        if (billType == fil.label) {
          data.push(+fil.data);
          color = fil.backgroundColor
        }
      });
      let barData = {
        label: this.translate.instant(billType),
        data: data.reverse(),
        backgroundColor: dataSet.length == 1 ? colors.skyBlue : dataSet.length == 2 ? colors.darkPurple : colors.lightMango
      }

      dataSet.push(barData)
      console.log("dataset", dataSet, label)
    })
    let barChartData = {
      labels: label.reverse(),
      datasets: dataSet
      //     datasets: [{
      //         label:this.translate.instant(keyWords.new),
      //         data: data1.reverse(),
      //         backgroundColor:colors.skyBlue
      //     },{
      //         label:this.translate.instant(keyWords.updated),
      //         data: data2.reverse(),
      //         backgroundColor:colors.darkPurple
      //   },{
      //       label:this.translate.instant(keyWords.expired),
      //       data: data3.reverse(),
      //       backgroundColor:colors.lightMango,
      //     dataLabels:{
      //       color:colors.gray20,
      //       anchor:'end',
      //       align:'top',
      //       offset:5
      //     }
      // }]
    };

    setTimeout(() => {
      let chartId = <HTMLCanvasElement>document.getElementById(keyWords.barChart);
      this.barChart != null ? this.barChart.destroy() : ''
      this.barChart = new Chart(chartId, {
        type: 'bar',
        data: barChartData,
        options: {
          maintainAspectRatio: false,
          interaction: {
            mode: 'index'
          },
          plugins: {
            legend: {
              //  textDirection : 'rlt',
              position: "bottom",
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                padding: 30,
                font: {
                  family: fonts.frutigerLTArabic55Roman,
                  size: 16,
                  weight: fonts.weight400,
                }
              },
            },

            tooltip: this.tooltips

          },
          scales: {
            x: {
              //display:false
              reverse: true,
              grid: {
                display: false
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
              //reverse: true,
              ticks: {
                color: colors.darkBlue,
                font: {
                  family: fonts.roboto,
                  size: 12,
                  weight: fonts.weight400,
                }
              },
            }
          }
        },
        //  plugins:[ChartDataLabels]

      })
    }, 500)

  }

  displayDoughnutChart() {

    let labels = Object.keys(this.billDoughnutData);
    let labelArray = []
    labels.forEach(data => {
      labelArray.push(data == keyWords.successfulUploads ? keyWords.success : data == keyWords.failedUploads ? keyWords.failed : data == keyWords.pendingUploads ? keyWords.pending : '')
    })

    let dataset = Object.values(this.billDoughnutData);
    let doughnutdata = []
    dataset?.forEach((el: any) => {
      let x = parseFloat(el.replace(/,/g, ''));
      doughnutdata.push(x)
    })
    this.doughnutLegendDate = doughnutdata[0];
    doughnutdata.shift();
    labelArray.shift()
    let count = 0;
    doughnutdata?.forEach(data => {
      count = data == 0 ? +count + 1 : count;
    })
    this.disabled = +count == +doughnutdata.length ? true : false;

    let data = {
      labels: labelArray,
      datasets: [{
        data: doughnutdata,
        backgroundColor: [
          colors.lightGreen,
          colors.peach,
          colors.lightOrange,

        ]
      }]
    }
    this.disabledDoughnutChart = doughnutdata.reduce((a, b) => +a + +b) > 0 ? false : true;
    Object.values(this.billDoughnutData)
    setTimeout(() => {
      this.doughnutChart != null ? this.doughnutChart.destroy() : ''
      let chartId = <HTMLCanvasElement>document.getElementById(keyWords.billDoughnutChart);
      this.doughnutChart = new Chart(chartId, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              display: false,
              position: 'right',
              align: 'center',
              labels: {
                textAlign: 'left',
                usePointStyle: true,
                boxWidth: 150,
              }
            },
            tooltip: {
              //intersect: false,
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
          }
        },
        plugins: [{
          id: keyWords.customPluginName,
          beforeInit: function (chart) {
            if (chart?.config["type"] == keyWords.doughnut) {

              var data = chart.data.datasets[0].data;
              var isAllZero = data.reduce((a, b) => +a + +b) > 0 ? false : true;
              if (!isAllZero) return;
              // when all data values are zero...
              chart.data.datasets[0].data = data.map((e, i) => i > 0 ? 0 : 1); //add one segment
              chart.data.datasets[0].backgroundColor = colors.grayish; //change bg color
              chart.data.datasets[0].borderWidth = 0; //no border
              chart.options.plugins.tooltip.enabled = false; //disable tooltips
              chart.options.plugins.legend.onClick = null; //disable legend click

            }

          }
        }]
      });
      // this.doughnutChart?this.generateLegend():''
      this.doughnutChart != null && this, this.doughnutChart != undefined ? this.generateLegend() : '';

    }, 500);
  }

  displayLineChart() {
    let labels = []
    let lineData = []
    this.billLineData?.forEach(element => {
      labels.push(element.intervalStart);
      lineData.push(element.ttlBillsReceived);


    })
    setTimeout(() => {
      this.lineChart != null ? this.lineChart.destroy() : ''
      this.lineChart = new Chart(<HTMLCanvasElement>document.getElementById(keyWords.lineChart), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: this.translate.instant(keyWords.bills),
            data: lineData,
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
          interaction: {
            mode: 'index',
            intersect: true,
          },
          scales: {
            x: {
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
                family: fonts.roboto
              },
              align: 'end',
            },
            tooltip: this.tooltips
          }
        },
        plugins: [ChartDataLabels]
      })
    }, 500)
  }

  onClose(event) {
    this.dropdownchange ? this.search() : ''
    this.dropdownchange = false;
  }
  //custom date
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
      this.searchFilters.toDate = new Date(curr.setHours(23, 59, 59, 59));
      this.bsRangeValueFromDashBoard = []

    }
    else if (buttonName == keyWords.yesterday) {
      this.searchFilters.fromDate = new Date(curr.setHours(0, 0, 0, 0));
      this.searchFilters.fromDate.setDate(this.searchFilters.fromDate.getDate() - 1);
      this.searchFilters.toDate = new Date(this.searchFilters.fromDate)
      this.searchFilters.toDate.setHours(23, 59, 59, 59);
      this.bsRangeValueFromDashBoard = []
    }
    else if (buttonName == keyWords.thisWeek) {
      var firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));
      this.searchFilters.fromDate = new Date(firstDay);
      this.searchFilters.fromDate.setHours(0, 0, 0, 0);
      this.searchFilters.toDate = new Date();
      this.searchFilters.toDate.setHours(23, 59, 59, 59);
      this.bsRangeValueFromDashBoard = []
    }
    else if (buttonName == keyWords.thisMonth) {
      this.searchFilters.fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
      this.searchFilters.toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      this.searchFilters.fromDate.setHours(0, 0, 0, 0)
      this.searchFilters.toDate.setHours(23, 59, 59, 59);
      this.bsRangeValueFromDashBoard = []
    }
    this.search()
  }
  search() {
    let preparedFilters = deepClone(this.searchFilters);
    Object.keys(preparedFilters)?.forEach(o => {
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
    let preparedFilters2 = deepClone(preparedFilters);
    //this.filtersComponent.applyFiltersEvent.emit({ SearchFilters: preparedFilters });
    this.spinner.show(keyWords.billReportSpinner);
    this.restApiService.getOrUpdateData(ApiPaths.getLatestBills, { SearchFilters: preparedFilters2 }, this.config).subscribe((latestBill) => {

      this.billReportData = latestBill?.LatestBills.slice(-5);
      //this.billReportData != undefined?this.spinner.hide('billReportSpinner'):'';
      this.spinner.hide(keyWords.billReportSpinner)
    },
      (err) => {
        this.spinner.hide(keyWords.billReportSpinner);
        this.billReportData = [{}]
        this.reportError = err;
      }
    );
    this.spinner.show(keyWords.billCardDataSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getBillAddtnlStats, { SearchFilters: preparedFilters2 }, this.config).subscribe((cardData) => {
      this.billCardData = cardData?.CardsRs;
      this.spinner.hide(keyWords.billCardDataSpinner)
    },
      (err) => {
        this.spinner.hide(keyWords.billCardDataSpinner)
        this.billCardData = null;
        this.cardError = err;
      }
    );

    this.spinner.show(keyWords.billBarDataSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getBillStats, { SearchFilters: preparedFilters }, this.config).subscribe((barChartData) => {
      this.billBarData = barChartData?.BillStats;
      this.billBarData != undefined ? this.displayBarChart() : '';
      // this.billBarData != undefined?this.spinner.hide('billBarDataSpinner'):'';
      this.spinner.hide(keyWords.billBarDataSpinner)
    },
      (err) => {
        this.spinner.hide(keyWords.billBarDataSpinner);
        this.billBarData = null
        this.barError = err
      }
    );
    this.spinner.show(keyWords.billDoughnutSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getBillRatio, { SearchFilters: preparedFilters2 }, this.config).subscribe((doughnutChartData) => {
      this.billDoughnutData = doughnutChartData?.BillRatio;
      this.billDoughnutData != undefined ? this.displayDoughnutChart() : ''
      // this.billDoughnutData != undefined ? this.generateLegend():''
      this.spinner.hide(keyWords.billDoughnutSpinner);
    },
      (err) => {
        this.spinner.hide(keyWords.billDoughnutSpinner);
        this.billDoughnutData = null
        this.doughnutError = err;
      }
    );
    this.spinner.show(keyWords.billLineSpinner)
    this.restApiService.getOrUpdateData(ApiPaths.getBillFrequency, { SearchFilters: preparedFilters }, this.config).subscribe((lineChartData) => {
      this.billLineData = lineChartData?.BillFrequency;
      this.billLineData != undefined ? this.displayLineChart() : ''
      this.spinner.hide(keyWords.billLineSpinner);
    },
      (err) => {
        this.spinner.hide(keyWords.billLineSpinner);
        this.billLineData = null;
        this.lineError = err;
      }
    );
  }
  //to select serviceId if lenght is 0
  getUpdatedValuesForAllSelections(preparedFilters) {
    if (preparedFilters.serviceId.length == 0) {
      preparedFilters.serviceId = this.filtersComponent.pageConfig.listOfValues.bizServices.map(o => o.serviceId)
    }
  }

  moreBills() {
    this.titleService.setTitle(keyWords.dashboardBillsRedirect)
    this.router.navigate([keyWords.billsUrl], { queryParams: { pageId: keyWords.rES102 }, state: { pageId: keyWords.rES102, serviceId: this.serviceQueryParam, fromDate: this.searchFilters.fromDate, toDate: this.searchFilters.toDate, dashboardFlag: this.dashboardFlag } })
    //this.router.navigate(['dpp/trx/bills'],{state: {pageId: 'RES003',serviceId:this.serviceQueryParam}})
  }
  openModal(chartName, chartHeading) {
    let chartData = chartName == keyWords.lineChart ? this.lineChart : chartName == keyWords.billDoughnutChart ? this.doughnutChart : '';
    let doughnutTotal = chartName == keyWords.billDoughnutChart ? this.doughnutLegendDate : '';
    this.lineDataArray.push([keyWords.intervalStart, keyWords.ttlBillsReceived]);
    this.paymentdashboard.open(chartName, chartData, chartHeading, doughnutTotal, '','')
  }

  generateLegend() {
    //get the selected location
    const totalLI = document.createElement('LI');
    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('span')
    totalSpan.style.borderColor = '#1D1557';
    totalSpan.style.backgroundColor = '#1D1557'
    const totalTitleP = document.createElement('P');
    totalTitleP.classList.add('labelValue')
    const totalTitleTN = document.createTextNode(this.translate.instant("Total Bills"));
    const totalValueP = document.createElement('P');
    totalValueP.classList.add('valueLabel')
    const totalValueTN = document.createTextNode(commify(this.doughnutLegendDate));
    totalTitleP.appendChild(totalTitleTN);
    totalValueP.appendChild(totalValueTN);
    totalLI.appendChild(totalSpan);
    totalLI.appendChild(totalTitleP);
    totalLI.appendChild(totalValueP);
    const chartBox = document.querySelector('.legend-container1');
    chartBox.firstChild != null ? chartBox.removeChild(chartBox.firstChild) : ''
    //create div
    const div = document.createElement('DIV');
    div.classList.add('customLegend');

    //create ul for legend item
    const ul = document.createElement('UL');
    ul.appendChild(totalLI)
    //looping legend item
    this.doughnutChart?.legend?.legendItems?.forEach((dataset, index) => {
      let text;
      let dataText;
      let li;
      let span;
      let p;
      let dataP;
      let textNode;
      let datatextNode;
      let dataIndex;
      let zeroHide = this.doughnutChart?.config?.data?.datasets[0].data;
      this.doughnutChart?.config?.data?.datasets[0].data.find((data, i) => {
        let translateText = this.translate.instant(dataset.text)
        //text= dataset.text;
        text = translateText;
        dataIndex = dataset.index != undefined ? dataset.index : '';
        dataText == 1 ? dataText = 0 : ''
        i == index ? dataText = commify(data) : '';

        const bgColor = dataset.fillStyle;
        const strokeColor = dataset.strokeColor;
        const fontColor = dataset.fontColor;

        p = document.createElement('P');
        li = document.createElement('LI');
        li.onclick = (click) => {
          const { type } = this.doughnutChart.config;
          if (type === keyWords.pie || type === keyWords.doughnut) {
            // Pie and doughnut charts only have a single dataset and visibility is per item
            this.doughnutChart.toggleDataVisibility(dataset.index);
            if (dataset.text != 'Total Bills') {
              if (dataset.fontColor == colors.raven) {
                dataset.hidden = true;
                dataset.fontColor = colors.lightGray
              }
              else if (dataset.fontColor == colors.lightGray) {
                dataset.hidden = true;
                dataset.fontColor = colors.raven
              }
            }
            // dataset.hidden = true;

            p.style.color = dataset.fontColor;
          } else {
            this.doughnutChart.setDatasetVisibility(dataset.datasetIndex, !this.doughnutChart.isDatasetVisible(dataset.datasetIndex));
          }
          this.doughnutChart.update()
        }

        //span colorBox
        span = document.createElement('SPAN');
        span.classList.add('span')
        span.style.borderColor = bgColor;
        span.style.backgroundColor = bgColor;

        //textNode

        p.style.color = dataset.hidden ? 'red' : dataset.fontColor;
        dataP = document.createElement('P');
        p.classList.add(keyWords.labelValue)
        dataP.classList.add(keyWords.valueLabel)
        textNode = document.createTextNode(text);
        datatextNode = document.createTextNode(dataText);
      })
      p.appendChild(textNode);
      dataP.appendChild(datatextNode);
      li.appendChild(span);
      li.appendChild(p)
      li.appendChild(dataP)
      ul.appendChild(li)
    })

    //insert div into chartbox
    chartBox?.appendChild(div);
    div?.appendChild(ul);
  }

  rangematch: boolean = false;
  //datepicket
  dateRangeChange1(rangedate) {

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
          this.notificationService.showError(this.translate.instant(constantField.dateRangeMsg + this.pageConfig?.customParams?.SearchDateRange + keyWords.days));
          return;
        }
        this.search();
      }
    }
  }

  removeDuplicates(arr) {
    return arr.filter((item,
      index) => arr.indexOf(item) === index);
  }
}