import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { DataGridComponent } from './data-grid/data-grid.component';
import { AccessControlFilterComponent } from './filters/access-filter/access-control-filter.component';
import { ParametersFilterComponent } from './filters/parameters-filter/parameters-filter.component';
import { ParametersModalComponent } from './parameters-modal/parameters-modal.component';
import { LimitsLocksFilterComponent } from './filters/limitlock-filter/limitslocks-filter.component';
import { LimitslocksModalComponent } from './limitslocks-modal/limitslocks-modal.component';
import { ProcessorConfigComponent } from './filters/processorconfig-filter/processorconfig-filter.component';
import { DetailGridComponent } from './detail-grid/detail-grid.component';
import { ProcessorConfigModalComponent } from './processorconfig-modal/processorconfig-modal.component';
import { ProcessorconfigDetailModalComponent } from './processorconfigdetail-modal/processorconfigdetail-modal.component';
import { PaginationModule } from 'src/app/shared/pagination.module';
import { NgbCollapseModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FiltersComponent } from './filters/filters.component';
import { EndPointsComponent } from './filters/endpoints-filter/endpoints.component';
import { EndPointsModalComponent } from './endpoints-modal/endpoints-modal.component';
import { AdvancedControlComponent } from './advanced-control/advanced-control.component';
import { AdvancedControlFilterComponent } from './filters/advanced-control-filter/advanced-control-filter.component';
import { AdvancedControlModalComponent } from './advanced-control-modal/advanced-control-modal.component';
import { DateTimepickerModule } from 'src/app/components/dateTimepicker/dateTimepicker.module';
import { MasterDataComponent } from './filters/masterdata-filter/masterdata-filter.component';
import { ParametersModalService } from './parameters-modal/parameters-modal.service';
import { DragScrollModule } from 'ngx-drag-scroll';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonHeadingModule } from 'src/app/shared/common-heading.module';

@NgModule({
    declarations: [DataGridComponent, DetailGridComponent, AccessControlFilterComponent, ParametersFilterComponent, ParametersModalComponent, LimitsLocksFilterComponent, LimitslocksModalComponent, ProcessorConfigComponent, ProcessorConfigModalComponent, ProcessorconfigDetailModalComponent, FiltersComponent, EndPointsComponent, EndPointsModalComponent, AdvancedControlComponent, AdvancedControlFilterComponent, AdvancedControlModalComponent,
        MasterDataComponent],
    imports: [CommonModule, PaginationModule, NgbPaginationModule, NgbCollapseModule, DxDataGridModule, DxTemplateModule, AngularMultiSelectModule, FormsModule, TranslateModule, DateTimepickerModule, DragScrollModule, BsDropdownModule.forRoot(), CommonHeadingModule],
    exports: [DataGridComponent, DetailGridComponent, AccessControlFilterComponent, ParametersFilterComponent, ParametersModalComponent, LimitsLocksFilterComponent, LimitslocksModalComponent, ProcessorConfigComponent, ProcessorConfigModalComponent, ProcessorconfigDetailModalComponent, FiltersComponent, EndPointsComponent, EndPointsModalComponent, AdvancedControlComponent, AdvancedControlFilterComponent, AdvancedControlModalComponent, MasterDataComponent],
    providers: [ParametersModalService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {

}