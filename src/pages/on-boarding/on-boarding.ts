import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { RegisterPage } from '../register/register';
import { Storage } from "@ionic/storage";
import { SplashScreen } from '@ionic-native/splash-screen';
@IonicPage()
@Component({
  selector: 'page-on-boarding',
  templateUrl: 'on-boarding.html',
})
export class OnBoardingPage {
  @ViewChild('slides') slides: Slides
  constructor(public navCtrl: NavController,private splashScreen: SplashScreen, public navParams: NavParams, private storage: Storage) {
  }

  ionViewDidLoad() {
    // this.slides.effect = 'cube';
    this.slides.speed = 700;
    // this.slides.lockSwipes(true);
    // this.storage.clear()
    this.storage.get('onboarding').then((res) => {
      if (res) {
        this.splashScreen.hide()
        this.navCtrl.setRoot(LoginPage);
      } else {
        this.splashScreen.hide()
      }
    })
  }
  nextslides(){
    // this.slides.lockSwipes(false);
    this.slides.slideNext();
    // this.slides.lockSwipes(true);
  }
  formPage(val) {
    this.storage.set('onboarding', true);
    if (val == 0) {
      this.navCtrl.setRoot(LoginPage);
    } else {
      this.navCtrl.setRoot(RegisterPage);
    }
  }
}
