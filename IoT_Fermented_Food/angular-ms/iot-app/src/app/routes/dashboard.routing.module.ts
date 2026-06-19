import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AuthGuard } from '@guards/auth.guard'

import { DashboardComponent } from '@components/dashboard/dashboard.component'
import { MeasureHistoryComponent } from '@components/measure-history/measure-history.component'
import { PicturesHistoryComponent } from '@components/pictures-history/pictures-history.component'

const routes: Routes = [
  { canActivate: [AuthGuard], component: DashboardComponent, path: '' },
  { canActivate: [AuthGuard], component: DashboardComponent, path: 'measure/:measure' },
  { canActivate: [AuthGuard], component: MeasureHistoryComponent, path: 'history/:ip/:measure' },
  { canActivate: [AuthGuard], component: PicturesHistoryComponent, path: 'history-pictures/:ip' }
]

@NgModule({
  exports: [
    RouterModule
  ],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class DashboardRoutingModule { }
