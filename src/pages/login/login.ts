import { Component, ViewChild } from '@angular/core';

import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Keyboard, ToastController, Tabs } from 'ionic-angular';
import { Users } from '../../app/user';
import * as firebase from 'firebase';
import { TabsPage } from '../tabs/tabs';
import { ProfilePage } from '../profile/profile';
import { YouPage } from '../you/you';
import { SplashScreen } from '@ionic-native/splash-screen';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  @ViewChild('tabs') tabs: Tabs
  db = firebase.firestore();
  user =  {} as Users;
  loginForm: FormGroup;
  isKeyOpen = false;
  loaderAnimate = false;
  email: string;
  password: string;
  validation_messages = {

    'email': [
      {type: 'required', message: 'Email address is required.'},
      {type: 'pattern', message: 'Email address is not valid.'},
      {type: 'validEmail', message: 'Email address already exists in the system.'},
    ],


    'password': [
     {type: 'required', message: 'Password is required.'},
     {type: 'minlength', message: 'Password must be more than 6 characters.'},
     {type: 'maxlength', message: 'Password must be less than 10 characters.'},
   ],



   'RepeatedPassword': [
    {type: 'required', message: 'Password is required.'},
    {type: 'minlength', message: 'Password must be more than 6 characters.'},
     {type: 'maxlength', message: 'Password must be less than 10 characters.'},
  ]

  }


  constructor(public navCtrl: NavController,public splashScreen: SplashScreen, public forms: FormBuilder, public navParams: NavParams, public loadingCtrl: LoadingController,   public alertCtrl: AlertController, public keyboard: Keyboard, public toastCtrl: ToastController) {

    this.loginForm = this.forms.group({
      email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-.]+$')])),

      password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(10)]))

    })

  }

  ionViewDidLoad() {

    if (this.tabs) {
      this.tabs.setElementStyle('display', 'none')
      console.log('Tabs', this.tabs);
    }
    this.keyboard
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    // loading.present();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.db.collection('users').where('uid', '==', user.uid).get().then(res => {
          if (res.empty) {

            // loading.dismiss();
            this.navCtrl.setRoot(YouPage);
          } else {
            this.splashScreen.hide()
            // loading.dismiss();
            this.navCtrl.setRoot(TabsPage);
          }
        })
      } else {
        this.splashScreen.hide();
        loading.dismiss();
      }
    })
  }
  checkKeyboard() {
    if(this.keyboard.isOpen()) {
      this.isKeyOpen = true;
    } else {
      this.isKeyOpen = false;
    }
  }
  Reg(){
   this.navCtrl.push(RegisterPage);
  }
  forget(){
    this.alertCtrl.create({
      title: 'Verification Email',
      message: 'We will send a password reset link to this email address.',
      inputs: [{
        name: 'email',
        type: 'email'
      }],
      buttons: [
        {
          text: 'Send Verification',
          handler: data => {
            console.log(data);
            this.loaderAnimate = true;
            this.emailsent(data)
          }
        }
      ]
    }).present()
  }
  emailsent(val) {

    firebase.auth().sendPasswordResetEmail(val.email).then(() => {
      this.loaderAnimate = false;
      this.alertCtrl.create({
        title: 'Email Sent',
        message: 'Please check you inbox for the verification link.',
        buttons: [
          {text: 'Okay'}
        ]
      }).present()
    }).catch((error) => {
      this.loaderAnimate = false;
      this.alertCtrl.create({
        title: 'Email Not Sent',
        message: 'Oops, something went wrong. Please try again later.',
        buttons: [
          {text: 'Okay'}
        ]
      }).present()
    });
  }
  Home(){
    console.log(this.loginForm.valid);
    if(this.loginForm.valid){
      this.navCtrl.push(HomePage)
    }
  }
  login(user: Users) {
    this.loaderAnimate = true;
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    })

    // loading.present();

    if (!user.email || !user.password) {
      // loading.dismiss()
      this.loaderAnimate = false;
    } else {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password).then((result) => {
        // loading.dismiss();
        this.loaderAnimate = false;
          this.navCtrl.setRoot(TabsPage);
      }).catch((error) => {
        console.log(error);

        // loading.dismiss();
        this.loaderAnimate = false;
        let errorCode = 'Error';
        let errorMessage = error.message;

        this.alertCtrl.create({
          title: errorCode,
          subTitle: errorMessage,
          buttons: ['Ok']
        }).present();
      });
    }

  }
}
