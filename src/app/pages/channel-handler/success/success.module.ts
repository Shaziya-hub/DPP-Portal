import { CommonModule } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgModule } from '@angular/core';

import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { SuccessComponent } from "./success.component";
import { RouterModule } from '@angular/router';

@NgModule({

    declarations: [ SuccessComponent],
    imports:[
        CommonModule,
        FormsModule,
        TranslateModule,
        RouterModule
    ],
    exports : [SuccessComponent],
    
})

export class SuccessModule{

}