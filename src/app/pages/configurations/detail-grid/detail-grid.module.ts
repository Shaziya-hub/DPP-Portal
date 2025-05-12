import { NgModule } from "@angular/core";
import { DxDataGridModule, DxTemplateModule } from "devextreme-angular";
import { SharedModule } from "../shared.module";
import { DetailGridComponent } from "./detail-grid.component";

@NgModule({
  declarations: [
    DetailGridComponent
  ],
  imports: [
    SharedModule,
    DxDataGridModule,
    DxTemplateModule
  ],
  exports: [DetailGridComponent]
})
export class DetailGridModule { }
