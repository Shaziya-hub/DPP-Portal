import { Component } from "@angular/core";
import { Chart } from "chart.js";
import { DashboardPaymentModalService } from "./payment-modal.service";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { divide } from "lodash";
import { Row } from "jspdf-autotable";
//import { parseI18nMeta } from "@angular/compiler/src/render3/view/i18n/meta";
import { commify } from "src/app/shared/utils";
import { colors, keyWords } from "src/app/shared/constant";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'dashboard-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})

export class DashboardPaymentModalComponent {
  chartId;
  chartData;
  chartHeading;
  chart;
  googleChart;
  //gauge legend variable
  greenTo;
  successCount = 0;
  failedCount = 0;
  hideSuccess: boolean = false;
  hideFailed: boolean = false;
  successDisabled: boolean = false;
  failedDisabled: boolean = false;
  doughnutApiData;
  doughnutDataArray = [];
  totalAmt: boolean = true;
  channelAmt = [];
  methodAmt = [];
  serviceAmt = [];
  bankAmt = [];
  channelCnt = [];
  methodCnt = [];
  serviceCnt = [];
  bankCnt = [];

  totalAmtObj = [];
  totalCntObj = [];
  statsType:any='';
  backgroundColor = [colors.lightGreen, colors.yellow, colors.chartBlue, colors.lightOrange, colors.pinkPurple, colors.chartBlue2, colors.grayishGreen, colors.peach]

  constructor(private dashboardPaymentModalService: DashboardPaymentModalService, private translate: TranslateService) {

  }
  ngOnInit() {

    if (this.dashboardPaymentModalService.chartId && this.dashboardPaymentModalService.chartData) {
      this.chartId = this.dashboardPaymentModalService.chartId;
      this.chartData = this.dashboardPaymentModalService.chartData;
      this.chartHeading = this.dashboardPaymentModalService.chartHeading;
      this.doughnutApiData = this.dashboardPaymentModalService.doughnutApiData;
      this.doughnutDataArray = this.dashboardPaymentModalService.chartDataArray;
      this.statsType = this.dashboardPaymentModalService.statsType;
    }

    if (this.chartId == keyWords.chart0 || this.chartId == keyWords.chart1 || this.chartId == keyWords.chart2 || this.chartId == keyWords.chart3) {
      this.chartData.config.options.plugins.tooltip = { enabled: false, external: this.externalTooltipHandler, }
      this.doughnutApiData?.forEach((data) => {
        data.statsDetails.forEach(stast => {
          let channelAmt;
          let channelcnt

          channelAmt = { "chartTitle": data.statType, "label": stast.name, "total": stast.ttlAmt != null ? stast.ttlAmt : '0', "success": stast.successAmt != null ? stast.successAmt : '0', "failure": stast.failureAmt != null ? stast.failureAmt : '0' };
          channelcnt = { "chartTitle": data.statType, "label": stast.name, "total": stast.ttlCnt != null ? stast.ttlCnt : '0', "success": stast.successCnt != null ? stast.successCnt : '0', "failure": stast.failureCnt != null ? stast.failureCnt : '0' }
          this.totalAmtObj.push(channelAmt);
          this.totalCntObj.push(channelcnt);

        })
      })
      this.displayTotalAmtChart();
    }
    if (this.chartId != keyWords.googleChart && this.chartId != keyWords.chart0 && this.chartId != keyWords.chart1 && this.chartId != keyWords.chart2 && this.chartId != keyWords.chart3) {
      const options = this.chartData?.config?.options
      setTimeout(() => {
        const id = <HTMLCanvasElement>document.getElementById(keyWords.chart)
        this.chart = new Chart(id, {
          type: this.chartData.config.type,
          data: this.chartData.config.data,
          options: this.chartData.config.options,
          plugins: this.chartId == keyWords.lineChart ? [ChartDataLabels] : []

        })
        this.chartId != keyWords.lineChart ? this.generateLegend() : '';
      }, 100)
    }
    else {
      this.greenTo = ((+this.chartData.successPmtCnt / +this.chartData.ttlPmtCnt) * 100).toFixed(1);
      this.googleChart = {
        type: 'Gauge',
        data: [
          [keyWords.success, { v: +this.greenTo, f: this.greenTo == "NaN" ? '0' + '%' : +this.greenTo + '%' }]
        ],
        options: {
          width: 750,
          height: 500,
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
          majorTickColor: colors.tickdarkBlue
        }
      };
    }
  }


  //Custom tooltip
  tooltipUL: any;

  getOrCreateTooltip(chart) {
    let tooltipEL = chart.canvas.parentNode.querySelector('div');
    if (!tooltipEL) {
      tooltipEL = document.createElement("DIV");
      tooltipEL.classList.add('customTooltip');
      this.tooltipUL = document.createElement('UL');
      this.tooltipUL.classList.add('tooltipUL');
      tooltipEL.appendChild(this.tooltipUL);

      //append to parent
      chart.canvas.parentNode.appendChild(tooltipEL);
    }
    return tooltipEL;
  }

  // 1. Tooltip Trigger
  externalTooltipHandler = (context) => {
    const { chart, tooltip } = context;
    const tooltipEL = this.getOrCreateTooltip(chart);

    // 3. hide tooltip on mouseout
    if (tooltip.opacity === 0) {
      tooltipEL.style.opacity = 0;
      return;
    }

    //4. tooltip text
    if (tooltip.body) {
      const tooltipLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(b => b.lines);

      const tooltipLI = document.createElement("LI");

      tooltipLines?.forEach((title) => {
        this.tooltipUL.appendChild(tooltipLI);
        const tooltipSpan = document.createElement("SPAN");
        tooltipLI.appendChild(tooltipSpan);
        //tooltip title
        const tooltipTitle = document.createTextNode(title);
        tooltipSpan.appendChild(tooltipTitle);

      });

      //tooltip body
      const tooltipBody = document.createElement('P');
      let chartTile: any = [];
      bodyLines?.forEach((body, i) => {
        let tempOBJ = [];
        let amtOrcnt;
        if (this.totalAmt == true) {
          tempOBJ = this.totalAmtObj;
          amtOrcnt = this.translate.instant(keyWords.amount);
        }
        else {
          tempOBJ = this.totalCntObj;
          amtOrcnt = this.translate.instant(keyWords.count);
        }
        tempOBJ.forEach(amt => {
          // body.push(amt.t);
          if (this.statsType == amt.chartTitle && context?.tooltip?.title == amt.label) {
            const div1 = document.createElement("DIV");
            const div2 = document.createElement("DIV");
            const div3 = document.createElement("DIV");
            const colorbox = document.createElement("SPAN");
            const colorbox1 = document.createElement("SPAN");
            const colorbox2 = document.createElement("SPAN");
            colorbox.classList.add('colorBox');
            colorbox1.classList.add('colorBox');
            colorbox2.classList.add('colorBox');
            colorbox.style.backgroundColor = colors.lightOrange;
            colorbox.style.border = colors.lightOrange;
            colorbox1.style.backgroundColor = colors.lightGreen;
            colorbox1.style.border = colors.lightGreen;
            colorbox2.style.backgroundColor = colors.peach;
            colorbox2.style.border = colors.peach;

            const ttlAmtP = document.createElement('P');
            const totalLabelP = document.createElement('label');
            let total = this.translate.instant(keyWords.total)
            const totalLabel = document.createTextNode(total + " " + amtOrcnt)
            const ttlAmtLabel = document.createTextNode(commify(amt.total));
            ttlAmtP.appendChild(ttlAmtLabel);
            totalLabelP.appendChild(totalLabel)
            const successAmtP = document.createElement('P');
            const successLabelP = document.createElement('label');
            let success = this.translate.instant(keyWords.success)
            const successLabel = document.createTextNode(success + " " + amtOrcnt)
            const successAmtLabel = document.createTextNode(commify(amt.success));
            successAmtP.appendChild(successAmtLabel);
            successLabelP.appendChild(successLabel)

            const failureAmtP = document.createElement('P');
            const failureLabelP = document.createElement('label');
            let failure = this.translate.instant(keyWords.failure)
            const failureLabel = document.createTextNode(failure + " " + amtOrcnt)
            const failureAmtLabel = document.createTextNode(commify(amt.failure));
            failureAmtP.appendChild(failureAmtLabel);
            failureLabelP.appendChild(failureLabel);

            div1.appendChild(colorbox);
            div1.appendChild(totalLabelP);
            div1.appendChild(ttlAmtP)
            tooltipBody.appendChild(div1);

            div2.appendChild(colorbox1);
            div2.appendChild(successLabelP);
            div2.appendChild(successAmtP)
            tooltipBody.appendChild(div2);

            div3.appendChild(colorbox2);
            div3.appendChild(failureLabelP);
            div3.appendChild(failureAmtP)
            tooltipBody.appendChild(div3);
          }

        })
      });

      //remove old child
      const ULnode = tooltipEL.querySelector('ul');
      while (ULnode.firstChild) {
        ULnode.firstChild.remove();
      }

      //add new children
      ULnode.appendChild(tooltipLI);
      tooltipLI.appendChild(tooltipBody);
      tooltipEL.style.opacity = 1;

      //positioning of tooltip
      const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

      // Display, position, and set styles for font
      tooltipEL.style.opacity = 1;
      tooltipEL.style.left = positionX + tooltip.caretX + 'px';
      tooltipEL.style.top = positionY + tooltip.caretY - +45 + 'px';
      //tooltipEL.style.font = tooltip.options.bodyFont.string;
      tooltipEL.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';


    }

  }
  displayTotalAmtChart() {

    setTimeout(() => {
      this.chart != null ? this.chart.destroy() : ""
      const id = <HTMLCanvasElement>document.getElementById(keyWords.chart)
      this.chart = new Chart(id, {
        type: this.chartData.config.type,
        data: this.chartData.config.data,
        options: this.chartData.config.options,
        // plugins:this.chartId =='lineChart'?[ChartDataLabels]:[]

      })
      this.chartId != keyWords.lineChart ? this.generateLegend() : '';
    }, 100)
  }
  displayTotalCntChart() {
    let dataLabels = [];
    let dataValues = [];
    this.doughnutDataArray?.forEach(data => {

      this.chartHeading == keyWords.channelStats && data.chartTitle == keyWords.channelStats ? dataLabels.push(data.name == null ? 'null' : data.name) && dataValues.push(data.totalCnt == null ? '0' : data.totalCnt) :
        this.chartHeading == keyWords.methodStats && data.chartTitle == keyWords.methodStats ? dataLabels.push(data.name == null ? 'null' : data.name) && dataValues.push(data.totalCnt == null ? '0' : data.totalCnt) :
          this.chartHeading == keyWords.serviceTypeStats && data.chartTitle == keyWords.serviceTypeStats ? dataLabels.push(data.name == null ? 'null' : data.name) && dataValues.push(data.totalCnt == null ? '0' : data.totalCnt) :
            this.chartHeading == keyWords.bankStats && data.chartTitle == keyWords.bankStats ? dataLabels.push(data.name == null ? 'null' : data.name) && dataValues.push(data.totalCnt == null ? '0' : data.totalCnt) : ''
    });


    let data = {
      labels: dataLabels,
      datasets: [{
        data: dataValues,
        backgroundColor: this.backgroundColor
      }]
    }
    setTimeout(() => {
      this.chart != null ? this.chart.destroy() : ""
      const id = <HTMLCanvasElement>document.getElementById(keyWords.chart)
      this.chart = new Chart(id, {
        type: this.chartData.config.type,
        data: data,
        options: this.chartData.config.options,
        // plugins:this.chartId =='lineChart'?[ChartDataLabels]:[]

      })
      this.chartId != keyWords.lineChart ? this.generateLegend() : '';
    }, 100)
  }
  close() {
    this.dashboardPaymentModalService.close()
  }
  generateLegend() {
    const totalTR = document.createElement("TR");
    if (this.chartId == 'billDoughnutChart') {
      const totalSpanTD = document.createElement("TD");
      const totalTitleTD = document.createElement("TD");
      totalTitleTD.classList.add('labelValue');
      const totalValueTD = document.createElement("TD");
      totalValueTD.classList.add('valueLabel')
      const totalColorBox = document.createElement('span');
      totalColorBox.classList.add('colorBox');
      totalColorBox.style.background = '#1D1557';
      totalColorBox.style.border = '#1D1557';
      const totalTitleTN = document.createTextNode(this.translate.instant("Total Bills"));
      const totalValueTN = document.createTextNode(commify(this.doughnutApiData));
      totalSpanTD.appendChild(totalColorBox);
      totalTitleTD.appendChild(totalTitleTN);
      totalValueTD.appendChild(totalValueTN)
      totalTR.appendChild(totalSpanTD);
      totalTR.appendChild(totalTitleTD);
      totalTR.appendChild(totalValueTD);
    }
    const chartBox = document.querySelector('.legend-container');
    chartBox?.firstChild ? chartBox.removeChild(chartBox.firstChild) : chartBox;
    //if(this.chart?.legend?.legendItems.length > 10){
    const row = document.createElement('DIV');
    row.classList.add('row');
    this.chartId != 'lineChart' ? row.style.marginTop = '12%' : '0%'

    const div1 = document.createElement('DIV');
    div1.classList.add('col-md-6', 'col-sm-6', 'col-6', 'customLegend')
    const div2 = document.createElement('DIV');
    div2.classList.add('col-md-6', 'col-sm-6', 'col-6', 'customLegend');

    let totalCount = +this.chart?.legend?.legendItems.length;
    let divideCount
    totalCount > 10 ? divideCount = (Math.round(+totalCount / 2)) : ''
    const table1 = document.createElement('TABLE');
    this.chartId == 'billDoughnutChart' ? table1.appendChild(totalTR) : ''
    const table2 = document.createElement('TABLE');
    this.chart?.legend?.legendItems?.forEach((item, index) => {
      //span color box
      const colorBox = document.createElement('span');
      colorBox.classList.add('colorBox');
      colorBox.style.background = item.fillStyle;
      colorBox.style.border = item.fillStyle;
      const tdSpan = document.createElement('TD');
      //legend item text
      const text = this.translate.instant(item.text);
      const tdLabel = document.createElement('TD');
      // this.chartId == keyWords.billDoughnutChart?tdLabel.classList.add('billLabelValue'): 
      tdLabel.classList.add('labelValue')
      const valueTN = document.createTextNode(text);
      tdLabel.style.color = item.hidden ? 'red' : item.fontColor;
      let tr;
      // let tdLabel;
      let tdValue;
      let dataValue;
      let dataTn;

      this.chart?.config?.data?.datasets[0].data.find((data, i) => {
        // i == 0 && data == 1 ? data ='0':''
        i == index ? dataValue = commify(data) : '';
        tdValue = document.createElement('TD');
        tdValue.classList.add(keyWords.valueLabel)
        dataTn = document.createTextNode(dataValue);

        tr = document.createElement('TR');
        tr.onclick = (click) => {
          const { type } = this.chart.config;
          if (type === keyWords.pie || type === keyWords.doughnut) {
            // Pie and doughnut charts only have a single dataset and visibility is per item
            this.chart.toggleDataVisibility(item.index);
            if (item.fontColor == colors.raven) {
              item.hidden = true;
              item.fontColor = colors.lightGray
            }
            else if (item.fontColor == colors.lightGray) {
              item.hidden = true;
              item.fontColor = colors.raven
            }
            tdLabel.style.color = item.fontColor;
          } else {
            this.chart.setDatasetVisibility(item.datasetIndex, !this.chart.isDatasetVisible(item.datasetIndex));
          }
          this.chart.update()
        }
        tdSpan.appendChild(colorBox);
        tdLabel.appendChild(valueTN);
        tdValue.appendChild(dataTn);
        tr.appendChild(tdSpan);
        tr.appendChild(tdLabel);
        tr.appendChild(tdValue);

      })

      if (totalCount > 10) {
        if (divideCount) {
          +divideCount--
          table1.appendChild(tr);
        }
        else {
          table2.appendChild(tr);
        }
      }
      else {
        table1.appendChild(tr);
      }
      div1.appendChild(table1);
      div2.appendChild(table2)
      row.appendChild(div1);
      row.appendChild(div2);
      chartBox.appendChild(row)

    })
  }

  onChangeToggle(event) {
    if (event.target.checked == true) {
      this.totalAmt = true
      this.displayTotalAmtChart()
    }
    else {
      this.totalAmt = false
      this.displayTotalCntChart()
    }
  }
}