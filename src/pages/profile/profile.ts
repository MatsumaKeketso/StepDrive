import {
  Component,
  ViewChild,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  AlertController,
  ToastController,
  Platform,
  Keyboard,
  PopoverController
} from 'ionic-angular';
import * as firebase from 'firebase';
import {
  Storage
} from '@ionic/storage';

import { CoverQuizPage } from '../cover-quiz/cover-quiz';
import {LocalNotifications } from '@ionic-native/local-notifications';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  @ViewChild('reviews') revs: ElementRef;
  loaderAnimate = true;
  db = firebase.firestore();
  user = {
    uid: '',
    image: null,
    name: ''
  }
  request = []
  userReviews = []
  school = {}
  more = {
    cond: false,
    id: 0
  }
  showTips = false;
  count = 0;
  revsOpen = false;
  reviewCardLength: any;
  review = {
    datecreated: null,
    image: '',
    schooluid: '',
    text: '',
    username: '',
    rating: 0
  }
  revDateValidation: any
  reviewDiv: any;
  feedbackDiv: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public toastCtrl: ToastController, private store: Storage, public plt: Platform, public localNot: LocalNotifications, public element: ElementRef, public renderer: Renderer2, public keyb: Keyboard, public popoverCtrl: PopoverController) {}
  // get the request of the user
  // get the schooldata where they made the request
  ionViewDidEnter() {
    // this.getReviews();
    // check if all the elemnts exist


    // // log the page's native elements for reverence
    let Div = this.element
    // console.log(Div);

    this.plt.ready().then(ready => {
      // after the platform is ready chech if the reference divs are available
      if (this.reviewDiv) {
        // this.renderer.setStyle(this.reviewDiv, 'top', '80%');
      }

      if (this.feedbackDiv) {
        // this.renderer.setStyle(this.feedbackDiv, 'opacity', '0');
      }
      this.db.collection('bookings').where('uid', '==', this.user.uid).onSnapshot(res => {
        res.forEach(doc => {

        })
        this.count += 1;
      })
    })
    console.log('ionViewDidLoad ProfilePage');
    firebase.auth().onAuthStateChanged(res => {
      this.user.uid = res.uid;
      this.db.collection('users').doc(res.uid).get().then(user => {
        if (user.data()) {
          this.user.image = user.data().image;
          this.user.name = user.data().name;
          this.review.image = user.data().image;
          this.review.username = `${user.data().name}  ${user.data().surname}`
        } else {
          // console.log('Got no data');

        }
      })
      this.initialiseTips();
      this.getBooking();
    })


  }

  logRatingChange(ev) {
    console.log(ev);
    this.review.rating = ev
    console.log(this.review);

  }

  openTips() {
    this.store.set('readTips', false).then(res => {
      this.initialiseTips();
    })
  }

  async initialiseTips() {
    let elements = document.querySelectorAll(".tabbar");
    let readTips = null
    // this.store.clear()
    await this.store.get('readTips').then(async res => {
      readTips = await res;
      setTimeout(() => {
        // console.log('readTs: ', readTips);

        if (!readTips) {
          // console.log('no tip property');

          if (elements != null) {
            // console.log(' 1 tabs should hide');

            Object.keys(elements).map((key) => {
              // elements[key].style.display = 'none';
              elements[key].style.transform = 'translateY(50vh)';
              elements[key].style.transition = '0.4s';
            });
            this.showTips = true;
          }

        } else {
          // console.log('tabs should show');

          Object.keys(elements).map((key) => {
            // elements[key].style.display = 'flex';
            elements[key].style.transform = 'translateY(0vh)';
            elements[key].style.transition = '0.4s';
          });
        }
      }, 2000);
    })
  }
  closeTips() {
    // console.log('tabs should show');

    let elements = document.querySelectorAll(".tabbar");
    this.store.set('readTips', true)
    // console.log('tabs should show');

          if (!this.revsOpen) {
            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(0vh)';
                // elements[key].style.display = 'flex';
                elements[key].style.transition = '0.4s';
              });
            }
          }


    this.showTips = false;
  }

  popReview(school) {
    let createdDate = new Date(school.datein);

    let d = new Date();

  let todayD = new Date(d.toDateString());

  var Difference_In_Time = todayD.getTime() - createdDate.getTime();

// To calculate the no. of days between two dates
var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    console.log(Difference_In_Days);

    if (Difference_In_Days <= 0) {
      console.log('createdDate', Difference_In_Days,);
      const toaster = this.toastCtrl.create({
        message: 'Reviews can only be made after at least 1 lesson has been done.',
        closeButtonText: 'Okay',
        showCloseButton: true
      }).present()
    } else {
      console.log('createdDate', Difference_In_Days,);
      this.review.datecreated = new Date().toDateString();
      this.popoverCtrl.create(CoverQuizPage, school,{showBackdrop: true, enableBackdropDismiss: true}).present()
          }

  }
  async getBooking() {

    let data = {   }
    // loader.present()
   await this.db.collection('bookings').where('uid', '==', this.user.uid).get().then( async res => {
      this.request.length  =0
     await res.forEach(async rDoc => {
       await this.db.collection('drivingschools').where('schooluid', '==', rDoc.data().schooluid).get().then( async school => {
          await school.forEach(async sDoc => {
            data = {
              // school data
              allday: sDoc.data().allday,
              cellnumber: sDoc.data().cellnumber,
              closed: sDoc.data().closed,
              coords: sDoc.data().coords,
              cost: sDoc.data().cost,
              desc: sDoc.data().desc,
              email: sDoc.data().email,
              image: sDoc.data().image,
              open: sDoc.data().open,
              registration: sDoc.data().registration,
              schoolname:  sDoc.data().schoolname,
              sUid:  sDoc.data().schooluid,
              // request data
              book: rDoc.data().book,
              confirmed: rDoc.data().confirmed,
              location:rDoc.data().location,
              package:  rDoc.data().package,
              datecreated: rDoc.data().datecreated,
              datein: rDoc.data().datein,
              dateout: rDoc.data().dateout,
              schooluid: rDoc.data().schooluid,
              uid: rDoc.data().uid,
              docid: rDoc.id,
              tokenId: rDoc.data().tokenId
             }
            this.request.push(data);
            data ={}
            console.log('our obj', this.request);
            this.loaderAnimate = false;
        // this.more = this.request.indexOf()
        this.count += 1;

        // check if the date in of the request is more than todays date by i day and ask if the user attended the lesson
        // notify them about the reviews then update the notified field

        // check
        setTimeout(()=>{

        }, 0)

          })

          // the date must be in the future for the alerter to be presented


        })


      })
      console.log(this.request);

      // loader.dismiss()
      setTimeout(()=> {
        this.loaderAnimate = false;
      
        this.checkExpiredBooking()
      }, 1000)
      // console.log('Reqs: ', this.request);
    })
  }
  // iterate over all the bookings and
  // check the checkout dates
  // check the expired ones and
  // delete them
  async checkExpiredBooking() {
    this.request.forEach(async element => {
              // Check if the request has been replied after 2 days of the date in request
              let requestDocument = new Date(element.datein); // turns the string date to the normal date without time
              let newDate = new Date() // creates today date
              let todayDate = new Date(newDate.toDateString()); // converts the date to string
              let normalDate = new Date(todayDate); // turns the string date to the normal date without time
              if(requestDocument < normalDate) {
                  console.log("The given date"+requestDocument+" is Future Date"+element.schoolname);
                  if (element.confirmed == 'accepted') {
                    // the notified must be false
                    if (!element.notified) {
                      // update the notified field to true after presenting the alert
                     let alerter = await this.alertCtrl.create({
                        title: `Hi ${this.user.name}`,
                        message: 'Did you enjoy your Learning experience from '+element.schoolname+'?',
                        buttons:[{
                          text: "I didn't go.",
                          handler: (data)=> {
                           let alerter = this.alertCtrl.create({
                              title: "It's Okay!",
                              message: "We hope nothing bad kept you from becoming one of South Africa's awesome motorist. But here's the good news, after your next session feel free to comeback and talk about your learning experience to other aspiring drivers.",
                              buttons: [{
                                text: 'Okay',
                                handler: ()=> {
                                  this.db.collection('bookings').doc(element.docid).update({notified: true});
                                }
                              }]
                            })
                            alerter.present();
                          }
                        }, {
                          text: "Yes definitely.",
                          handler:async ()=> {
                           let alerter = await this.alertCtrl.create({
                              title: 'Awesome!',
                              message: 'In order for our driving instructors to improve their services, please take a moment of your time and review this driving school. Your feedback is of high importance. <br> <br> <i>Click on the blue button on your booking card, rate the service and send a review.</i>',
                              buttons: [{
                                text: 'Okay',
                                handler: ()=>{
                                  this.db.collection('bookings').doc(element.docid).update({notified: true});
                                }
                              }]
                            })
                            alerter.present();
                          }
                        }]
                      })
                      alerter.present();
                    }
                  }
                  
              }
              if (element.confirmed == 'rejected' && !element.notified) {
                // say something about the rejected booking
                let alerter =   await this.alertCtrl.create({
                  title: `Hey ${this.user.name}`,
                  message: "You booking has been rejected by this instructor. You can always go back to the map and look for another one, it's best to make more than 1 booking with different driving schools for cases such as these. <br> <br> <i>*Note: you can delete booking to keep your space clean.</i>",
                  buttons: [{
                    text: 'Okay',
                    handler: ()=>{
                      this.db.collection('bookings').doc(element.docid).update({notified: true});
                    }
                  },{
                    text: 'Remove Request',
                    handler: () => {
                      this.db.collection('bookings').doc(element.docid).delete().then(res => {
                      this.getBooking()
                      })
                    }
                  }]
                })
                alerter.present();
                  }
    })
  }
  checkRejectedRequest() {
    this.request.forEach(async element => {
      if (element.confirmed == 'rejected' && !element.notified) {
        // say something about the rejected booking
     let alerter =   await this.alertCtrl.create({
          title: `Hey ${this.user.name}`,
          message: "You booking has been rejected by this instructor. You can always go back to the map and look for another one, it's best to make more than 1 booking with different driving schools for cases such as these. <br> <br> <i>*Note: you can delete booking to keep your space clean.</i>",
          buttons: [{
            text: 'Okay',
            handler: ()=>{
              this.db.collection('bookings').doc(element.docid).update({notified: true});
            }
          }]
        })
        alerter.present();
      }
    });
  }
  showMore(index) {
    this.more.cond = !this.more
    this.more.id = index;
  }
  delete(docid) {
    const alerter = this.alertCtrl.create({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this request',
      buttons: [{
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {

            this.db.collection('bookings').doc(docid).delete().then(res => {
              this.request = [];
              setTimeout(()=>{
                this.getBooking();
              }, 500)
              this.toastCtrl.create({
                message: 'Request deleted successfully',
                duration: 2000
              }).present()
            })
          }
        }
      ]
    })
    alerter.present()
  }
}
