/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation, ElementRef, AfterViewInit, ViewContainerRef   } from '@angular/core';

import { AppState } from './app.service';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

let $ = require('jquery/dist/jquery.js');

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss'
  ],
  template: `
    
    <nav>
      <span>
        <a [routerLink]=" ['./'] ">
          Index
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./trips'] ">
          Trips
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./trip'] ">
          Trip
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./about'] ">
          About
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./invoice'] ">
          New Invoice
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./account'] ">
          Account
        </a>
      </span>|
      <span>
        <a [routerLink]=" ['./login'] ">
          Login
        </a>
      </span>|
      <span>
        <a [routerLink]=" ['./place'] ">
          Place
        </a>
      </span>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>

    
  `
})
export class AppComponent  {
  angularclassLogo = 'assets/img/angularclass-avatar.png';
  name = 'Angular 2 Webpack Starter';
  url = 'https://twitter.com/AngularClass';

  constructor(
    private _el: ElementRef,
    public appState: AppState,
    public overlay: Overlay,
    public vcRef: ViewContainerRef) {
      overlay.defaultViewContainer = vcRef;
  }

  ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

  ngAfterViewInit() {
    
  }

}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
