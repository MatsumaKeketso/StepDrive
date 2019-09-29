import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-question1',
  templateUrl: 'question1.html',
})
export class Question1Page {

  constructor(public navCtrl: NavController, public navParams: NavParams ) { }
  ionViewDidLoad() {}
home() {
  this.navCtrl.setRoot(TabsPage);
}
}
