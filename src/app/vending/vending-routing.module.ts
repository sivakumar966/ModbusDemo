import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendingPage } from './vending.page';

const routes: Routes = [
  {
    path: '',
    component: VendingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendingPageRoutingModule {}
