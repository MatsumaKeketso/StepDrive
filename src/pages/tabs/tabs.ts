import { Component, ViewChild, ElementRef } from '@angular/core';
import { HomePage } from '../home/home';
import { QuizPage } from '../quiz/quiz';
import { YouPage } from '../you/you';
import { NavController, Tabs, AlertController, App, Tab } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { Question4Page } from '../question4/question4';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs') tabs: Tabs;
  tab1Root = HomePage;
  tab2Root = QuizPage;
  tab3Root = YouPage;
  tab4Root = ProfilePage;
  tab5Root = Question4Page;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public appCtrl: App, public elementref: ElementRef) {
    console.log('tabs elementref', this.elementref);

  }
  async quizpage(event: Tab){
    if (event.tabTitle == 'Quiz') {
      console.log('Quiz Page');
this.alertCtrl.create({
      title: 'Start Quiz?',
      message: 'This quiz is a quick recap before the driving lesson. Do you want to Start?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {

          }
        },
        {
          text: 'No',
          handler: () => {
            this.navCtrl.setRoot(TabsPage)
          }
        }
      ]
    }).present()
    }


  }
}
