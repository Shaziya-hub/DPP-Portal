import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { LoaderService } from './loader.service';
import { RestApiService } from './rest-api.service';
import { StoreService } from './store.service';

@Injectable()
export class PageConfigService {
    userId: string;
    constructor(private service: RestApiService, private loaderService: LoaderService, private route: ActivatedRoute, private store: StoreService) {
        this.store.user.subscribe(user => {
            this.userId = user.id;
        })
    }
    resolve(
        route: ActivatedRouteSnapshot,
    ): Observable<any> | Promise<any> | any {
        const params: any = {
            //  userId: this.userId =="768c5dcf-daf1-4b4e-adad-cf818cd57673"?'U10001':this.userId,
            // userId: this.userId =="26e2ae3a-3878-402f-a50a-8b49769ead7d"?'U10001':this.userId,
            userId: this.userId == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc" ? 'aee080f6-77f4-4c95-bbac-1748848e9a04' : this.userId,
            //userId: this.userId == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc"?'e4c2663e-0b3e-4ae7-b422-23056daca522':this.userId,
            resourceId: route.queryParams.pageId

        };
        this.loaderService.show();
        return this.service.getPageConfig(params);
    }

    getData() {
        const params: any = {
            // userId:this.userId =="768c5dcf-daf1-4b4e-adad-cf818cd57673"?'U10001':this.userId,  //this.userId,//'U10001',
            // userId:this.userId =="26e2ae3a-3878-402f-a50a-8b49769ead7d"?'U10001':this.userId,
            userId: this.userId == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc" ? 'aee080f6-77f4-4c95-bbac-1748848e9a04' : this.userId,
            //   userId: this.userId == "c86fb5a3-5498-4176-b240-ec4ff5ab4adc"?'e4c2663e-0b3e-4ae7-b422-23056daca522':this.userId,
            resourceId: this.route.queryParams.subscribe(params => params.pageId)
        };
        this.loaderService.show();
        return this.service.getPageConfig(params);
    }
}