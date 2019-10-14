import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IonicPage, NavController, NavParams, Keyboard, LoadingController, ToastController, App, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from "@ionic-native/camera";
import { FormBuilder, FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import { Storage } from "@ionic/storage";
import { LoginPage } from '../login/login';
import { TabsPage } from '../tabs/tabs';
import { SplashScreen } from '@ionic-native/splash-screen';
@IonicPage()
@Component({
  selector: 'page-you',
  templateUrl: 'you.html',
})
export class YouPage {
  db = firebase.firestore();
  storage = firebase.storage().ref();
  user = {
    name: '',
    surname: '',
    phone: null,
    image: 'https://firebasestorage.googleapis.com/v0/b/step-drive-95bbe.appspot.com/o/1.png?alt=media&token=c023a9e6-a7a0-4af9-bd13-9778f2bea46d',
    location: {},
    uid: null
  }
  current = {
    email: null,
    uid: null
  }
  note = {
    text: '',
    datecreated: null
  }
  notes = [];
  isprofile = false;
  keyOpen = false;
  profileForm:FormGroup
  moveto = false
  isediting = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private keyBoard: Keyboard, private renderer: Renderer2, private camera: Camera, public loadingCtrl: LoadingController, public forms: FormBuilder, public store: Storage, public toastCtrl: ToastController, private appCtrl: App,public alertCtrl: AlertController,public splashScreen: SplashScreen) {
    this.profileForm = this.forms.group({
      name: new FormControl(this.user.name, Validators.compose([Validators.required])),
      surname: new FormControl(this.user.surname, Validators.compose([Validators.required])),
      image: new FormControl(this.user.image, Validators.compose([Validators.required])),
      phone: new FormControl(this.user.phone, Validators.compose([Validators.required])),
    })
  }
  ionViewDidEnter() {
    // get the profile

  }
  ionViewDidLoad() {
this.getprofile();
    firebase.auth().onAuthStateChanged(res => {
      this.splashScreen.hide()
      this.user.uid = res.uid
    })
    console.log('Current user ', this.user);

    this.store.get('homelocation').then(res => {
      this.user.location = res;
    })
    this.getnote();
  }
  checkkeyboard() {
    if (this.keyBoard.isOpen()) {
      console.log('Key open');
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)
      console.log('tabs should show');

            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(50vh)';
                elements[key].style.transition = '0.4s';
              });
            }
    } else {
      console.log('Key closed');
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)
      console.log('tabs should show');

            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(0vh)';
                // elements[key].style.display = 'flex';
                elements[key].style.transition = '0.2s';
              });
            }
    }



  }
  getImage() {
    console.log('Opem image');

    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM
    }
    this.camera.getPicture(options).then(imagedata => {

      let base64Image = `data:image/jpeg;base64,${imagedata}` ;
      console.log(base64Image);
      let uploadTask = this.storage.child(this.user.name).putString(base64Image, 'data_url');
      uploadTask.on('state_changed', snapshot => {
        let progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
            case firebase.storage.TaskState.SUCCESS: // or 'running'
            console.log('Upload is done');
            break;
            case firebase.storage.TaskState.ERROR: // or 'running'
            console.log('An error occured');
            break;
        }
      }, err => {
        switch (err.name) {
          case 'storage/unauthorized':
            console.log("User doesn't have permission to access the object");

            break;

          case 'storage/canceled':
            console.log('User canceled the upload');

            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then(downUrl => {
          this.user.image = downUrl
          console.log(this.user);

        })
      })
    })
  }
  createnote() {
    let date = new Date();
    this.note.datecreated = date.toDateString();
    this.alertCtrl.create({
      title: 'Create new note.',
      enableBackdropDismiss: false,
      inputs:[
        {placeholder: 'Say something',
        type: 'text',
        name: 'noteText'
      }
      ],
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {text: 'Create', handler: (data) => {
          if (!data.noteText) {
            this.toastCtrl.create({
              message: "Cannot create empty note",
              duration: 3000
            }).present()
          } else {
            this.note.text = data.noteText
            console.log('data', this.note);
            this.db.collection('users').doc(this.user.uid).collection('notes').add(this.note).then(res => {
              this.getnote();

              this.toastCtrl.create({
                message: 'Note saved',
                duration: 2000
              }).present();
              this.note.text = '';
              this.note.datecreated = ''
            }).catch(err => {
              this.store.set('note', this.note);
              this.getnote()
              this.toastCtrl.create({
                message: 'Saved',
                duration: 2000
              }).present();
            })
          }
        }}
      ]

    }).present()
    /*

    */
  }
  editNote(note) {
    this.note.text = note.doc.text
    console.log(note, this.user);
    let date = new Date();
    this.note.datecreated = date.toDateString();
    this.alertCtrl.create({
      title: 'Edit note.',
      enableBackdropDismiss: false,
      inputs:[
        {placeholder: 'Say something',
        type: 'text',
        name: 'noteText',
        value: this.note.text
      }
      ],
      buttons: [
        {text: 'Cancel',role: 'cancel'},
        {text: 'Edit', handler: (data) => {
          if (!data.noteText) {
            this.toastCtrl.create({
              message: "Cannot edit empty note",
              duration: 3000
            }).present()
          } else {
            this.note.text = data.noteText
            console.log('data', this.note);
            this.db.collection('users').doc(this.user.uid).collection('notes').doc(note.docid).set(this.note).then(res => {
              this.getnote();

              this.toastCtrl.create({
                message: 'Note updated',
                duration: 2000
              }).present();
              this.note.text = '';
              this.note.datecreated = ''
            }).catch(err => {
              this.store.set('note', this.note);
              this.getnote()
              this.toastCtrl.create({
                message: 'Saved',
                duration: 2000
              }).present();
            })
          }
        }}
      ]

    }).present()
    /*

    */
  }
  getnote(){
    this.notes = [];
    let note = {
      doc: {},
      docid: ''
    }
    firebase.auth().onAuthStateChanged(user => {
      this.db.collection('users').doc(user.uid).collection('notes').get().then(res => {
        if (!res.empty) {
          res.forEach(doc => {
            note.doc = doc.data();
            note.docid = doc.id;
            this.notes.push(note);
            note = {
              doc: {},
              docid: ''
            }
          })
        }
      })
    })
  }
  logout() {
    firebase.auth().signOut().then(res => {
      this.appCtrl.getRootNav().setRoot(LoginPage)
    })
  }
  getprofile() {
    const loader = this.loadingCtrl.create({
      content: 'Just a sec...',
    })
    // loader.present()
    firebase.auth().onAuthStateChanged(user => {
      this.user.uid = user.uid

      this.db.collection('users').doc(user.uid).get().then(res => {
        loader.dismiss();

        if (res.exists) {
          this.user.image = res.data().image
        this.user.location = res.data().location
        this.user.name = res.data().name
        this.user.phone = res.data().phone
        this.user.surname = res.data().surname
        this.user.uid = res.data().uid
          this.isprofile = true;
        console.log('Got Profile: ', this.user);

        }
      })
    })
  }
  createUser() {
    console.log(this.user);

    const loader = this.loadingCtrl.create({
      content: 'Just a sec...',
    })
    loader.present();
    firebase.auth().onAuthStateChanged(user => {
      this.user.uid = user.uid
      this.db.collection('users').doc(this.user.uid).set(this.user).then(res => {
      console.log('Profile Created');
      this.db.collection('users').doc(user.uid).get().then(res => {

        if (res.exists) {
          this.user.image = res.data().image
        this.user.location = res.data().location
        this.user.name = res.data().name
        this.user.phone = res.data().phone
        this.user.surname = res.data().surname
        this.user.uid = res.data().uid

        console.log('Got Profile: ', this.user);
        loader.dismiss();
        if (this.isediting) {
          this.isprofile = true;
          let elements = document.querySelectorAll(".tabbar");
          this.store.set('readTips', true)
          console.log('tabs should show');

                if (elements) {
                  Object.keys(elements).map((key) => {
                    elements[key].style.display = 'flex';
                    elements[key].style.transition = '0.4s';
                  });
                }
        } else {
          this.navCtrl.setRoot(TabsPage);
        }
        }
      })
    }).catch(err => {
      console.log('Profile Creation error');
      loader.dismiss()
    })
    })
  }
  editprof() {
    this.isediting = true;
    this.isprofile = !this.isprofile;
    if (this.isediting) {
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)
      console.log('tabs should show');

            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.display = 'none';
                elements[key].style.transition = '0.4s';
              });
            }
    } else {
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)
      console.log('tabs should hide');

            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(0vh)';
                elements[key].style.transition = '0.4s';
              });
            }
    }
  }
  removeimage(){
    this.user.image = null
  }
}
