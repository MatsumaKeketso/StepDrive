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
import { Http } from '@angular/http';
import { ElementRef, Renderer2 } from '@angular/core';


@IonicPage()
@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html',
})
export class QuizPage {
  db = firebase.firestore()
  landing  = true;
  @ViewChild('slide') slides: Slides;
  grandTotal = 0;
  questions = []
  lightmotoQuiz = []
  heavyMotorQuiz = []
  motorcycleQuiz = []
  constructor(public navCtrl: NavController, public navParams: NavParams, public appCtrl: App, private http: Http, public elementrev: ElementRef, public renderer: Renderer2) {}
  async ionViewDidLoad() {
    this.http.get('../../assets/quiz.json').subscribe(data => {

      this.heavyMotorQuiz = data.json().hmv.questions
      this.motorcycleQuiz = data.json().m.questions
    })
    this.questions = []
  this.lightmotoQuiz = [];
    this.slides.lockSwipes(true);this.grandTotal = 0;
    this.db.collection('questions').get().then(async res => {
      res.forEach( async doc => {
        this.lightmotoQuiz.push(doc.data());
      })
    })

  }
  start() {
    this.landing = false;
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
  sendQs(category, ev) {
    let path = ev.path[0]
    switch (category) {
      case "lmv":
      this.questions = []
      setTimeout(()=> {
        this.renderer.setStyle(path, 'transform', 'scale(1.05)');
      },100)
      setTimeout(() => {
        this.renderer.setStyle(path, 'transform', 'scale(1)');
      }, 500)
      do {
        const random = Math.floor(Math.random() * this.lightmotoQuiz.length)
        this.questions.push(this.lightmotoQuiz[random])
      } while (this.questions.length < 5);
      setTimeout(() => {
        this.start()
      }, 100)
        break;
        case "hmv":
            this.questions = []
            setTimeout(()=> {
              this.renderer.setStyle(path, 'transform', 'scale(1.05)');
            },100)
            setTimeout(() => {
              this.renderer.setStyle(path, 'transform', 'scale(1)');
            }, 500)
            do {
        const random = Math.floor(Math.random() * this.heavyMotorQuiz.length)
        this.questions.push(this.heavyMotorQuiz[random])
      } while (this.questions.length < 5);
      console.log('Qs to disp: ', this.questions);
      setTimeout(() => {
        this.start()
      }, 100)
          break;
          case "m":
              this.questions = []
              setTimeout(()=> {
                this.renderer.setStyle(path, 'transform', 'scale(1.05)');
              },100)
              setTimeout(() => {
                this.renderer.setStyle(path, 'transform', 'scale(1)');
              }, 500)
            do {
              const random = Math.floor(Math.random() * this.motorcycleQuiz.length)
              this.questions.push(this.motorcycleQuiz[random])
            } while (this.questions.length < 5);
            console.log('Qs to disp: ', this.questions);
            setTimeout(() => {
              this.start()
            }, 100)
            break;
            case "tmv":
                this.questions = []
                setTimeout(()=> {
                  this.renderer.setStyle(path, 'transform', 'scale(1.05)');
                },100)
                setTimeout(() => {
                  this.renderer.setStyle(path, 'transform', 'scale(1)');
                }, 500)
              do {
                const random = Math.floor(Math.random() * this.heavyMotorQuiz.length)
                this.questions.push(this.heavyMotorQuiz[random])
              } while (this.questions.length < 5);
              console.log('Qs to disp: ', this.questions);
              setTimeout(() => {
                this.start()
              }, 100)
            break;

      default:
        break;
    }
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
