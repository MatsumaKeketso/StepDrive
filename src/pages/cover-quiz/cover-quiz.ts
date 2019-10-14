import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import * as firebase from 'firebase';

/**
 * Generated class for the CoverQuizPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cover-quiz',
  templateUrl: 'cover-quiz.html',
})
export class CoverQuizPage {
  db = firebase.firestore()

  userReviews = []
  review = {
    datecreated: null,
    image: '',
    schooluid: '',
    text: '',
    username: '',
    rating: 0
  }
  school = {}
  request = {}
  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    this.review.datecreated = new Date().toDateString();
    console.log(this.navParams);
    this.school = this.navParams.data.school
    this.request = this.navParams.data.request
    this.getProfilre()
    console.log('ionViewDidLoad CoverQuizPage');
    setTimeout(()=> {
      this.review.schooluid = this.navParams.data.school.uid;
      console.log(this.review);
      console.log('school' ,this.school, 'request', this.request);


    }, 100);
  }
  getProfilre () {
    firebase.auth().onAuthStateChanged(user => {
      this.db.collection('users').doc(user.uid).get().then(res => {
        this.review.image = res.data().image;
        this.review.username = res.data().name;
      })
    })
  }
  logRatingChange(event) {
    this.review.rating = event;
  }
  sendReview() {
    console.log(this.review);

    if (this.review.text) {
      if (this.review.rating == 0) {
        const toaster = this.toastCtrl.create({
          message: 'Please provide a rating for this review.',
          duration: 2000
        }).present()
      } else {
        this.db.collection('reviews').add(this.review).then(res => {
          this.review.text = ''
          this.review.rating = 0

          const toaster = this.toastCtrl.create({
            message: 'Thank You',
            duration: 2000
          }).present()
          setTimeout(()=>{
            this.viewCtrl.dismiss();
          }, 100)
        }).catch(err => {
          const toaster = this.toastCtrl.create({
            message: 'Oops!' + err.message,
            duration: 2000
          }).present()
        })

      }
    } else {
      const toaster = this.toastCtrl.create({
        message: 'Please write something',
        duration: 2000
      }).present()
    }
  }
  reviews(event, school) {

            }
}
