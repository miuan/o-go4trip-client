// 
// File generated by `npm run generate:blank place/component/place`
//
// After activate you can access from 
//
// http://localhost:5000/#/dev/place/component/place
//
//
// for ACTIVATE please add IMPORT and ROUTE in `src/app/dashboard/dashboard.ts`
//
// /*
//  * Here is router imports
//  */
// import { Place } from './place/component/place';
// 
//  ..
//  ..
//  ..
//
//  @RouteConfig([
//      { path: '/dev/place/component/place', component: Place, name: 'Placeplace-component/place' },   
//
//  ..
//  .. 
//


import { Component, ViewContainerRef, ElementRef, ViewChild, NgZone, Input, Output, EventEmitter } from '@angular/core';

import { AppState } from '../app.service';


import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Comment } from '../model/comment';
import { Observable } from 'rxjs/Rx';


import { Router, ActivatedRoute, Params } from '@angular/router';

import * as numeral from 'numeral';
import * as moment from 'moment';
import * as _ from 'lodash';

import { AlertComponent } from 'ng2-bootstrap/ng2-bootstrap';

import {EviService} from '../../../shared/services/evi.service';
import {GMapsService} from '../../../shared/services/gmaps.service';

import { FormControl } from "@angular/forms";
import { MapsAPILoader } from 'angular2-google-maps/core';

import {TripService} from '../../services/trip.services'

import * as polyline from '@mapbox/polyline';

let $ = require('jquery/dist/jquery.js');

declare var google: any;

const UNKNOW_PLACE_NAME = "Unknow place :-("

let data = {
  // lat lng
  // 49.22297320000001 17.85482120000006 - vizovice
  // 49.2244365 17.662763499999983 - zlin
  // 49.33892509999999 17.99385230000007 - vsetin
  // 48.1485965 17.107747700000004 - bratislava
  // 48.2081743 16.37381890000006 - viden
  // 50.06465009999999 19.94497990000002 - krakov
  // 50.0755381 14.43780049999998 - praha
  // 49.1950602 16.606837100000007 - brno
}

function findType(addressComponents, type){
  let res = '';

  addressComponents.some(ac=>{
    let typeIndex = ac.types.indexOf(type);

    if(typeIndex != -1){
      res = ac.short_name;
      return true;
    }

  })

  return res;

}

function placeNameGenerator(addressComponents){
  let admin1 = findType(addressComponents, 'administrative_area_level_2');
  
  if(!admin1){
    admin1 = findType(addressComponents, 'administrative_area_level_1');
  }
  
  let locality = findType(addressComponents, 'locality');

  return (locality ? locality + ', ' : '') 
                    + (admin1 ? admin1 + ', ' : '')
                    + findType(addressComponents, 'country');
}


var map, poly;



@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'g4t-map',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
  ],
   styleUrls: [ './place.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './place.component.html'
})
export class PlaceComponent {
  // Set our default values
  public lat : number;
  public lng : number;

  public marker_lat : number;
  public marker_lng : number;

  public zoom : number = 6;

  public tripId;
  @Input('wayUuid') public wayUuid;
  public afterIndex;

  public geocoder;
  public geocoder_loading = false;

  public placeName : string = null;

  public googlePlaceId : string = null;

  public autocomplete = null;

  public images = null;

  public mapPhotoStyle = {};

  public infoWindow : any;

  public infoWindowMarker : any;

  @Input('places') places = [];
  //@Input('way') way:any;
  @Input('trip') trip:any;

  @ViewChild("googleMapInfoWindow") public googleMapInfoWindowView : ElementRef;

  @ViewChild("searchGoogle") public searchElementRef: ElementRef;

  @Output("onPlacesChanged") public onPlacesChangedEmitter = new EventEmitter();

  flightPath : any;
  
  paths: Array<any> = [
      { lat: 0,  lng: 10 },
      { lat: 0,  lng: 20 },
      { lat: 10, lng: 20 },
      { lat: 10, lng: 10 },
      { lat: 0,  lng: 10 }
    ]

  public searchControl: FormControl;

  // TypeScript public modifiers
  constructor(private evi : EviService, 
                private route : ActivatedRoute, 
                private router : Router,
                private _el: ElementRef , 
                private _gmaps : GMapsService,
                private mapsAPILoader: MapsAPILoader,
                private _tripService: TripService,
                public zone: NgZone) {
      
  }

    ngOnInit() {
    // https://developers.google.com/maps/documentation/javascript/examples/polyline-complex
    
    

    window.scrollTo(0, 0);

    const sub = this.route.params.subscribe(params => {
       this.tripId = params['tripid'];
       this.wayUuid = params['uuid'];
       this.afterIndex = params['afterIndex']
        // could happend the visitor of this page
        // is comming with empty id -> show just search box
        if(params['lat'] && params['lng']){
            this.lat = Number(params['lat']);
            this.lng = Number(params['lng']);
            //console.log(this.lat, this.lng);
        }
     });

    //create search FormControl
    this.searchControl = new FormControl();

    // http://brianflove.com/2016/10/18/angular-2-google-maps-places-autocomplete/
    this.mapsAPILoader.load().then((MAP) => {
      this.initMap();



      
        // var flightPath = new google.maps.Polyline({
          
        //   geodesic: true,
        //   strokeColor: '#FF0000',
        //   strokeOpacity: 1.0,
        //   strokeWeight: 2
        // });



      this.geocoder = new google.maps.Geocoder({
        language: 'en'
      });

      
      
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        //  types: ["address"]
        language: 'en'
      });
      
      

      autocomplete.addListener("place_changed", () => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        // for some reason the zone doesn't handle changes 
        // when they komming from google

        this.zone.run(()=>{
        //set latitude and longitude
          this.lat = this.marker_lat = place.geometry.location.lat();
          this.lng = this.marker_lng = place.geometry.location.lng();
          
          this.placeName = placeNameGenerator(place.address_components) || place.formatted_address;
          this.lookForImages(place);

          this.googlePlaceId = place.place_id;
        });

        
        
      });

      this.autocomplete = autocomplete;

    });
    
    // just in case the lat and lng was not set
    // put the current location
    if(!this.lat || !this.lng){
      this.setCurrentPosition();
    }
    
  }

  ngOnChanges (){
    this.transports = [];
    console.log('ngOnChange:' + this.places.length, polyline, this.places)
    if(!this.places || this.places.length < 1){
      return;
    }

    this.places.forEach(place => {
      if(place.moves && place.moves.cache && place.moves.cache.polylines){
        let transport = polyline.decode(place.moves.cache.polylines)

        if(place.infoplace.place_id != place.moves.cache.place1){
          transport.reverse();
        } 

        this.transports.push(transport);
        
      }
      
    })

    
    if(this.trip ){
      this.tripId = this.trip.id;
    }

    console.log('this.trip && this.way'+this.tripId, this.trip, this.wayUuid)
  }

 initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          
        });

        map.addListener('click', (clickevent)=>{
          console.log('event - click', clickevent, clickevent.latLng)
          this.onMapClick(clickevent.latLng);
        });


        var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
            '<div id="bodyContent">'+
            '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
            'sandstone rock formation in the southern part of the '+
            'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
            'south west of the nearest large town, Alice Springs; 450&#160;km '+
            '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
            'features of the Uluru - Kata Tjuta National Park. Uluru is '+
            'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
            'Aboriginal people of the area. It has many springs, waterholes, '+
            'rock caves and ancient paintings. Uluru is listed as a World '+
            'Heritage Site.</p>'+
            '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
            'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
            '(last visited June 22, 2009).</p>'+
            '</div>'+
            '</div>';

        this.infoWindow = new google.maps.InfoWindow({
          content: contentString
        });


        let bounds = this.showWayOnMap();


        map.fitBounds(bounds);
        // Add a listener for the click event
        //map.addListener('click', this.addLatLng);
      }

  /**
   * show transport data on map
   */
  public showWayOnMap(){
    var flightPlanCoordinates = [];

    var bounds = new google.maps.LatLngBounds();

    this.transports.forEach((transport, transportIndex)=>{
      console.log('sadfsdfsda', transport[0][0], transport[0][1]);
      transport.forEach((p, pointIndex)=>{
        let latlng = new google.maps.LatLng(p[0], p[1]);


        if(pointIndex == 0 || (pointIndex == transport.length-1 && transportIndex == this.transports.length-1)){
          var marker = new google.maps.Marker({
            position: latlng,
            map: map
          });

          bounds.extend(latlng);
        }

        flightPlanCoordinates.push(latlng)
      })
      
    });

    if(this.flightPath){
      this.flightPath.setMap(null);
      this.flightPath = null;
    }

    this.flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      strokeColor: '#000000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      editable: true
    });

    //http://stackoverflow.com/questions/15693077/event-handler-for-editing-a-google-maps-polyline
    //google.maps.event.addListener(this.flightPath, "dragend", (event, event2)=>{this.getPath(event, event2)});
    // google.maps.event.addListener(this.flightPath.getPath(), "insert_at", (event, event2)=>this.getPath(event, event2));
    // google.maps.event.addListener(this.flightPath.getPath(), "remove_at", (event, event2)=>this.getPath(event, event2));
    google.maps.event.addListener(this.flightPath.getPath(), "set_at", (event, event2)=>this.getPath(event, event2));

    this.flightPath.setMap(map);

    return bounds;
  }    

  getPath(event, event2) {
    console.log('draged++++++++++++++',event, this.flightPath, this.flightPath.getPath())
    //  var path = flightPath.getPath();
    //  var len = path.getLength();
    //  var coordStr = "";
    //  for (var i=0; i<len; i++) {
    //    coordStr += path.getAt(i).toUrlValue(6)+"<br>";
    //  }
    //  document.getElementById('path').innerHTML = coordStr;
  }

      // Handles click events on a map, and adds a new point to the Polyline.
  addLatLng(event) {
        var path = poly.getPath();

        // Because path is an MVCArray, we can simply append a new coordinate
        // and it will automatically appear.
        path.push(event.latLng);

        // Add a new marker at the new plotted point on the polyline.
        var marker = new google.maps.Marker({
          position: event.latLng,
          title: '#' + path.getLength(),
          map: map
        });
 }





  private lookForImages(place){
    this.images = null;
    this.mapPhotoStyle = null;
    let keyword = findType(place.address_components, 'locality');

    console.log('place', keyword, place);
    if(keyword){
      
      this._tripService.checkPhotosForKeywords([keyword], place.place_id, (images)=>{
        console.log('checkPhotosForKeywords', images);
        if(images && images.length > 0){
          this.images = images;

          this.mapPhotoStyle = {
            backgroundImage : 'url(https://res.cloudinary.com/miuan/image/upload/w_293,h_165,c_fill,g_center/'+ images[0].cloudinary,
            width:  '293px',
            height: '165px',
            backgroundPosition: 'center',
            backgroundSize: 'crop'
        }
        }
      });
    }
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
         console.log("geolocation", this.lat, this.lng);
        this.zoom = 12;
      });
    }
  }



  addPlaceToTripOrCreateNewTrip(transpartType){
    this.geocoder_loading = true;
    if(this.tripId && this.wayUuid){

        this._tripService.addPlaceToAlternative(this.marker_lat, this.marker_lng, this.placeName, this.wayUuid, this.afterIndex, this.googlePlaceId, transpartType, (data)=>{
          //this.router.navigate(['/trip', this.tripId, 'way', this.wayUuid , {placeId: data.id}]);
          console.log('this.onPlacesChangedEmitter.emit(data.places);', data.places)
          this.onPlacesChangedEmitter.emit(data.places);
          this.places = data.places;
          this.ngOnChanges();
          this.showWayOnMap();
        });

      } else {
        // in case we don't know id of trip and uuid of alternative
        // we have to create new trip
        this._tripService.createTrip(this.marker_lat, this.marker_lng, this.placeName, this.googlePlaceId, transpartType, (data)=>{
          
        })
      }
  }


  onSearch(){
    
  }


  place2 = '';

  onMapClick(data){
    

    //this.googleMapInfoWindowView.open();
    this.marker_lat = null;
    this.marker_lng = null;

    this.geocoder_loading = true;
    this.placeName = null;

    this.marker_lat = data.lat();
    this.marker_lng = data.lng();

    let location = {
      'location': {
          lat: this.marker_lat,
          lng : this.marker_lng
      },'language' : 'en'
    };

    this.geocoder.geocode(location, (results, status) => {
        this.placeName = null;

        this.zone.run(()=>{
          this.updatePlaceNameFromGeoCodeData(results, status, 'locality.political');
          if(!this.placeName){
            this.updatePlaceNameFromGeoCodeData(results, status, 'administrative_area_level_2.political');
          }
          if(!this.placeName){
            this.updatePlaceNameFromGeoCodeData(results, status, 'administrative_area_level_1.political');
          }

        })

        console.log('results,status', results, status);
        
        this.createInfoWindow(location.location);
        

    });

  }


  public createInfoWindow(location){
    if(this.infoWindowMarker){
      this.infoWindowMarker.setMap(null);
      this.infoWindowMarker = null;
    }

    this.infoWindowMarker = new google.maps.Marker({
        position: location,
        map: map
    });


    window.addPlaceToTripOrCreateNewTrip1 = (id) => {
      this.addPlaceToTripOrCreateNewTrip(id);
    }

    let content = `
      <h4>${this.placeName}</h4>
      <div *ngIf="tripId && uuid">
            <div  class="btn-group button-margin" role="group" aria-label="Basic example">
              <button type="button" class="btn btn-secondary btn-sm" onClick="addPlaceToTripOrCreateNewTrip1(1)">
                <i class="material-icons">directions_walk</i>Walk
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onClick="addPlaceToTripOrCreateNewTrip1(2)">
                <i class="material-icons">directions_bike</i>Bike
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onClick="addPlaceToTripOrCreateNewTrip1(3)">
                <i class="material-icons">thumb_up</i>HH
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onClick="addPlaceToTripOrCreateNewTrip1(0)">
                <i class="material-icons">drive_eta</i>Car
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onClick="addPlaceToTripOrCreateNewTrip1(4)">
                <i class="material-icons">airplanemode_active</i>Flight
              </button>
            </div> 
            (to add this place to your trip choice transport)
        </div>
    `;
    

    this.infoWindow.close();
    this.infoWindow = new google.maps.InfoWindow({
      content
    });   
    this.infoWindow.open(map, this.infoWindowMarker);

    // http://stackoverflow.com/questions/6777721/google-maps-api-v3-infowindow-close-event-callback
    google.maps.event.addListener(this.infoWindow, 'closeclick',function(){
      
      this.infoWindowMarker.setMap(null); //removes the marker
      // then, remove the infowindows name from the array
    });
  }

  updatePlaceNameFromGeoCodeData(results, status, type){
    this.geocoder_loading = false;

        if(results.length > 0) {

          results.some((res) => {
            

            let type1 = res.types.join('.');


            if(type1 == type){

              console.log('res',  res.geometry.location.lat(),  res.geometry.location.lng());


              this.marker_lat = res.geometry.location.lat();
              this.marker_lng = res.geometry.location.lng();

              let addressComponents = res.address_components;
              
              // construct name from street[1] + city[2] + state[3]
              if(addressComponents && addressComponents.length){
                  this.placeName =  placeNameGenerator(addressComponents);
              } else {
                // use formated address
                this.placeName = res.formatted_address;
              }

              this.lookForImages(res);

              //this.place2 = this.placeName;
              //console.log('autocomplete', this.autocomplete, this.autocomplete.getPlace());
              this.googlePlaceId = res.place_id;
              
              return true;

            }
          });

          

        } else {

          // the google can't name this place
          this.placeName = UNKNOW_PLACE_NAME
        }
  }

  onInfoWindowClose(event){
    console.log('onInfoWindowClose', event);
  }

  transports = [];

  

  lineDragEnd(event){
    console.log(event);
  }
}
