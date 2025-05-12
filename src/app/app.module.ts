import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColumnSettingsModalService } from './components/column-settings/column-settings-modal.service';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './components/confirmation-dialog/confirmation-dialog.service';
import { DownloadManagerService } from './components/download-manager/download-manager.service';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { Interceptor } from './interceptor/interceptor';
import { AdvancedControlModalService } from './pages/configurations/advanced-control-modal/advanced-control-modal.service';
import { AdvancedControlService } from './pages/configurations/advanced-control/advanced-control.service';
import { EndPointModalService } from './pages/configurations/endpoints-modal/endpoints-modal.service';
import { LimitslocksModalService } from './pages/configurations/limitslocks-modal/limitslocks-modal.service';
import { ParametersModalService } from './pages/configurations/parameters-modal/parameters-modal.service';
import { ProcessorConfigModalService } from './pages/configurations/processorconfig-modal/processorconfig-modal.service';
import { ProcessorconfigDetailModalService } from './pages/configurations/processorconfigdetail-modal/processorconfigdetail-modal.service';
import { ManageResourcesModalService } from './pages/identityManagement/manage-resources-modal/manage-resources-modal.service';
import { KAuthService } from './services/KeycloackAuthService';
import { PageConfigService } from './services/page-config.service';
import { RestApiService } from './services/rest-api.service';
import { SharedService } from './services/shared.service';
import { SideMenuService } from './services/side-menu.service';
import { initializeKeycloack } from './utility/app.init';
//import { ChannelHandlerComponent } from './pages/channel-handler/channel-handler.component';
import { ChannelHandlerModule } from './pages/channel-handler/channel-handler.module';
import { SuccessModule } from './pages/channel-handler/success/success.module';
import { DashboardPaymentModalService } from './pages/dashboard/payment-modal/payment-modal.service';
import { ScriptLoaderService } from 'angular-google-charts';
//import { LoggerModule } from './pages/transactions/logger/logger.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { HomeComponent } from './components/home/home.component';
import { GenerateInvoiceModalService } from './pages/operations/generate-invoice-modal/genereate-invoice-modal.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ExcelServicesService } from './services/excel.service';

@NgModule({
  declarations: [
    AppComponent,
    SideMenuComponent,
    HeaderComponent,
    ConfirmationDialogComponent,
    FooterComponent,
    HomeComponent


    //DataGridComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    KeycloakAngularModule,
 TooltipModule.forRoot(),
    // ChannelHandlerModule,
    SuccessModule,
    //LoggerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgbModule,
    BsDropdownModule
  ],
  exports: [],
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloack,
      multi: true,
      deps: [KeycloakService]
    },
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    KAuthService,
    SideMenuService,
    RestApiService,
    ConfirmationDialogService,
    PageConfigService,
    Title,
    DownloadManagerService,
    ColumnSettingsModalService,
    ParametersModalService,
    LimitslocksModalService,
    ProcessorConfigModalService,
    ProcessorconfigDetailModalService,
    AdvancedControlModalService,
    EndPointModalService,
    AdvancedControlService,
    ManageResourcesModalService,
    DashboardPaymentModalService,
    GenerateInvoiceModalService,
    ScriptLoaderService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    SharedService,
    ExcelServicesService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}
