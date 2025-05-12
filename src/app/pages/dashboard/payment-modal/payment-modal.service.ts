import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DashboardPaymentModalComponent } from "./payment-modal.component";

@Injectable()
export class DashboardPaymentModalService {
    chartId;
    chartData;
    chartHeading;
    doughnutApiData;
    chartDataArray;
    statsType;
    constructor(private modalService: NgbModal) { }

    open(chartId, chartData, chartHeading, doughnutApiData, doughnutArray, statsType: string) {
        // console.log("this.chartData",chartData)
        this.chartId = chartId;
        this.chartData = chartData;
        this.chartHeading = chartHeading;
        this.doughnutApiData = doughnutApiData
        this.chartDataArray = doughnutArray
        this.statsType = statsType
        if (chartId != 'google-chart') {
            // for bill doughnut chart legend
            this.chartData.config.options.plugins.legend.display = false;
            this.chartData.config.options.plugins.legend.labels = {}
        }

        this.modalService.open(DashboardPaymentModalComponent, { modalDialogClass: 'modal-dialog-scrollable', centered: true, size: 'xl', backdrop: true, backdropClass: "custom-class", })
    }
    close() {
        this.modalService.dismissAll()
    }



}