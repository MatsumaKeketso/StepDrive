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
  ionViewDidLoad() {
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
      this.pushNotification();
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

  pushNotification() {
    this.db.collection('bookings').where('uid', '==', this.user.uid).onSnapshot(res => {

      res.forEach(doc => {
        if ((doc.data().confirmed == 'accepted') || (doc.data().confirmed == 'rejected') && (!doc.data().notified)) {
          this.localNot.schedule({
            id: 1,
            title: 'StepDrive',
            text: `One of the driving instructors responded to your request.`
          })
          this.db.collection('bookings').doc(doc.id).update({notified: true})
        }
      })
    })
  }
  popReview(school) {
    let createdDate = new Date(school.request.datein);

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

    let data = {
      school: {
        allday: null,
        cellnumber: '',
        closed: null,
        coords: {},
        cost: 0,
        desc: null,
        email: null,
        image: null,
        open: null,
        registration: null,
        schoolname: null,
        uid: null,
      },
      request: {
        book: null,
        confirmed: null,
        location: {},
        package: {},
        datecreated: null,
        datein: null,
        dateout: null,
        schooluid: null,
        uid: null,
        docid: null
      }
    }
    // loader.present()
   await this.db.collection('bookings').where('uid', '==', this.user.uid).onSnapshot( async res => {
      this.request = []
      res.forEach(async doc => {
        data.request.docid = doc.id;
        // this is extreme bad programming :(
        data.request.book = doc.data().book;
        data.request.confirmed = doc.data().confirmed
        data.request.location = doc.data().location
        data.request.package = doc.data().package
        data.request.datecreated = doc.data().datecreated
        data.request.datein = doc.data().datein
        data.request.dateout = doc.data().dateout
        data.request.schooluid = doc.data().schooluid
        data.request.uid = doc.data().uid;
        let nowDate = new Date().toDateString();
        let bookDate = new Date(doc.data().datein).toDateString();
        // the date must be in the future for the alerter to be presented
        if (nowDate >= bookDate) {
          // console.log('now',nowDate , 'booling',bookDate);

          // console.log('Date is bigger');
          // cofirmed must be accepted for the alerter to be present
          if (doc.data().confirmed == 'accepted') {
            // the notified must be false
            // console.log('Request is accepted');
            if (!doc.data().notified) {
              // console.log('Notified is false');
              // update the notified field to true after presenting the alert
              this.alertCtrl.create({
                title: `Hi ${this.user.name}`,
                message: 'Did you enjoy your Learning experience?',
                buttons:[{
                  text: "I didn't go.",
                  handler: ()=> {
                    this.alertCtrl.create({
                      title: "It's Okay!",
                      message: "We hope nothing bad kept you from becoming one of South Africa's awesome motorist. But here's the good news, after your next session feel free to comeback and talk about your learning experience to other aspiring drivers.",
                      buttons: [{
                        text: 'Okay',
                        handler: ()=> {
                          this.db.collection('bookings').doc(doc.id).update({notified: true});
                        }
                      }]
                    }).present();
                  }
                }, {
                  text: "Yes definitely.",
                  handler: ()=> {
                    this.alertCtrl.create({
                      title: 'Awesome!',
                      message: 'In order for our driving instructors to improve their services, please take a moment of your time and review this driving school. Your feedback is of high importance. <br> <i>Click on the blue button on your booking card, rate the service and send a review.</i>',
                      buttons: [{
                        text: 'Okay',
                        handler: ()=>{
                          this.db.collection('bookings').doc(doc.id).update({notified: true});
                        }
                      }]
                    }).present();
                  }
                }]
              }).present();
            }
          }
        } else {
          // console.log('now',nowDate , 'booling',bookDate);
          // console.log('Dates are thesame');

        }
       await this.db.collection('drivingschools').where('schooluid', '==', data.request.schooluid).get().then(res => {

          res.forEach(doc => {
            data.school.allday = doc.data().allday;
            data.school.cellnumber = doc.data().cellnumber;
            data.school.closed = doc.data().closed;
            data.school.coords = doc.data().coords;
            data.school.cost = doc.data().cost;
            data.school.desc = doc.data().desc;
            data.school.email = doc.data().email;
            data.school.image = doc.data().image;
            data.school.open = doc.data().open;
            data.school.registration = doc.data().registration;
            data.school.schoolname = doc.data().schoolname;
            data.school.uid = doc.data().schooluid;
            this.request.push(data);
            this.loaderAnimate = false;
        // this.more = this.request.indexOf()
        this.count += 1;
        setTimeout(()=>{
          data = {
            school: {
              allday: null,
              cellnumber: '',
              closed: null,
              coords: {},
              cost: 0,
              desc: null,
              email: null,
              image: null,
              open: null,
              registration: null,
              schoolname: null,
              uid: null,
            },
            request: {
              book: null,
              confirmed: null,
              location: {},
              package: {},
              datecreated: null,
              datein: null,
              dateout: null,
              schooluid: null,
              uid: null,
              docid: null
            }
          }
        }, 0)

          })
          if (doc.data().confirmed == 'rejected' && !doc.data().notified) {
            // say something about the rejected booking
            this.alertCtrl.create({
              title: `Hey ${this.user.name}`,
              message: "You booking has been rejected by this instructor. You can always go back to the map and look for another one, it's best to make more than 1 booking with different driving schools for cases such as these. <br> <br> <i>*Note: you can delete booking to keep your space clean.</i>",
              buttons: [{
                text: 'Okay',
                handler: ()=>{
                  this.db.collection('bookings').doc(doc.id).update({notified: true});
                }
              }]
            }).present();
          }
        })


      })
      // loader.dismiss()
      setTimeout(()=> {
        this.loaderAnimate = false;
      }, 1000)
      // console.log('Reqs: ', this.request);
    })
  }
  checkBookingExpiary() {
    for (let i = 0; i < this.request.length; i++) {
      console.log(this.request[i]);


    }
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
              this.getBooking()
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
