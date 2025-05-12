import { Injectable } from "@angular/core";
import { LoaderService } from "src/app/services/loader.service";
import { RestApiService } from "src/app/services/rest-api.service";

@Injectable()
export class AdvancedControlService {
    constructor(private loader: LoaderService, private apiService: RestApiService) { }

    checkAdvanceControls(url, parameter, headerConfig) {
        this.loader.show();
        return this.apiService.getOrUpdateData(url, parameter, headerConfig);
    }

    updateAdvanceControls(url, parameter, headerConfig) {
        this.loader.show();
        return this.apiService.getOrUpdateData(url, parameter, headerConfig);
    }
}