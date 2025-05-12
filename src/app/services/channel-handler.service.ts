import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { LoaderService } from './loader.service';
import { NotificationService } from './notification.service';
import { timeout } from 'rxjs/operators'
import { TimeOutDetails } from '../shared/utils';
import { catchError } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})

export class ChannelHandlerService {

    constructor(private handler: HttpBackend, private http: HttpClient, public loaderService: LoaderService, private notificationService: NotificationService) {
        this.handleError = this.handleError.bind(this);
        this.http = new HttpClient(handler);
    }
    createBasicAuthToken(username: String, password: String) {

        return 'Basic ' + window.btoa(username + ":" + password)
    }

    getauthenticateService(url, body, username, password): Observable<any> {
        // let headers = new HttpHeaders({
        //     'Content-Type':  'application/json',
        //      'Authorization': this.createBasicAuthToken(username, password)
        // });

        const header = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + window.btoa(username + ':' + password)
        })
        return this.http.post<any>(url, body, { headers: header })
            .pipe(timeout(TimeOutDetails.getPaymentTransactionsTimeout),
                catchError((err) => this.handleError(err))
            )
    }

    // Error handling 
    handleError(error) {
        // console.log("error is ",error);
        let errorMessage;
        if (error.headers && error.headers.get('reason-pharse')) {
            errorMessage = error.headers.get('reason-pharse');
        } else if (error.message) {
            errorMessage = error.message;

        } else if (!errorMessage) {
            errorMessage = 'Unknown error, please try in sometime.';
        }
        this.loaderService.hide();
        this.notificationService.showError(errorMessage);
        return throwError(errorMessage);
    }
}