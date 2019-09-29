import { Component } from '@angular/core';
import { Platform, NavController, IonicApp, App, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { firebaseConfig } from '../app/Enveronment';
import * as firebase from 'firebase';
import { OnBoardingPage } from '../pages/on-boarding/on-boarding';
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import {google} from 'google-maps';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
declare var google: google;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    splashScreen: SplashScreen,
    private screenOrien: ScreenOrientation,
    public storage: Storage,
    public toastCtrl: ToastController,
    public app: App) {
    statusBar.backgroundColorByHexString('#D28B2B');

    platform.ready().then(async () => {
      this.initialiseApp()
      platform.backButton.subscribe(res => {
        console.log('back Clicked');

      })
      if (platform.is('android')) {
        // screenOrien.lock(this.screenOrien.ORIENTATIONS.PORTRAIT);
      }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      setTimeout(() => {

      }, 2000)
      console.log('Checking if onboarding was done');
      this.storage.get('onboarding').then((res) => {
        if (res) {
          console.log('Onboarding done');

          console.log('Checking if user logged in');
          firebase.auth().onAuthStateChanged(user => {

            if (user) {
              console.log('user logged in');

              splashScreen.hide();
              this.rootPage = TabsPage;

            } else {
              console.log('user logged in');

              splashScreen.hide();
              this.rootPage = LoginPage;

            }
          })
        } else {
          console.log('Onboarding not done');

          splashScreen.hide();
          this.rootPage = OnBoardingPage;
        }
      })
    });
    firebase.initializeApp(firebaseConfig);
  }
  initialiseApp() {
    this.platform.registerBackButtonAction(() => {
      // Catches the active view
      let nav = this.app.getActiveNavs()[0];
      let activeView = nav.getActive();

      // Checks if can go back before show up the alert
      if(activeView.name === 'HomePage' || activeView.name === 'ContactPage') {
          if (nav.canGoBack()){
              nav.pop();
          } else {
            let exittor = false;

            if (exittor) {
              this.platform.exitApp();
            } else {

            exittor = true
            console.log(exittor);

              this.toastCtrl.create({
                message: 'Press again to exit app.',
                duration: 2000
              })
            }

          }
      }
  });
  }
}
