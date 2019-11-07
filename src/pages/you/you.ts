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
  loaderAnimate =true;
  doneAnimate = false;
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
    private: true,
    datecreated: null,
    uid: null
  }
  notes = [];
  isprofile = false;
  keyOpen = false;
  profileForm:FormGroup
  moveto = false
  isediting = false;
  imageupload = null
  imageuploadstate = ''
  error = ''
  gotProfile = false;
  // profileLoader = document.getElementsByClassName('uploadImage');
  constructor(public navCtrl: NavController, public navParams: NavParams, private keyBoard: Keyboard, private renderer: Renderer2, private camera: Camera, public loadingCtrl: LoadingController, public forms: FormBuilder, public store: Storage, public toastCtrl: ToastController, private appCtrl: App,public alertCtrl: AlertController,public splashScreen: SplashScreen) {
    this.profileForm = this.forms.group({
      name: new FormControl(this.user.name, Validators.compose([Validators.required])),
      surname: new FormControl(this.user.surname, Validators.compose([Validators.required])),
      image: new FormControl(this.user.image, Validators.compose([Validators.required])),
      phone: new FormControl(this.user.phone, Validators.compose([Validators.required])),
    })
  }
  ionViewDidEnter() {
 
  }
  ionViewWillEnter() {
    console.log();
    
    firebase.auth().onAuthStateChanged(res => {
      this.note.uid = res.uid
      this.splashScreen.hide()
      this.user.uid = res.uid
      this.getprofile()
    })
    this.store.get('homelocation').then(res => {
      this.user.location = res;
    })
    this.getnote();
  }
  checkNumberLength(ev) {
    if (this.user.phone!=null) {
      if(this.user.phone.length <= 9) {
        this.error = 'Number must be 10 digits.'
        console.log('invalid')
      } else {
        console.log('valid')
        this.error = ''
      }
    }
  }
  pressEvent(event, n) {
    this.alertCtrl.create({
      title: 'Delete Note?',
      message: 'Do you want to delete this note?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },{
          text: 'Yes',
          handler: ()=> {
            firebase.auth().onAuthStateChanged(user => {
              this.db.collection('notes').doc(n.docid).delete().then(res => {
                this.notes = []
                this.getnote()
                this.toastCtrl.create({
                  message: 'Note deleted',
                  duration: 2000
                }).present()
              })
            })
          }
        }
      ]
    }).present()
  }
  checkkeyboard() {
    if (this.keyBoard.isOpen()) {
      this.moveto = true;
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)
            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(50vh)';
                elements[key].style.transition = '0.4s';
              });
            }
    } else {
      this.moveto = false;
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)

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
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM
    }
    this.camera.getPicture(options).then(imagedata => {
      console.log(imagedata)

      let base64Image = `data:image/jpeg;base64,${imagedata}` ;
      let uploadTask = this.storage.child(this.user.name).putString(base64Image, 'data_url');
      uploadTask.on('state_changed', snapshot => {
       let progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
       this.imageupload = progress.toFixed(0)+'%';
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            this.imageuploadstate = 'Upload is paused';
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            this.imageuploadstate = 'Upload is running';
            break;
            case firebase.storage.TaskState.SUCCESS: // or 'running'
            this.imageuploadstate = 'Upload is done';
            break;
            case firebase.storage.TaskState.ERROR: // or 'running'
            this.imageuploadstate = 'An error occured';
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
          this.imageuploadstate = ''
          this.imageupload = null
        })
      })
    }).catch(error => {
      console.log(error);
      
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

            this.db.collection('notes').add(this.note).then(res => {
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
            this.db.collection('notes').doc(note.docid).set(this.note).then(res => {
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
  changeNotePrivacy(note, event) {
    console.log(event.checked);

if (event.checked==false) {
  this.alertCtrl.create({
    title: 'Make this note public?',
    message: "This will make everyone see this note when they read about user's thoughts.",
    buttons: [
      {
        text: "Don't make public",
        handler: ()=>{
          this.getnote();
        }
      },
      {
        text: 'I understand',
        handler: ()=> {
              this.db.collection('notes').doc(note.docid).update({private: event.checked}).then(res => {
    this.getnote();
    this.toastCtrl.create({
      message: 'Note privacy changed to public.',
      duration: 2000
    }).present();
  }).catch(err => {
    this.store.set('note', this.note);
    this.getnote()
    this.toastCtrl.create({
      message: 'Eish! Could not update the note.',
      duration: 2000
    }).present();
  })
        }
      }
    ]
  }).present()
} else {
  this.db.collection('notes').doc(note.docid).update({private: event.checked}).then(res => {
    this.getnote();
    this.toastCtrl.create({
      message: 'Note privacy changed to private.',
      duration: 2000
    }).present();
  }).catch(err => {
    this.store.set('note', this.note);
    this.getnote()
    this.toastCtrl.create({
      message: 'Eish! Could not update the note.',
      duration: 2000
    }).present();
  })
}

  }
  getnote(){
    this.notes = [];
    let note = {
      doc: {},
      docid: ''
    }
    firebase.auth().onAuthStateChanged(user => {
      this.db.collection('notes').where('uid','==',user.uid).get().then(res => {
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
      console.log(res);
      this.appCtrl.getRootNav().setRoot(LoginPage)
    })
  }
  getprofile() {
    if (this.gotProfile==false) {
      console.log('called', this.note);
      this.db.collection('users').doc(this.note.uid).get().then(res => {

        if (res.exists) {
          this.user.image = res.data().image
        this.user.location = res.data().location
        this.user.name = res.data().name
        this.user.phone = res.data().phone
        this.user.surname = res.data().surname
        this.user.uid = res.data().uid
        this.gotProfile = true;
          this.isprofile = true;
          setTimeout(()=>{
            this.loaderAnimate = false;
          }, 1000)
        } else {
          this.loaderAnimate = false;
        }
      })
 
    }
    
  }
  createUser() {
    console.log('called');
    
    this.doneAnimate = true;
      this.db.collection('users').doc(this.note.uid).set(this.user).then(res => {
        this.user = {
          name: '',
          surname: '',
          phone: null,
          image: 'https://firebasestorage.googleapis.com/v0/b/step-drive-95bbe.appspot.com/o/1.png?alt=media&token=c023a9e6-a7a0-4af9-bd13-9778f2bea46d',
          location: {},
          uid: null
        }
      this.db.collection('users').doc(this.note.uid).get().then(res => {

        if (res.exists) {
          this.user.image = res.data().image
        this.user.location = res.data().location
        this.user.name = res.data().name
        this.user.phone = res.data().phone
        this.user.surname = res.data().surname
        this.user.uid = res.data().uid

        if (this.isediting) {
          this.isprofile = true;
          let elements = document.querySelectorAll(".tabbar");
          this.store.set('readTips', true)

                if (elements) {
                  Object.keys(elements).map((key) => {
                    elements[key].style.display = 'flex';
                    elements[key].style.transition = '0.4s';
                  });
                }
                this.doneAnimate = false;
        } else {
          this.doneAnimate = false;
          this.navCtrl.setRoot(TabsPage);
        }
        }
      })
    }).catch(err => {
      this.loaderAnimate = false;
      console.log('Profile Creation error');

    })
  
  }
  editprof() {
    this.isediting = true;
    this.isprofile = !this.isprofile;
    if (this.isediting) {
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)
            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.display = 'none';
                elements[key].style.transition = '0.4s';
              });
            }
    } else {
      let elements = document.querySelectorAll(".tabbar");
      this.store.set('readTips', true)

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
