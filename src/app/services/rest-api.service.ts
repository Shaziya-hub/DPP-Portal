import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PageConfig } from 'src/app/model/page-config';
import { LoaderService } from 'src/app/services/loader.service';
import { NotificationService } from 'src/app/services/notification.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';
import { Menu } from '../model/menu';
import { ApiPaths, TimeOutDetails } from '../shared/utils';
import { timeout } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';


@Injectable({
    providedIn: 'root'
})

export class RestApiService {

    userId: string = null;
    resourceId: string = null;
    params: any;

    // Define API
    apiURL = environment.DPP_BACKEND_HOST;
    subjectDataSource$ = new BehaviorSubject<any>(null);
    selectedDataSource$ = this.subjectDataSource$.asObservable();
    constructor(private datePipe: DatePipe, private translate: TranslateService, private http: HttpClient, public loaderService: LoaderService, private notificationService: NotificationService, private store: StoreService, private route: ActivatedRoute, private spinner: NgxSpinnerService) {
        this.handleError = this.handleError.bind(this);
        //this.userId =this.store.user.getValue().id =="768c5dcf-daf1-4b4e-adad-cf818cd57673"?'U10001':this.store.user.getValue().id; //'U10001' //this.store.user.getValue().id;
        this.userId = this.store.user.getValue().id == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc" ? 'aee080f6-77f4-4c95-bbac-1748848e9a04' : this.store.user.getValue().id; //'U10001'
        this.route.queryParams.subscribe(params => {
            this.resourceId = params.pageId
        })
    }


    private subject$ = new BehaviorSubject<any>({});
    selectedSubject$ = this.subject$.asObservable();

    private signPayload$ = new BehaviorSubject<any>({});
    signPayloadSubject$ = this.signPayload$.asObservable();


    setdocument(value: any) {
        this.subject$.next(value);
    }

    setSignPayload(value) {

        this.signPayload$.next(value);

    }



    // HttpClient API get() method => Fetch menu list
    getMenuByUser(params): Observable<Menu> {
        /*
           Removeing portal Timestamp from the payload
        */
        // let date = this.datePipe.transform(
        //     new Date(),
        //     'yyyy-MM-dd HH:mm:ss.SSSSSS'
        // );
        this.store.pageConfigServiceCall.next(true)
      //  console.log("Store value is :", this.store.user.getValue().id);
        params.userId = this.store.user.getValue().id == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc" ? 'aee080f6-77f4-4c95-bbac-1748848e9a04' : this.store.user.getValue().id; //this.store.user.getValue().id;//'aee080f6-77f4-4c95-bbac-1748848e9a04'
        // params.portalTimestamp = date
       // console.log("params is " + params);
       this.setSignPayload({})
        return this.http.get<Menu>(this.apiURL + ApiPaths.getMenuByUser, { params: params })
            .pipe(timeout(TimeOutDetails.getMenuByUserTimeout)
            )
    }

    // HttpClient API get() method => Fetch page config for a resource
    getPageConfig(params, reportType?): Observable<PageConfig> {
        //{params: params};
        this.store.pageConfigServiceCall.next(true)
        // params.userId ='aee080f6-77f4-4c95-bbac-1748848e9a04'
        let paramsCustom = params
        if (reportType != undefined && reportType != null && reportType != "") {
            let customresourceId = params.value.pageId + "." + reportType
            // params.resourceId=customresourceId
            params.resourceId = customresourceId
            paramsCustom = { userId: this.userId, resourceId: customresourceId }
            // queryparam={params: params};
        }
        this.setSignPayload({})
        return this.http.get<PageConfig>(this.apiURL + ApiPaths.getPageConfig, { params: paramsCustom })
            .pipe(timeout(TimeOutDetails.getPageConfigTimeout),
                catchError(this.handleError)
            )
    }

    getSvcMappings(url, body): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        this.setSignPayload({})
        return this.http.post<any>(this.apiURL + url, body, { observe: 'response' })
            .pipe(timeout(TimeOutDetails.getSvcMappingsTimeout),
                catchError(this.handleError)
            )
    }

    // HttpClient API post() method => Fetch resource table data on search
    getTableData(url, body, config): Observable<any> { //console.log('calling...')
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        this.setSignPayload({})
        // headers=headers.set('timeout',body.SearchFilters.timeOut); 
        //console.log("headers is form our side with time out:",timeout);
        //delete body.SearchFilters.timeOut;
        return this.http.post<any>(this.apiURL + url, body, { headers: headers, observe: 'response' })
            .pipe(timeout(TimeOutDetails.getPaymentTransactionsTimeout),
                catchError((err) => this.handleError(err))
            )
    }

    getLimitLockTableData(url, config): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        this.setSignPayload({})
        return this.http.get<any>(this.apiURL + url, { headers: headers, observe: 'response' })
            .pipe(timeout(TimeOutDetails.getPaymentTransactionsTimeout),
                catchError((err) => this.handleError(err))
            )
    }

    getSummaryTableData(urll, body, config): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        this.setSignPayload({})
        return this.http.post<any>(this.apiURL + urll, body, { observe: 'response', headers: headers })
            .pipe(timeout(TimeOutDetails.getSummaryTableDataTimeout),
                catchError((err) => this.handleError(err))
            )
    }

    // HttpClient API post() method => download resource table data
    downloadTableData(url, body, config): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        this.setSignPayload({})
        return this.http.post(this.apiURL + url, body, {
            headers: headers,
            reportProgress: true,
            observe: 'events',
            responseType: 'json'
        })
            .pipe(timeout(TimeOutDetails.downloadTableDataTimeout),
                catchError((err) => this.handleError(err))
            )
    }

    downloadFile(url, filePath): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/octet-stream');
        this.setSignPayload({})
        return this.http.get(this.apiURL + url + filePath, { responseType: 'blob', headers: headers })
            .pipe(timeout(TimeOutDetails.downloadFileTimeOut),
                catchError((err) => this.handleError(err))
            )
    }

    viewExtRefDetails(url, body, config): Promise<any> {
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        })
        this.setSignPayload({})
        return this.http.post(this.apiURL + url, body, { headers: headers }).toPromise()
        // .pipe(timeout(TimeOutDetails.getPaymentTransactionExtRefsTimeOut),
        //     catchError((err) => this.handleError(err))
        // )
    }

    // HttpClient API get() method => get a resource with reportId selactable column to show/hide the grid columns  
    getSelectableColumns(params, config?, reportType?): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        let paramsCustom = params
        if (reportType != undefined && reportType != null && reportType != "") {
            let customresourceId = params.value.pageId + "." + reportType
            params.resourceId = customresourceId
            paramsCustom = { userId: this.userId, resourceId: customresourceId }
        }
        this.setSignPayload({})
        return this.http.get<any>(this.apiURL + ApiPaths.getSelectableColumns, { params: paramsCustom, headers: headers })
            .pipe(timeout(TimeOutDetails.getSelectableColumnsTimeout),
                catchError((err) => this.handleError(err))
            )
    }

    // HttpClient API post() method => update a resource selactable column
    updateSelectableColumns(selectableColumns, selectableColumnsDetails, config, reportType?): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        //     if(reportType !=undefined && reportType !=null && reportType != "" && this.resourceId == 'RES030'){
        //     const params: any = {
        //         userId: this.userId,
        //         resourceId: this.resourceId+"."+reportType
        //     };
        //     this.params=params
        //      }else{
        //         const params: any = {
        //            userId: this.userId,
        //            resourceId: this.resourceId

        //         };
        //     this.params=params
        // }

        //for sending reportType in body for updateCOlumns start 
        if (reportType == null || reportType == '' || reportType == undefined) {
            const params: any = {
                userId: this.userId,
                resourceId: this.resourceId

            };
            this.params = params
        } else if (reportType != null || reportType != '' || reportType != undefined) {
            const params: any = {
                userId: this.userId,
                resourceId: this.resourceId + "." + reportType
            };
            this.params = params
        }
        //for sending reportType in body for updateCOlumns end

        let postData = {
            selectableColumns: selectableColumns,
            selectableColumnsDetails: selectableColumnsDetails
        }
        selectableColumnsDetails == null || selectableColumnsDetails == '' || selectableColumnsDetails.length == 0 ? delete postData.selectableColumnsDetails : ''
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });

        Object.assign(postData, this.params);
        this.setSignPayload({})
        return this.http.post<any>(this.apiURL + ApiPaths.updateSelectableColumns, { "UpdateSelectableColumnsRq": postData }, { headers: headers })
            .pipe(timeout(TimeOutDetails.updateSelectableColumnsTimeout),
                catchError((err) => this.handleError(err))
            )

    }

    // HttpClient API call to fetch and update data by passing any url and params
    getOrUpdateData(url, body, config?, params = {}): Observable<any> {
        if(!body?.EndPoints && !body?.ProcessorConfig && !body?.ProcessorConfigDetails && !body?.UserDetails){
            this.setSignPayload({}) 
        }
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        return this.http.post<any>(this.apiURL + url, body, { params: params, headers: headers })
            .pipe(timeout(TimeOutDetails.getOrUpdateDataTimeOut),
                catchError(this.handleError)
            )
    }

    getLimitOrUpdateData(url, body, config?): Observable<any> {
        this.store.pageConfigServiceCall.next(false)
        let params = body
        //console.log('body',body)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        this.setSignPayload({})
        return this.http.get<any>(this.apiURL + url, { params: params, headers: headers })
            .pipe(timeout(TimeOutDetails.getOrUpdateDataTimeOut),
                catchError(this.handleError)
            )
    }

    getOrUpdateUserData(url, body, config): Observable<any> {  //ManageResources Method
        this.store.pageConfigServiceCall.next(false)
        let headers = new HttpHeaders();
        Object.keys(config).forEach(el => {
            headers = headers.set(el, config[el]);
        });
        this.setSignPayload({})
        return this.http.post<any>(this.apiURL + url, body, { observe: 'response', headers: headers })
            .pipe(timeout(TimeOutDetails.getOrUpdateDataTimeOut),
                catchError(this.handleError)
            )
    }

    // authenticationService(username: String, password: String) {
    //     return this.http.get(`http://localhost:8080/api/v1/basicauth`,
    //       { headers: { authorization: this.createBasicAuthToken(username, password) } }).pipe(map((res) => {

    //       }));
    //   }

    getDataource(val: any) {
        //console.log('getDataSource', val)
        this.subjectDataSource$.next(val);
    }



    // Error handling 
    handleError(error) {
        let errorMessage;
        if (error.headers) {
            this.loaderService.hide();
            errorMessage = this.translate.instant(error.headers.get('reason-pharse'));
        }
        if (!errorMessage) {
            errorMessage = this.translate.instant('Unknown error, please try in sometime.');
        }
        this.loaderService.hide();
        this.notificationService.showError(errorMessage);
        return throwError(errorMessage);
    }


}