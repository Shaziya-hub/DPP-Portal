import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ChannelHandlerComponent } from "./channel-handler.component";

const routes: Routes = [{ path: '', component: ChannelHandlerComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ChannelHandlerRoutingModule {

    
}