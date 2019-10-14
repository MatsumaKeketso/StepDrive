import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-question1',
  templateUrl: 'question1.html',
})
export class Question1Page {
  booking = {
    schoolname: '',
    start: '',
    end: '',
    time: ''
  }
  constructor(public navCtrl: NavController, public navParams: NavParams ) { }
  ionViewDidLoad() {
    console.log(this.navParams);
    this.booking.schoolname = this.navParams.data.school.school.schoolname
    this.booking.start = this.navParams.data.request.datein;
    this.booking.end = this.navParams.data.request.dateout;
    this.booking.time = this.navParams.data.request.time;
  }
home() {
  this.navCtrl.setRoot(TabsPage);
}
}
