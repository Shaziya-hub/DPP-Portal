import { CommonModule, DatePipe } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgModule } from '@angular/core';
import { ChannelHandlerComponent } from "./channel-handler.component";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ChannelHandlerRoutingModule } from "./channel-handler-routing.module";
@NgModule({

    declarations: [ ChannelHandlerComponent],
    imports:[
        CommonModule,
        FormsModule,
        TranslateModule,
        ChannelHandlerRoutingModule
    ],
    exports : [ChannelHandlerComponent],
    providers: [
        DatePipe
      ],
})

export class ChannelHandlerModule{

}