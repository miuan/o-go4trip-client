// 
// File generated by `npm run generate:blank trip/components.view/timeline/timeline`
//
// After activate you can access from 
//
// http://localhost:5000/#/dev/trip/components.view/timeline/timeline
//
//
// for ACTIVATE please add IMPORT and ROUTE in `src/app/dashboard/dashboard.ts`
//
// /*
//  * Here is router imports
//  */
// import { Timeline } from './trip/components.view/timeline/timeline';
// 
//  ..
//  ..
//  ..
//
//  @RouteConfig([
//      { path: '/dev/trip/components.view/timeline/timeline', component: Timeline, name: 'Timelinetrip-components.view/timeline/timeline' },   
//
//  ..
//  .. 
//


import { Component, ViewContainerRef, ElementRef, Input } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Rx';


import { Router, ActivatedRoute, Params } from '@angular/router';

import * as numeral from 'numeral';
import * as moment from 'moment';
import * as _ from 'lodash';

import { AlertComponent } from 'ng2-bootstrap/ng2-bootstrap';

import {EviService} from '../../../shared/services/evi.service';

let $ = require('jquery/dist/jquery.js');

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'g4t-trip-timeline',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
  ],
   styleUrls: [ './timeline.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './timeline.component.html'
})
export class TimelineViewComponent {

  @Input('totalMinutes') public totalTripMinutes = 0;

  public lineDays;

  days = [1,2,3,4,5,6,7];
  
  hours = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
    ];
    
  constructor(private evi : EviService, private route : ActivatedRoute, private _el: ElementRef ) {
      
  }

  public ngOnInit() {

  }


  public ngOnChanges(){
    // always adding week in adwance
    this.lineDays = Math.ceil(this.totalTripMinutes/1440) + 8;

    this.days = [];

    for(let i = 0; i < this.lineDays; i++){
      this.days.push(i+1);
    }
  }

}