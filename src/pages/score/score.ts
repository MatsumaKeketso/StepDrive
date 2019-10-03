import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { QuizPage } from '../quiz/quiz';
import { HomePage } from '../home/home';

// import { DataStoreProvider} from '../../providers/datastore';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-score',
  templateUrl: 'score.html',
})
export class ScorePage {

  title:string;
  results: number = 0;
  text:string;
  pass = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
   this.results = this.navParams.data;
   if(this.results < 80){
     this.title = "Oh boy :("
    this.text = "There are some things you did not  get right";
    this.pass = false;
  }else{
    this.title= "Well Done!"
    this.text = "Goodluck with your lesson for tommrow"
    this.pass = true;
  }
  console.log('You passed? ', this.pass);
  }
  quiz(){
    this.navCtrl.setRoot(QuizPage)
  }
home(){
  this.navCtrl.setRoot(TabsPage)
}
}
