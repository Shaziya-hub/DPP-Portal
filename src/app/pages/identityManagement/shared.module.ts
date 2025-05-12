import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { DataGridComponent } from './data-grid/data-grid.component';
import { NgbCollapseModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FiltersComponent } from './filter/filters.component';
import { UsersFilterComponent } from './filter/users-filter/users-filter.component';
import { ManageResourcesModalComponent } from './manage-resources-modal/manage-resources-modal.component';
import { UsersComponent } from './filter/users/users.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { RolesComponent } from './filter/roles/roles.component';
import { RolesFilterComponent } from './filter/roles-filter/roles-filter.component';
import { MatchPasswordDirective } from './filter/users/match-password.directive';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { DetailGridComponent } from './detail-grid/detail-grid.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';
import { NoSpaceDirective } from 'src/app/components/no_space_directive/no_space.directive';

@NgModule({
    declarations: [DataGridComponent, UsersFilterComponent, FiltersComponent, UsersComponent, ManageResourcesModalComponent, RolesComponent, RolesFilterComponent, MatchPasswordDirective, DetailGridComponent, NoSpaceDirective],
    imports: [CommonModule, NgbPaginationModule, NgbCollapseModule, DxDataGridModule, DxTemplateModule, FormsModule, TranslateModule, AngularMultiSelectModule, TooltipModule.forRoot(), PaginationModule, DragScrollModule, NgxSpinnerModule, BsDropdownModule.forRoot(), CommonHeadingModule],
    exports: [DataGridComponent, UsersFilterComponent, FiltersComponent, UsersComponent, ManageResourcesModalComponent, RolesComponent, RolesFilterComponent, MatchPasswordDirective, DetailGridComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule {

}