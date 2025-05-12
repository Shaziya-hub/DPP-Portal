import { PaginationComponent } from "../components/pagination/pagination.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonHeadingComponent } from "./common-heading/common-heading.component";
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
    declarations: [
        CommonHeadingComponent

    ],
    imports: [
        CommonModule,
        TranslateModule,


    ],
    exports: [CommonHeadingComponent],

    providers: [],
})

export class CommonHeadingModule { }
