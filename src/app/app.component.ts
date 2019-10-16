import { Component } from '@angular/core';
import { Platform, NavController, IonicApp, App, ToastController, Nav } from 'ionic-angular';
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
import { Network } from '@ionic-native/network';
declare var google: google;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any

    // set up hardware back button event.
    lastTimeBackPress = 0;
    timePeriodToExit = 2000;
  constructor(public platform: Platform,
    public statusBar: StatusBar,
    splashScreen: SplashScreen,
    private screenOrien: ScreenOrientation,
    public store: Storage,
    public toastCtrl: ToastController,
    public network: Network,
    public app: App) {
    statusBar.backgroundColorByHexString('#D28B2B');

    platform.ready().then(async () => {
      let checkDownLinkSpeed = this.network.downlinkMax
      setTimeout(()=> {
        console.log(checkDownLinkSpeed);
      }, 3000)

      this.initialiseApp();
      firebase.initializeApp(firebaseConfig);
      // platform.backButton.subscribe(res => {
      // })
      if (platform.is('android')) {
        // screenOrien.lock(this.screenOrien.ORIENTATIONS.PORTRAIT);
      }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      setTimeout(() => {

      }, 2000)
      console.log('Checking if onboarding was done');
      // this.store.clear()
      this.store.get('onboarding').then((res) => {
        if (res) {
          console.log('Onboarding done');

          console.log('Checking if user logged in');
          firebase.auth().onAuthStateChanged(user => {

            if (user) {
              console.log('user logged in');

              setTimeout(()=>{
                // splashScreen.hide();
              }, 3000)
              this.rootPage = TabsPage;

            } else {
              console.log('user logged in');

              setTimeout(()=>{
                // splashScreen.hide();
              }, 3000)
              this.rootPage = LoginPage;

            }
          })
        } else {
          console.log('Onboarding not done');

          setTimeout(()=>{
            // splashScreen.hide();
          }, 3000)
          this.rootPage = OnBoardingPage;
        }
      })
    });

  }
  initialiseApp() {
    this.platform.registerBackButtonAction(() => {
      console.log(this.app.getActiveNav());

      if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
                this.platform.exitApp(); // Exit from app
                // navigator['app'].exitApp(); // work in ionic 4
            } else {
                this.toastCtrl.create({
                  message: 'Press back again to exit App.',
                  duration: 2000
                }).present();
                this.lastTimeBackPress = new Date().getTime();
                  }
  });
  }
}
