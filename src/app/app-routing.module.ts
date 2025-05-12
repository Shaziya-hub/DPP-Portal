import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportComponent } from './pages/report/report.component';
import { ChannelHandlerComponent } from './pages/channel-handler/channel-handler.component';
import { PageConfigService } from './services/page-config.service';
import { AuthGuard } from './utility/app.gard';
import { SuccessComponent } from './pages/channel-handler/success/success.component';
import { HomeComponent } from './components/home/home.component';


//import { LoggerComponent } from './pages/transactions/logger/logger.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'DPP',
  pathMatch: 'full',
}, { path: 'DPP', component: HomeComponent },
{
  path: 'dpp/inbox', canActivate: [AuthGuard],
  children: [
    {
      path: 'refunds', loadChildren: () => import('./pages/inbox/inbox.module').then(m => m.InboxModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},
{
  path: 'dpp/trx', canActivate: [AuthGuard],
  children: [
    {
      path: 'payments', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'bills', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'accounts', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'nonsadadpmt', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'refunds', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'batches', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'einvoices', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'payouts', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsModule),
      resolve: {
        config: PageConfigService
      }
    }
   
  ],
},
{
  path: 'dpp/conf', canActivate: [AuthGuard],
  children: [
    {
      path: 'accesscontrol', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'parameters', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'limitslocks', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'processconfig', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'endpoints', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'advaccesscontrol', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'masterdata', loadChildren: () => import('./pages/configurations/configurations.module').then(m => m.ConfigurationsModule),
      resolve: {
        config: PageConfigService
      }
    }
  ],
},



{
  path: 'dpp/uploads', canActivate: [AuthGuard],
  children: [
    {
      path: 'nonsadadpmts', loadChildren: () => import('./pages/uploads/uploads.module').then(m => m.UploadsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'bills', loadChildren: () => import('./pages/uploads/uploads.module').then(m => m.UploadsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'accounts', loadChildren: () => import('./pages/uploads/uploads.module').then(m => m.UploadsModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},

{
  path: 'dpp/settlement', canActivate: [AuthGuard],
  children: [
    {
      path: 'payments', loadChildren: () => import('./pages/settlement/settlement.module').then(m => m.SettlementModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},
{
  path: 'dpp/recon', canActivate: [AuthGuard],
  children: [
    {
      path: 'pmts', loadChildren: () => import('./pages/reconciliation/reconciliation.module').then(m => m.ReconciliationModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'logs', loadChildren: () => import('./pages/reconciliation/reconciliation.module').then(m => m.ReconciliationModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'enterpriselogs', loadChildren: () => import('./pages/reconciliation/reconciliation.module').then(m => m.ReconciliationModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},
{
  path: 'dpp/idm', canActivate: [AuthGuard],
  children: [
    {
      path: 'users', loadChildren: () => import('./pages/identityManagement/identityManagement.module').then(m => m.IdentityManagementModule),
      resolve: {
        config: PageConfigService
      },
    },
    {
      path: 'userDetails', loadChildren: () => import('./pages/identityManagement/identityManagement.module').then(m => m.IdentityManagementModule),
      // resolve: {
      //   config: PageConfigService
      // },
    },
    {
      path: 'roles', loadChildren: () => import('./pages/identityManagement/identityManagement.module').then(m => m.IdentityManagementModule),
      resolve: {
        config: PageConfigService
      },
    },
    {
      path: 'rolesDetails', loadChildren: () => import('./pages/identityManagement/identityManagement.module').then(m => m.IdentityManagementModule),
      // resolve:{
      //   config: PageConfigService
      // }
    }
  ],
},

{
  path: 'dpp/reports', canActivate: [AuthGuard],
  children: [
    {
      path: 'standardreports', loadChildren: () => import('./pages/report/report.module').then(m => m.ReportModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},
{
  path: 'dpp/dashboard', canActivate: [AuthGuard],
  children: [
    {
      path: 'payments', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'bills', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},
{
  path: 'dpp/operations', canActivate: [AuthGuard],
  children: [
    {
      path: 'initiaterefunds', loadChildren: () => import('./pages/operations/operations.module').then(m => m.OperationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'refundprocess', loadChildren: () => import('./pages/operations/operations.module').then(m => m.OperationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'refundprocess', loadChildren: () => import('./pages/operations/operations.module').then(m => m.OperationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'reviewrefunds', loadChildren: () => import('./pages/operations/operations.module').then(m => m.OperationsModule),
      resolve: {
        config: PageConfigService
      }
    },
    {
      path: 'generateinvoices', loadChildren: () => import('./pages/operations/operations.module').then(m => m.OperationsModule),
      resolve: {
        config: PageConfigService
      }
    },
  ],
},
{
  path: 'dpp/chnlhndlr', canActivate: [AuthGuard],
  children: [
    {
      path: 'channelhandler', loadChildren: () => import('./pages/channel-handler/channel-handler.module').then(m => m.ChannelHandlerModule),
      // resolve: {
      //   config: PageConfigService
      // }
    },
  ],
},
{ path: 'permission-denied', loadChildren: () => import('./components/permission-denied/permission-denied.module').then(m => m.PermissionDeniedModule), canActivate: [AuthGuard] },
{ path: 'payment-status', component: SuccessComponent },

//{ path: 'logger',component: LoggerComponent},
{ path: '**', redirectTo: 'DPP' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
