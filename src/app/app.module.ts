import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StarRatingModule } from "ionic3-star-rating";
import { MyApp } from './app.component';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { Geolocation } from '@ionic-native/geolocation';
import { ProfilePage } from '../pages/profile/profile';
import { OnBoardingPage } from '../pages/on-boarding/on-boarding';
import { QuizPage } from '../pages/quiz/quiz';
import { ScorePage } from '../pages/score/score';
import { HttpModule } from '@angular/http';
import { Question1Page } from '../pages/question1/question1';
import { Question2Page } from '../pages/question2/question2';
import { Question3Page } from '../pages/question3/question3';
import { Question4Page } from '../pages/question4/question4';
import { CoverQuizPage } from '../pages/cover-quiz/cover-quiz';
import { YouPage } from '../pages/you/you';
import { IonicStorageModule } from "@ionic/storage";
import { Camera } from '@ionic-native/camera';
import { CallNumber } from '@ionic-native/call-number';
import { HttpClientModule } from '@angular/common/http';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { LocalNotifications } from "@ionic-native/local-notifications";
import { Network } from '@ionic-native/network';
import { Device } from "@ionic-native/device";
import { OneSignal } from '@ionic-native/onesignal';
@NgModule({
  declarations: [
    MyApp,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    RegisterPage,
    ProfilePage,
    OnBoardingPage,
    QuizPage,
    ScorePage,
    Question1Page,
    Question2Page,
    Question3Page,
    Question4Page,
    CoverQuizPage,
    YouPage,
    ProfilePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    IonicStorageModule.forRoot(),
    StarRatingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    RegisterPage,
    ProfilePage,
    OnBoardingPage,
    QuizPage,
    ScorePage,
    Question1Page,
    Question2Page,
    Question3Page,
    Question4Page,
    CoverQuizPage,
    YouPage,
    ProfilePage
  ],
  providers: [
    StatusBar,
    Geolocation,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Camera,
    CallNumber,
    Camera,
    HttpClientModule,
    ScreenOrientation,
    LocalNotifications,
    AndroidPermissions,
    Network,
    Device,
    OneSignal
  ]
})
export class AppModule {}
