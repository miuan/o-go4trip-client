// 
// File generated by `npm run generate:blank trip/components.view/place-info/place-info`
//
// After activate you can access from 
//
// http://localhost:5000/#/dev/trip/components.view/place-info/place-info
//
//
// for ACTIVATE please add IMPORT and ROUTE in `src/app/dashboard/dashboard.ts`
//
// /*
//  * Here is router imports
//  */
// import { Place-info } from './trip/components.view/place-info/place-info';
//

import { Component, ViewContainerRef, ElementRef, Input, Output } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ResizeEvent } from 'angular-resizable-element';

import * as numeral from 'numeral';
import * as moment from 'moment';
import * as _ from 'lodash';

import { AlertComponent } from 'ng2-bootstrap/ng2-bootstrap';
import {EviService} from '../../../shared/services/evi.service';

import {TripService} from '../../services/trip.services';

let $ = require('jquery/dist/jquery.js');
let foundation = require('foundation-sites/dist/js/foundation.js');

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'g4t-place-info-view',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
  ],
   styleUrls: [ './place-info.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './place-info.component.html'
})
export class PlaceInfoViewComponent {
  
  @Input('place') place : any;
  @Input('places') places: Array<any>;
  @Input('index') index : number;
  @Input('uuid') uuid: string;
  
  timerToSave = null;

  //public fromPlace : any;
  public toPlace : any;

  public style: any = {
    height: '100px'
  };
  
  // TypeScript public modifiers
  constructor(private evi : EviService, private route : ActivatedRoute, private _el: ElementRef, private _tripService : TripService) {
      
  }

  public ngOnInit() {
  
  }

  public ngAfterViewInit() {
    //$(this._el.nativeElement.ownerDocument).foundation();
  }
  
  public ngOnChanges(changes: any){
    console.log('ngOnChanges', this.place);
    this.style.height = `${this.place.stayover}px`;

    let toIndex = this.index+1;
    if(toIndex == this.places.length){
      // this is last one
      toIndex = 0;
    }
    
    //this.fromPlace = this.place;
    this.toPlace = this.places[toIndex];
    
    //console.log(this.index, this.place, this.places);
  }
  
  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 50;
    if (event.rectangle.width < MIN_DIMENSIONS_PX || event.rectangle.height < MIN_DIMENSIONS_PX) {
      return false;
    }
    return true;
  }

  onResizing(event: ResizeEvent): void {
    this.style = {
      
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`
    };

    if(this.timerToSave){
      clearTimeout(this.timerToSave);
    }

    this.timerToSave = window.setTimeout(()=>{
      this._tripService.placeStayover(this.uuid, this.place.id, event.rectangle.height, ()=>{});
    }, 250);
    
  }

}