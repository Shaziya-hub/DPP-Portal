import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class RowDetailsService {
    roleData = new Subject<any>();
    resourceDataLength = new Subject<any>();
    userPreviousData = new Subject<any>();
    // removeElement=new Subject<any>();
    setUserOnApply: BehaviorSubject<any> = new BehaviorSubject(null);
    getUserRoleOnApply: Observable<any> = this.setUserOnApply.asObservable();


    setRoleAndFlag: BehaviorSubject<any> = new BehaviorSubject(null);
    gettRoleAndFlagOnChange: Observable<any> = this.setRoleAndFlag.asObservable();
    serverListCount: BehaviorSubject<any> = new BehaviorSubject(null);
    countServerPermission$: Observable<any> = this.serverListCount.asObservable();
    rowDetailSource: BehaviorSubject<any> = new BehaviorSubject(null);
    rowDetail$: Observable<any> = this.rowDetailSource.asObservable();
    rowRoleDetailSource: BehaviorSubject<any> = new BehaviorSubject(null);
    rowRoleDetail$: Observable<any> = this.rowRoleDetailSource.asObservable();
    roleTempData: BehaviorSubject<any> = new BehaviorSubject(null);
    tempSelectedList$: Observable<any> = this.roleTempData.asObservable();
    removeElement: BehaviorSubject<any> = new BehaviorSubject(null);
    uniqueElement$: Observable<any> = this.removeElement.asObservable();
    tempSetRoles: BehaviorSubject<any> = new BehaviorSubject(null);
    tempSelectedRole$: Observable<any> = this.tempSetRoles.asObservable();

    roleAndResources: BehaviorSubject<any> = new BehaviorSubject(null);

    setRowDetail(detail: any) {
        this.rowDetailSource.next(detail);
    }
    setRoleRowDetail(detail: any) {
        this.rowRoleDetailSource.next(detail);
    }
    setSelectedRole(role: any) {
        this.tempSetRoles.next(role);
    }

    setUniqueRoleId(roleId: any) {
        this.removeElement.next(roleId)
    }
    setlistOfTempRole(tempRole: any) {
        this.roleTempData.next(tempRole)
    }

    setServerCount(count: any) {
        this.serverListCount.next(count)
    }
    setRoleANdFlagOnChange(userSelectedChangeList: any) {
        this.setRoleAndFlag.next(userSelectedChangeList)
    }
    setUserROleOnApply(setListOnApply: any) {
        this.setUserOnApply.next(setListOnApply)
    }
}