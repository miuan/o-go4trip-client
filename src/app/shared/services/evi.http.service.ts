import { Injectable } from "@angular/core"
import { Http, Headers, Response, ConnectionBackend, RequestOptions, RequestOptionsArgs } from "@angular/http"
import { SettingsService } from "./settings.service"
import { Observable } from "rxjs/Rx"
import { Location } from "@angular/common"

import {LoaderM} from "../components/loader/";

// http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
function serializeQuery( obj ) {
  if(!obj) {
    return '';
  }

  return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
}

function 


@Injectable()
export class EviHttpService {
  constructor(private _settingsService: SettingsService, private _http: Http) {
      
  }

  auth(options?: RequestOptionsArgs) : RequestOptionsArgs  {
    if(!this._settingsService.token){
        return options;
    }

    if(!options){
      options = {};
    }

    if(!options.headers){
      options.headers = new Headers();
    }

    options.headers.append('Authorization', 'Bearer '+ this._settingsService.token);

    return options;
  }

  // get with loader object
  public getwl(data : LoaderM<any>, url: string, query? : any, options?: RequestOptionsArgs): Observable<Response> {
    let observ = new Observable<Response>(observer => {
        data.loading = true;
        setTimeout(()=>{
          
          this.get(url, query, options)
          
          /*.catch((ex, caught) : any => {
              console.error('ex, caught', ex, caught);
              return true;
          })*/
          
          .subscribe((res)=>{
            data.data = res;
            observer.next(res);
            
          }, (error)=>{
            data.error = error;
            console.error('data.error', data.error);
          }, ()=>{
              data.loading = false;
          });

        }, 1);
        

    });
    
    return observ;
  }

  public get(url: string, query? : any, options?: RequestOptionsArgs): Observable<Response> {
    options = this.auth(options);

    return this.intercept(this._http.get(this.customizeURL(url) + serializeQuery(query), options));
  }


  public post(url: string, body, options?: RequestOptionsArgs): Observable<Response> {
    //options = this.addAuthenticaitonAccessToken(options);

    return this.intercept(this._http.post(this.customizeURL(url), body, options));
  }


  public put(url: string, body, options?: RequestOptionsArgs): Observable<Response> {
    //options = this.addAuthenticaitonAccessToken(options);

    return this.intercept(this._http.put(this.customizeURL(url), body, options));
  }


  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    //options = this.addAuthenticaitonAccessToken(options);

    return this.intercept(this._http.delete(this.customizeURL(url), options));
  }

  private customizeURL(url : string) : string {
    
    if(this._settingsService.API_SERVER_MOCK){
      return this.customizeMockURL(url);
    }

    return this._settingsService.API_SERVER_URL + url;
  }

  private customizeMockURL(url: string) : string {
    return '/assets/mock-data/' + url + '.json';
  }

  private intercept(observable: Observable<Response>): Observable<Response> {
  
    return observable.map(data => data = data.json());
  }
}