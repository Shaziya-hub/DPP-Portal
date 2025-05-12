import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: 'app-success',
    templateUrl:'./success.component.html',
    styleUrls:['./success.component.scss']
  })

  export class SuccessComponent implements OnInit{

  refDetail:any
  errorMsg:any
  status:string;
  pmtRef:string;
  combinedMessage:string;
    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
      //  console.log(this.route.snapshot.queryParams.refDetail);
      //  this.refDetail=this.route.snapshot.queryParams.refDetail
      //  this.errorMsg=this.route.snapshot.queryParams.errorMsg

       ;
       this.refDetail=this.route.snapshot.queryParams.message
       this.status=this.route.snapshot.queryParams.status
       this.pmtRef=this.route.snapshot.queryParams.pmtRef
       this.combinedMessage = this.status =='SUCCESS'? this.refDetail+" and Your Payment Reference is "+this.pmtRef:this.refDetail
      // this.errorMsg=this.route.snapshot.queryParams.errorMsg
    }

  }