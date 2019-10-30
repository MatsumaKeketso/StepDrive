import { Component } from '@angular/core';
import { Platform, App, ToastController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { firebaseConfig } from '../app/Enveronment';
import * as firebase from 'firebase';
import { OnBoardingPage } from '../pages/on-boarding/on-boarding';
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import {google} from 'google-maps';

import { TabsPage } from '../pages/tabs/tabs';
import { Network } from '@ionic-native/network';
import { YouPage } from '../pages/you/you';
declare var google: google;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any

    // set up hardware back button event.
    lastTimeBackPress = 0;
    timePeriodToExit = 2000;
    disconnectSubscription;
    connectSubscription;
  constructor(public platform: Platform,
    public statusBar: StatusBar,
    private screenOrien: ScreenOrientation,
    public store: Storage,
    public toastCtrl: ToastController,
    public network: Network,
    public alertCtrl: AlertController,
    public app: App) {
    statusBar.backgroundColorByHexString('#D28B2B');
    this.network.onchange().subscribe((res)=>{
      console.log('Network changed to ', res);

    }, err => {
      console.log('Network errored to ', err);
    })

    platform.ready().then(async () => {
      this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
        this.alertCtrl.create({
          message: 'Network was disconnected.',
          buttons:[{
            text: "Close App",
            handler: () => {
              this.stopNetworkWatch();
            }
          }]
        }).present()
      });
      this.connectSubscription = this.network.onConnect().subscribe(() => {
        // We just got a connection but we need to wait briefly
         // before we determine the connection type. Might need to wait.
        // prior to doing any api requests as well.
        setTimeout(() => {
          if (this.network.type === 'wifi') {
            this.toastCtrl.create({
              message: `Connected to a ${this.network.type} network.`,
              duration: 2000
            }).present()
          } else if (this.network.type === 'unknown') {
            this.toastCtrl.create({
              message: `Connected to an ${this.network.type} network.`,
              duration: 2000
            }).present()
          } else if (this.network.type === '2g'||this.network.type === '3g'||this.network.type === '4g') {
            this.toastCtrl.create({
              message: `Connected to a ${this.network.type} network.`,
              duration: 2000
            }).present()
          } else if (this.network.type === 'cellular') {
            this.toastCtrl.create({
              message: `Connected to a ${this.network.type} network.`,
              duration: 2000
            }).present()
          } else {
            this.alertCtrl.create({
               title:'Network Error',
              message: 'Slow network or No internet connection.',
              buttons: [
                {text: 'Close App', handler: ()=> {
                  this.platform.exitApp()
                }}
              ]
            }).present()
          }
        }, 30000);
      }, err => {
        this.alertCtrl.create({
          message: 'App requires network.',
          buttons:[{
            text: "Close App",
            handler: () => {
              this.stopNetworkWatch();
            }
          }]
        }).present()
      });
      let checkDownLinkSpeed = this.network.downlinkMax
      setTimeout(()=> {
        console.log(checkDownLinkSpeed);
      }, 3000);

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
      // this.store.clear()
      this.store.get('onboarding').then((res) => {
        if (res) {
          firebase.auth().onAuthStateChanged(user => {

            if (user) {
              firebase.firestore().collection('users').doc(user.uid).get().then(res => {
                if (res.exists) {
                  this.rootPage = TabsPage;
                } else {
                  this.rootPage = YouPage;
                }
              })
            } else {
              this.rootPage = LoginPage;
            }
          })
        } else {
          this.rootPage = OnBoardingPage;
        }
      })
    });

  }
  stopNetworkWatch() {
    this.disconnectSubscription.unsubscribe()
    this.platform.exitApp();
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
