import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AuthGuard } from '@guards/auth.guard'

import { DashboardComponent } from '@components/dashboard/dashboard.component'
import { IndexComponent } from '@components/index/index.component'
import { MicrocontrollersComponent } from '@components/microcontrollers/microcontrollers.component'
import { AnalyticsComponent } from '@components/analytics/analytics.component'
import { DeviceHealthComponent } from '@components/device-health/device-health.component'

const routes: Routes = [
  { canActivate: [ AuthGuard ], component: DashboardComponent, path: 'dashboard' },
  { canActivate: [ AuthGuard ], component: AnalyticsComponent, path: 'analytics' },
  { canActivate: [ AuthGuard ], component: MicrocontrollersComponent, path: 'my-microcontrollers' },
  { canActivate: [ AuthGuard ], component: DeviceHealthComponent, path: 'health' },
  { component: IndexComponent, path: '' }
]

@NgModule({
  exports: [
    RouterModule
  ],
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    })
  ]
})
export class AppRoutingModule { }
