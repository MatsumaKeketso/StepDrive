import {
  Component,
  ViewChild
} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  Slides,
  App
} from 'ionic-angular';
import {
  ScorePage,

} from '../score/score';
import * as firebase from 'firebase';
import { TabsPage } from '../tabs/tabs';


@IonicPage()
@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html',
})
export class QuizPage {
  db = firebase.firestore()
  landing = {
    active: true,
    inactive: false
  }
  @ViewChild('slide') slides: Slides;
  grandTotal = 0;
  questions = []
  Qs = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public appCtrl: App) {}
  async ionViewDidLoad() {
    this.questions = []
  this.Qs = [];
    this.slides.lockSwipes(true);this.grandTotal = 0;
    await this.db.collection('questions').get().then(async res => {
      await res.forEach( async doc => {
        await this.Qs.push(doc.data());
      })
      console.log('Qs from fire: ', this.Qs.length);

      do {
        const random = Math.floor(Math.random() * this.Qs.length)
        this.questions.push(this.Qs[random])
      } while (this.questions.length < 5);
      console.log('Qs to disp: ', this.questions);

    })

  }
  start() {
    this.landing.inactive = true;
  }
  cancel(){
    this.navCtrl.pop()
  }
  checkAnswer(value) {
    console.log(value);
    if(this.slides.isEnd()) {
      if (value) {
        this.grandTotal += 20;
        this.navCtrl.setRoot(ScorePage, this.grandTotal)
      } else {
        this.navCtrl.setRoot(ScorePage, this.grandTotal)
      }
    } else {
      if (value) {
        this.grandTotal += 20;
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.slides.lockSwipes(true);
      } else {
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.slides.lockSwipes(true);
      }
    }
  }
  sendQs() {

  }
  results(): void {}
}
export interface QUESTION {
  question: string;
  options: [{
      option: string,
      correct: boolean
    },
    {
      option: string,
      correct: boolean
    },
    {
      option: string,
      correct: boolean
    },
    {
      option: string,
      correct: boolean
    }
  ]
}
