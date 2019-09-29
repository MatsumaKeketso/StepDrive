import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoverQuizPage } from './cover-quiz';

@NgModule({
  declarations: [
    CoverQuizPage,
  ],
  imports: [
    IonicPageModule.forChild(CoverQuizPage),
  ],
})
export class CoverQuizPageModule {}
