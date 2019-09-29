import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { YouPage } from './you';

@NgModule({
  declarations: [
    YouPage,
  ],
  imports: [
    IonicPageModule.forChild(YouPage),
  ],
})
export class YouPageModule {}
