import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OnBoardingPage } from './on-boarding';

@NgModule({
  declarations: [
    OnBoardingPage,
  ],
  imports: [
    IonicPageModule.forChild(OnBoardingPage),
  ],
})
export class OnBoardingPageModule {}
