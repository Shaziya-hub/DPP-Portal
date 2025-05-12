import { PaginationComponent } from "../components/pagination/pagination.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';


@NgModule({
    declarations: [
        PaginationComponent

    ],
    imports: [
        CommonModule,
        NgbPaginationModule,
        BsDropdownModule


    ],
    exports: [PaginationComponent],

    providers: [],
})

export class PaginationModule { }
