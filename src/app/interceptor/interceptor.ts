import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';
import { StoreService } from '../services/store.service';
import { ActivatedRoute } from '@angular/router';
import { ColumnSettingsModalService } from '../components/column-settings/column-settings-modal.service';
import { SignatureService } from '../services/signature.service';
import { RestApiService } from '../services/rest-api.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  userId: string;
  userName: string
  userEmailId: string;
  pageCall: boolean = false;
  resourceId: any
  reportType: any
  roleCall;

  constructor(private KeycloakService: KeycloakService, private translate: TranslateService, private store: StoreService, private route: ActivatedRoute, private columnService: ColumnSettingsModalService, private signatureService:SignatureService,private restApiService:RestApiService) { }
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //let access_token = this.KeycloakService.getKeycloakInstance().token;
    let access_token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJoZ1NqWDViWU1qS3BreVdpcXJnaWJMaDdqbkVNeDRLaFdZRUVFNXBoQ0ZZIn0.eyJleHAiOjE3NDA2Mzc5MDAsImlhdCI6MTc0MDYzNjEwMCwiYXV0aF90aW1lIjoxNzQwNjM2MDk5LCJqdGkiOiIxOGE4ZjA0ZS0zZDBmLTRiOWItYmE1Mi01MDFlNTIzMjI1NjgiLCJpc3MiOiJodHRwOi8vMTIyLjE3MC4yLjE2Njo5MDcxL2F1dGgvcmVhbG1zL2RwcCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1ZjY3ODAxNS1iYzNjLTQxYzMtYjRjZi1kMjBkODA4MzRmNTgiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJkcHAtcG9ydGFsIiwibm9uY2UiOiI2Y2Y1YTg0Yi1iMWU1LTQ2ZDAtOGQzMy1mZmFmZWUyMGYyZDkiLCJzZXNzaW9uX3N0YXRlIjoiODAwZWRmYmItNTIyYi00YTUxLThmY2EtOWZhNDljZjdhZTU2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vMTIyLjE3MC4yLjE2Njo5MDcxIiwiaHR0cDovLzI0LjI4Ljc1Ljc4OjkwOTQiLCJodHRwOi8vbG9jYWxob3N0OjkwNzEiLCJodHRwOi8vMjQuMjguNzUuNzg6OTA3MSIsImh0dHA6Ly9sb2NhbGhvc3Q6OTA4MCIsImh0dHA6Ly8yNC4yOC43NS43ODo4MCIsIioiLCJodHRwOi8vMjQuMjguNzUuNzg6OTA4MSIsImh0dHA6Ly8yNC4yOC43NS43ODo5MDkyIiwiaHR0cDovL2xvY2FsaG9zdDo0MjAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWRwcCIsIkRQUF9hZG1pbiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiODAwZWRmYmItNTIyYi00YTUxLThmY2EtOWZhNDljZjdhZTU2IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoic2hheml5YSBzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2hheml5YTEiLCJnaXZlbl9uYW1lIjoic2hheml5YSIsImZhbWlseV9uYW1lIjoicyIsImVtYWlsIjoic2hheml5YUBkcHAuaW4ifQ.VSqt8_213FNmvhF5FgcjQ7M144KDz05zSuJ1YvHn9KXWmpM5J_8aVKWFOr0QUsS3JuNm1SufVovgdgdgukjIbZnk_ZufbGcNS0sr-hi1UyYmltuEvtlJDh7b4eJpnzwQICO7dgSvdS8JhKhLqVOPxPJW5oc7sT5uOa8Xtt95EGILw8fVqOskLh6ufoPyn_bnTcwi33TFIJiLzpSALal2yiDz7mkdtqKqmW2jHKOYFhyhPc36j5mgOZkUuqiAL36paFOcDu6oWkW5I73-hGTX3-vuNKJVLUD-paSoi8yPSrY0Dv7xhrMewiDTU_j68p5mNNbWMAUaCANMZr282LA62Q'
    let selectedLang = this.translate.defaultLang;
    this.translate.onLangChange.subscribe(o => {
      selectedLang = o.lang
    })



    this.route.queryParams.subscribe(params => {
      //  this.resourceId = params.pageId;
      let id = params.pageId == 'RES601.ROLES' ? params.pageId.splice('.') : params.pageId;
      if (id?.isArray) {
        this.resourceId = id[0]
      }
      else {
        this.resourceId = params.pageId;
      }
    })

    this.reportType = this.columnService.reportType

    /*
      impelment 256AES signature to validate no change in API inputs
      for request-type = 'add', 'edit' & 'delete', send a new header fields as 'signature'. which will contain signature of full payload
    */
    let requestType = httpRequest.headers.get('request-type')
   // console.log('request Type header', requestType)
  //  console.log('request Type header', httpRequest)
    let sign
    this.restApiService.signPayloadSubject$.subscribe(val => {
      //console.log('val ==',val )
      sign = val && JSON.stringify(val) === '{}' ? this.signatureService.signPayload(httpRequest.body) : this.signatureService.signPayload(val)

    })
   // console.log('Signature', sign)
    this.store.roleId.subscribe(page => this.roleCall = page)

    this.store.pageConfigServiceCall.subscribe(page => this.pageCall = page)

    this.store.user.subscribe(user => {
    //  console.log('user', user)

     // if(user.id =="768c5dcf-daf1-4b4e-adad-cf818cd57673" || user.id == "26e2ae3a-3878-402f-a50a-8b49769ead7d"){ 
          
            // this.userId = 'U10001';
            // this.userEmailId = 'gowtham.ankireddy@amconsultcorp.com';
            // this.userName = "test test"
            // }else{
                this.userId = user.id;
                this.userName=user.name;
                this.userEmailId=user.email;
            // }
          })
    let user = 'DPPPortal'
    let pass = 'L0C4LACC3ZZ'
    // let headers = httpRequest.headers.delete('Authorization', httpRequest.headers.get('Authorization'))
    let  headers = httpRequest.headers.set('Content-Type', 'application/json')
    headers = httpRequest.headers.delete('Authorization', httpRequest.headers.get('Authorization'))
    headers = headers.set('access-token', String(access_token))
    headers = headers.set('user-perf-lang', selectedLang)
    headers = headers.set('user-id', this.userId)
    headers = headers.set('user-name', this.userEmailId)
    headers = headers.set('user-email-id', this.userEmailId)
    //headers = headers.set('Authorization', 'Basic' + ' ' + btoa(user + ":" + pass))
    requestType == 'add' || requestType == 'edit' || requestType == 'delete' ? headers = headers.set('signature', sign) : '';

    if (this.reportType != undefined && this.reportType != null && this.reportType != "") {
      this.resourceId != null && this.resourceId != undefined && this.pageCall == false ? headers = headers.set('resource-id', this.resourceId + "." + this.reportType) : ''
    } else if (this.roleCall == true) {
      this.resourceId != null && this.resourceId != undefined && this.roleCall == true ? headers = headers.set('resource-id', this.resourceId + '.ROLES') : ''
    }

    else {
      this.resourceId != null && this.resourceId != undefined && this.pageCall == false ? headers = headers.set('resource-id', this.resourceId) : ''
    }
    let modifiedReq = httpRequest.clone({
      headers: headers
    });
    //console.log('modifiedReq', modifiedReq)
    return next.handle(modifiedReq);
  }
}