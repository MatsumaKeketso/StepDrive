import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NavController, AlertController, App, Platform, Keyboard, Slides } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from "@ionic/storage";
import { CallNumber } from '@ionic-native/call-number';
import {google} from 'google-maps'
import { AndroidPermissions } from '@ionic-native/android-permissions';

import * as firebase from 'firebase';
import { ContactPage } from '../contact/contact';
import { Subject } from 'rxjs/Subject';
import { SplashScreen } from '@ionic-native/splash-screen';
declare var google: google;
import { Device } from "@ionic-native/device";
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  db = firebase.firestore();
  storage = firebase.storage().ref();
  display = false;
  loaderAnimate = true;
  loaderSeconds = 3000;
  @ViewChild('map') mapElement: ElementRef;
  filterby = ''
  map: any;
 // restriction for the map
 users = [];
 user = {
   uid: ''
 }
 SOUTH_AFRICAN_BOUNDS = {
  north: -21.914461,
  south: -35.800139,
  west: 15.905430,
  east: 34.899504
}
height = 50;
mapCenter = {
  lng: 0,
  lat: 0
}
  about = true;
  school = {
    schoolname: '',
    desc: '',
    content: '',
    image: '',
    cost: null
  }
  code08packs = []
  code10packs = []
  code14packs = []
  code01packs = []
  activePack = []
  activePackPrice = 0;


  drivingSchools = [];
  noLessons = null;
  placeSearch = ''
  startAt = new Subject();
  endAt = new Subject();
  searchres
  markers = []
  geocoder = new google.maps.Geocoder;
  viewImage = {
    image: '',
    open: false
  }
  userReviews = []
  toggleReviews = false;
  licenseCode = "code01"
  code08 = document.getElementsByClassName('code08');
  code10 = document.getElementsByClassName('code10');
  code14 = document.getElementsByClassName('code14');
  code01 = document.getElementsByClassName('code01');
  information = document.getElementsByClassName('information');
  infoRead = document.getElementsByClassName('s-readmore');
  autoCompSearch = document.getElementsByClassName('searchbar-input');
  autocomplete: any;
  lastScrollTop = 0;
  tabElements = document.querySelectorAll(".tabbar");
  deviceVersion: any;
  constructor(public navCtrl: NavController, public geolocation: Geolocation, public store: Storage, public alertCtrl: AlertController,private callNumber: CallNumber, public appCtrl: App, public renderer: Renderer2, public plt: Platform, public elementref: ElementRef, public keyboard: Keyboard, private androudPermissions: AndroidPermissions, public splashscreen: SplashScreen, private device: Device) {
    this.deviceVersion = device.version
   }

  ionViewDidLoad(){
    setTimeout(()=> {
      this.information[0].addEventListener("scroll", (event) => {

        this.lastScrollTop = this.lastScrollTop + 1;

   if (this.lastScrollTop > 5){
    this.renderer.setStyle(this.infoRead[0], 'opacity', '0');
   }
      });
      this.initAutocomplete()
    }, 1000)
    if (this.licenseCode== 'code01') {
      setTimeout(()=> {
        this.renderer.setStyle(this.code08[0], 'width', '0px');
        this.renderer.setStyle(this.code10[0], 'width', '0px');
        this.renderer.setStyle(this.code14[0], 'width', '0px');
        this.renderer.setStyle(this.code01[0], 'width', '100%');

        this.renderer.setStyle(this.code08[0], 'height', '0px');
        this.renderer.setStyle(this.code10[0], 'height', '0px');
        this.renderer.setStyle(this.code14[0], 'height', '0px');
        this.renderer.setStyle(this.code01[0], 'height', '70%');
      }, 1000)
    }
    this.splashscreen.hide();
    this.loaderAnimate = true;

    if (this.deviceVersion == '5.1.1') {
      this.getlocation()
    } else {
      this.promptLocation();
    }
    this.plt.ready().then(res => {
      let viewimage = this.elementref.nativeElement.children[0].children[1].children[0];
      this.renderer.setStyle(viewimage, 'transform', 'scale(0)');
    })
    firebase.auth().onAuthStateChanged(user => {
      this.user.uid = user.uid;
    })
    // this.getlocation();

  }
  initAutocomplete() {
    // Create the autocomplete object, restricting the search predictions to
    // geographical location types.
    this.autocomplete = new google.maps.places.Autocomplete(this.autoCompSearch[0], {types: ['geocode']});

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components.
    // this.autocomplete.setFields(['address_component']);

    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    this.autocomplete.addListener('place_changed', ()=>{
      this.fillInAddress()

    });
  }
  fillInAddress() {
    // Get the place details from the autocomplete object.
     let place = this.autocomplete.getPlace();

    let filter = place.address_components[0].short_name
    console.log('search filter ', place);

    this.db.collection('drivingschools').where('city','==',filter).get().then(res=> {
      this.users = []
      this.markers = []
      res.forEach(doc => {
        this.users.push(doc.data())
        this.markers.push(doc.data())
      })
      setTimeout( async () => {
        await this.markers.forEach( async element => {
          this.addMarker(element);
        })
       }, 1000)
    })
     let latLng = {
       lat: place.geometry.location.lat(),
       lng: place.geometry.location.lng(),
     }
this.map.panTo(latLng);
this.map.setZoom(4);
this.hideTabs('open');
Object.keys(this.tabElements).map((key) => {
  // this.tabElements[key].style.transform = 'translateY(0vh)';
  this.renderer.setStyle(this.tabElements[key], 'transform', 'translateY(0vh)')
  this.tabElements[key].style.transition = '0.4s';
});
for (let i = 0; i < this.users.length; i++) {

}
  }
  segmentChanged(event) {
    // this.code08packs = data.packages[1].code08;
    // this.code10packs = data.packages[2].code10;
    // this.code14packs = data.packages[3].code14;
    // this.code01packs = data.packages[0].code01;

    if (this.licenseCode== 'code08') {
      this.school.cost = this.activePack[1].price
      setTimeout(()=> {
        this.renderer.setStyle(this.code08[0], 'width', '100%');
        this.renderer.setStyle(this.code10[0], 'width', '0px');
        this.renderer.setStyle(this.code14[0], 'width', '0px');
this.renderer.setStyle(this.code01[0], 'width', '0%');

        this.renderer.setStyle(this.code08[0], 'height', '70%');
        this.renderer.setStyle(this.code10[0], 'height', '0px');
        this.renderer.setStyle(this.code14[0], 'height', '0px');
        this.renderer.setStyle(this.code01[0], 'height', '0%');
      })
    } else if (this.licenseCode== 'code10') {

      this.school.cost = this.activePack[2].price
      setTimeout(()=> {
        this.renderer.setStyle(this.code08[0], 'width', '0px');
        this.renderer.setStyle(this.code10[0], 'width', '100%');
        this.renderer.setStyle(this.code14[0], 'width', '0px');
this.renderer.setStyle(this.code01[0], 'width', '0%');
        this.renderer.setStyle(this.code08[0], 'height', '0%');
        this.renderer.setStyle(this.code10[0], 'height', '70%');
        this.renderer.setStyle(this.code14[0], 'height', '0px');
        this.renderer.setStyle(this.code01[0], 'height', '0%');
      })
    } else if (this.licenseCode== 'code14') {

      this.school.cost = this.activePack[3].price
      setTimeout(()=> {
        this.renderer.setStyle(this.code08[0], 'width', '0px');
        this.renderer.setStyle(this.code10[0], 'width', '0px');
        this.renderer.setStyle(this.code14[0], 'width', '100%');
        this.renderer.setStyle(this.code01[0], 'width', '0%');

        this.renderer.setStyle(this.code08[0], 'height', '0%');
        this.renderer.setStyle(this.code10[0], 'height', '0px');
        this.renderer.setStyle(this.code14[0], 'height', '70%');
this.renderer.setStyle(this.code01[0], 'height', '0%');
      })
    } else if (this.licenseCode== 'code01') {

      this.school.cost = this.activePack[0].price
      setTimeout(()=> {
        this.renderer.setStyle(this.code08[0], 'width', '0px');
        this.renderer.setStyle(this.code10[0], 'width', '0px');
        this.renderer.setStyle(this.code14[0], 'width', '0%');
        this.renderer.setStyle(this.code01[0], 'width', '100%');

        this.renderer.setStyle(this.code08[0], 'height', '0%');
        this.renderer.setStyle(this.code10[0], 'height', '0px');
        this.renderer.setStyle(this.code14[0], 'height', '0%');
        this.renderer.setStyle(this.code01[0], 'height', '70%');
      })
    }
  }
  checkKeyBoard() {
    let elements = document.querySelectorAll(".tabbar");
    if (this.keyboard.isOpen()) {
      this.store.set('readTips', true)
            if (elements) {
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(50vh)';
                elements[key].style.transition = '0.4s';
              });
            }
    } else {
      if (this.about) {
        Object.keys(elements).map((key) => {
          elements[key].style.transform = 'translateY(0vh)';
          elements[key].style.transition = '0.4s';
        });
      }

    }
  }
  // views the image on a bigger size
  openImage(image, cmd) {
    if (cmd == 'open') {
      this.viewImage.image = image;
      this.viewImage.open = true;
      let viewimage = this.elementref.nativeElement.children[0].children[1].children[0];
      this.renderer.setStyle(viewimage, 'opacity', '1');
      this.renderer.setStyle(viewimage, 'transform', 'scale(1)');
    } else {
      this.viewImage.open = false;
      let viewimage = this.elementref.nativeElement.children[0].children[1].children[0];
      this.renderer.setStyle(viewimage, 'opacity', '0');
      this.renderer.setStyle(viewimage, 'transform', 'scale(0)');
    }
  }
  logRatingChange(rating){
    // do your stuff
}
  async onSearchChange(event) {
    let filterd = []
    if (event.target.value) {
  this.users.forEach(element => {

    let n:string = element.city.includes(event.target.value)
    if (n) {
      filterd.push(element)
    } else {

    }
this.users = filterd

  });
    } else {
      if(this.filterby) {
        this.getfilterdusers()
      } else {
        this.getusers();
      }
    }
  }
  hideTabs(cmd) {

    if (cmd=='close') {
            if (this.tabElements) {
              Object.keys(this.tabElements).map((key) => {
                this.tabElements[key].style.transform = 'translateY(50vh)';
                this.renderer.setStyle(this.tabElements[key], 'transform', 'translateY(50vh)')
                this.tabElements[key].style.transition = '0.4s';
              });
            }
            console.log('close tabs');
    } else {
      Object.keys(this.tabElements).map((key) => {
        // this.tabElements[key].style.transform = 'translateY(0vh)';
        this.renderer.setStyle(this.tabElements[key], 'transform', 'translateY(0vh)')
        this.tabElements[key].style.transition = '0.4s';
      });
      console.log('show tabs');

    }
  }
  viewSchool(data) {
    this.getReviews(data.schooluid);
    this.school = data;
    this.code08packs = []
    this.code10packs = []
    this.code14packs = []
    this.code01packs = []
    this.code08packs = data.packages[1].code08;
    this.code10packs = data.packages[2].code10;
    this.code14packs = data.packages[3].code14;
    this.code01packs = data.packages[0].code01;
    this.activePack = data.packages
    this.about = !this.about;
    this.school.cost = this.activePack[0].price
    let elements = document.getElementsByClassName("tabbar");
    if (this.about) {

             setTimeout(()=> {
              this.renderer.setStyle(elements[0],'transform', 'translateY(0vh)')
              Object.keys(elements).map((key) => {
                elements[key].style.transform = 'translateY(0vh)';
                elements[key].style.transition = '0.4s';
              });
             }, 200)

    } else {
      setTimeout(()=> {
        this.renderer.setStyle(elements[0],'transform', 'translateY(50vh)')
        Object.keys(elements).map((key) => {
          elements[key].style.transform = 'translateY(50vh)';
          elements[key].style.transition = '0.4s';
        });
       }, 200)
    }
  }
  //=================This is the method Nkwe altered========
  requestLesson(school, lsns, event, pckgType) {
    console.log();

    let data = {
       school: null,
       lessons: {
         amount: null,
         code: null,
         name: null,
         number: null
       }
     }
     if (pckgType == "Custom") {
       data.school = school
       data.lessons.number = lsns
       data.lessons.code = this.licenseCode
       data.lessons.name = pckgType
       data.lessons.amount = parseFloat(this.school.cost) * parseFloat(lsns)
     } else {
       data.school = school
       data.lessons = lsns
     }
     console.log(data);
     if (event.path.length != 0) {
      this.renderer.setStyle(event.path[0], 'transition', '0.4s');
      this.renderer.setStyle(event.path[0], 'transform', 'scale(1.07)');
      this.renderer.setStyle(event.path[0], 'background', 'linear-gradient(140deg, rgba(255, 242, 217, 0.616),rgb(255, 228, 173)),linear-gradient(45deg, rgba(179, 0, 104, 0.616),rgb(255, 228, 173))');
      setTimeout(()=>{
        this.renderer.setStyle(event.path[0], 'transform', 'scale(1)');
        this.renderer.setStyle(event.path[0], 'background', 'linear-gradient(40deg, rgba(255, 242, 217, 0.616),rgb(255, 228, 173)),linear-gradient(155deg, rgba(179, 0, 104, 0.616),rgb(255, 228, 173))');

        ///
       //  this.renderer.setStyle(event.path[0], 'background', 'url(../../assets/icon/package-background.svg),linear-gradient(45deg, rgba(255, 255, 255, 0.616),rgb(250, 182, 43)');

      }, 200);
     }

     setTimeout(()=> {
        this.appCtrl.getRootNav().push(ContactPage, data);
     }, 400)
     //
   }
   reviewsToggler() {
    this.toggleReviews = !this.toggleReviews
   }
  //  requests permission when the user clicks the location button
   async requestPrompt() {
     this.loaderAnimate = true;
    await this.androudPermissions.requestPermission(this.androudPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then( async res => {
      if (res.hasPermission) {
        await this.store.set('acceptedPermission', 'yes').then(res => {
this.getlocation();
        })

      } else {
        await this.store.set('acceptedPermission', 'no')
        this.mapCenter.lat = -29.465306;
      this.mapCenter.lng = 24.741967;
      // this.initMap()
      // load the map with the zoom of 2
      this.loadMap(2);
        this.getusers();
      }
   }).catch(async err => {
    await this.store.set('acceptedPermission', 'no')
    this.mapCenter.lat = -29.465306;
  this.mapCenter.lng = 24.741967;
  // this.initMap()
  // load the map with the zoom of 2
  this.loadMap(2);
    this.getusers();
   })
  }
  // initiates the first time the app opens
   async promptLocation() {
    this.loaderAnimate = true;
    this.store.get('acceptedPermission').then( async res => {
      // checks the acceptedPermission value if its null
      if(res==null) {
        // checks the permission
        this.androudPermissions.checkPermission(this.androudPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then( async res => {
          // if we dont have location permission
          if (res.hasPermission==false) {
            // request it here
        await this.androudPermissions.requestPermission(this.androudPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(res => {
          // check if the access is  true
          if (res.hasPermission) {
            // if access is true store update acceptedPermission to yes
            this.store.set('acceptedPermission', 'yes').then(res => {

            })
            this.getlocation();
          } else {
            // if the user denies the location then set the value to no
            this.store.set('acceptedPermission', 'no')
            this.mapCenter.lat = -29.465306;
      this.mapCenter.lng = 24.741967;
      // this.initMap()
      // load the map with the zoom of 2
      this.loadMap(2);
            this.getusers();
          }
        }).catch(err => {
               // if the user denies the location then set the value to no
            this.store.set('acceptedPermission', 'no')
            this.mapCenter.lat = -29.465306;
      this.mapCenter.lng = 24.741967;
      // this.initMap()
      // load the map with the zoom of 2
      this.loadMap(2);
            this.getusers();
        })
      }
    }).catch(err => {
      this.loaderAnimate = false;
        // if the user denies the location then set the value to no
        this.store.set('acceptedPermission', 'no')
        this.mapCenter.lat = -29.465306;
  this.mapCenter.lng = 24.741967;
  // this.initMap()
  // load the map with the zoom of 2
  this.loadMap(2);
        this.getusers();
    })
      } else if(res=='yes') {
        this.getlocation()
      } else if (res=='no') {
        this.mapCenter.lat = -29.465306;
      this.mapCenter.lng = 24.741967;
      // this.initMap()
      // load the map with the zoom of 2
      this.loadMap(2);
            this.getusers();
      }
    })
  }
  getUserPosition() {
       let options = {
        enableHighAccuracy: true,
      };
      this.geolocation.getCurrentPosition(options).then((pos) => {
        let geoData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        // get the address from the current position's coords
        this.geocoder.geocode({ 'location': geoData }, (results, status) => {
          console.log('Geocode responded with', results, 'and status of', status)
          if (status) {
            if (results[0]) {
              // get the city from the address components
              this.filterby = results[1].address_components[3].short_name;
              console.log('filterd by', this.filterby);
              this.getfilterdusers();
            } else {
              console.log('No results found');
            }
          } else {
            console.log('Geocoder failed due to: ' + status);
          }
        }, err => {
          console.log('Geocoder failed with', err)
        })
        this.mapCenter.lat = pos.coords.latitude;
      this.mapCenter.lng = pos.coords.longitude;
      }, (err: PositionError) => {
        console.log("error : " + err.message);
      }).catch(err => {

      })

  }
  // gets the location of the user and the driving schools in that area
  // can only be called after the user has accepted the permission
  async getlocation() {
    this.loaderAnimate = true;
    // get the current position
    await this.geolocation.getCurrentPosition().then((resp) => {

      this.mapCenter.lat = resp.coords.latitude;
      this.mapCenter.lng = resp.coords.longitude;
      let geoData = {
        lat: resp.coords.latitude,
        lng: resp.coords.longitude
      }
      // get the address from the current position's coords
      this.geocoder.geocode({'location': geoData},(results, status) =>{

        if (status ) {
          if (results[0]) {
            // get the city from the address components
            this.filterby = results[1].address_components[3].short_name;
            console.log('filterd by', this.filterby);
            // get schools depending on the city
            // this.loadMap(14)
            this.getfilterdusers();
          } else {
                        // if the user denies the location then set the value to no
                        this.store.set('acceptedPermission', 'no')
                        this.mapCenter.lat = -29.465306;
                  this.mapCenter.lng = 24.741967;
                  // this.initMap()
                  // load the map with the zoom of 2
                  this.loadMap(2);
                        this.getusers();
          }
        } else {
                      // if the user denies the location then set the value to no
                      this.store.set('acceptedPermission', 'no')
                      this.mapCenter.lat = -29.465306;
                this.mapCenter.lng = 24.741967;
                // this.initMap()
                // load the map with the zoom of 2
                this.loadMap(2);
                      this.getusers();
        }
      }, err => {
                    // if the user denies the location then set the value to no
                    this.store.set('acceptedPermission', 'no')
                    this.mapCenter.lat = -29.465306;
              this.mapCenter.lng = 24.741967;
              // this.initMap()
              // load the map with the zoom of 2
              this.loadMap(2);
                    this.getusers();
      });
      // generate marker info for the user
      let data = {
        schooladdress: {
          lng: resp.coords.longitude,
          lat: resp.coords.latitude
        },
        schoolname: 'You',
        address: ' '
      }
      // load the map with the zoom of 14
      this.loadMap(14);

      // create a radius around the user marker
      let radius = new google.maps.Circle({
        strokeColor: 'rgba(255, 154, 59, 0.589)',
        strokeOpacity: 0.01,
        strokeWeight: 2,
        fillColor: 'rgb(255, 148, 49)',
        fillOpacity: 0.01,
        map: this.map,
        center: data.schooladdress,
        radius: Math.sqrt(500) * 100
      });
      // this.initMap()
      // add a marker, will be different from the driving schools
      const marker = new google.maps.Marker({
        position: data.schooladdress,
        map: this.map,
        icon: 'https://firebasestorage.googleapis.com/v0/b/step-drive-95bbe.appspot.com/o/icons8-map-pin-64.png?alt=media&token=80953d82-f9c0-4b32-b8e9-dc83f9286f8b'
      })
      // add an info window to the user marker
      let infoWindow = new google.maps.InfoWindow({
        content: `<h5 style="margin:0;padding:0;">${data.schoolname} </h5>`+data.address
      });
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
       })
      // this.addMarker(data);


    }).catch((err) => {
      //  load default coords (center of SA) if the location was rejected
      this.mapCenter.lat = -29.465306;
      this.mapCenter.lng = 24.741967;
      // this.initMap()
      // load the map with the zoom of 2
      this.loadMap(2);
      //  get all of the driving schools
      this.getusers();
    })
  }
  swipeUp() {
    this.toggleReviews = false;
    this.display = !this.display;

  }
// loads our main map
  async loadMap(zoomlevel: number){
    let location;
    var ref = this;
    let watch = this.geolocation.watchPosition();

    let mapOptions = {
      center: this.mapCenter,
      zoom: zoomlevel,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      restriction: {
        latLngBounds: this.SOUTH_AFRICAN_BOUNDS,
        strictBounds: true
      },
      tilt: 45,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [
                { visibility: "off" }
          ]
      },
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#0078D7'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ]
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    setTimeout(()=> {
      this.map.setClickableIcons(false);
    },500)
    // this.loaderAnimate = false;
  }
  // add marker function
  addMarker(props) {
    // add marker
    let markerLabel = props.schoolname.split(' ')
    let bLetter = markerLabel[0].split('')

    const marker = new google.maps.Marker({
      position: props.coords,
      map: this.map,
      icon: 'https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23FFFFFF&icon=fa-car&color=%239F0500&voffset=0&hoffset=1&',
    })
    // check for custom icon
    // check for content
    if(props.address || props.schoolname) {
      // set custom content
     let infoWindow = new google.maps.InfoWindow({
       content: `<h5 style="margin:0;padding:0;">${props.schoolname} </h5>`+props.address
     });
     marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
     })
    }

  }
  addInfoWindow(marker, content){
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }
  // get every driving school, doesn't matter the location
  async getusers(){
    this.loaderAnimate = true;
   await this.db.collection('drivingschools').onSnapshot(async snapshot => {


      this.users = [];
      this.markers = [];
      this.userReviews = []
      snapshot.forEach( async doc => {
        this.users.push(doc.data());
        // this.addMarker(doc.data());

        this.markers.push(doc.data());
      })
      this.loaderAnimate = false;
     setTimeout( async () => {
      await this.markers.forEach( async element => {
        this.addMarker(element);
      })
     }, 1000)

    })
  }
  getReviews(school) {
    this.db.collection('reviews').where('schooluid', '==', school).onSnapshot(res => {
      this.userReviews = [];
      res.forEach(doc => {
        this.userReviews.push(doc.data());
      })


    })
  }
  async getfilterdusers(){
    this.loaderAnimate = true;
    await this.db.collection('drivingschools').where('city', '==', this.filterby).onSnapshot(async snapshot => {

       this.users = [];
       this.markers = []
       snapshot.forEach( async doc => {

         this.users.push(doc.data());
        //  this.addMarker(doc.data());

         this.markers.push(doc.data());
       })
       this.loaderAnimate = false;
      await this.markers.forEach( async element => {
         this.addMarker(element);
       })
     })
   }
  clearMarker(event) {
    for (let i = 0; i < this.users.length; i++) {
    }
  }
  call(school) {

    this.alertCtrl.create({
      message: `Call ${school.schoolname}?`,
      buttons: [{
        text: 'Call',
        handler: ()=>{
          this.callNumber.callNumber(school.cellnumber, true).then(res => {
          }).catch(err => {
          })
        }
      }, {
        text: 'Cancel',
        role: 'cancel'
      }]
    }).present();
  }
}
