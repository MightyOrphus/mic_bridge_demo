import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthStore } from './auth.store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private apiUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const { username, password } = this.authStore.credentials;
    if (username && password) {
      headers = headers.set('x-nav-user', username).set('x-nav-pass', password);
    }
    return headers;
  }

  getCustomers(setSize: number = 50, bookmarkKey: string = ''): Observable<any> {
    const params = new HttpParams().set('setSize', setSize).set('bookmarkKey', bookmarkKey);
    return this.http.get(`${this.apiUrl}/customers`, { headers: this.getHeaders(), params });
  }

  getCategories(setSize: number = 100, bookmarkKey: string = ''): Observable<any> {
    const params = new HttpParams().set('setSize', setSize).set('bookmarkKey', bookmarkKey);
    return this.http.get(`${this.apiUrl}/item-categories`, { headers: this.getHeaders(), params });
  }

  getItems(setSize: number = 50, bookmarkKey: string = ''): Observable<any> {
    const params = new HttpParams().set('setSize', setSize).set('bookmarkKey', bookmarkKey);
    return this.http.get(`${this.apiUrl}/items`, { headers: this.getHeaders(), params });
  }

  getPurchaseOrders(setSize: number = 50, bookmarkKey: string = ''): Observable<any> {
    const params = new HttpParams().set('setSize', setSize).set('bookmarkKey', bookmarkKey);
    return this.http.get(`${this.apiUrl}/purchase-orders`, { headers: this.getHeaders(), params });
  }

  createItem(itemData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, itemData, { headers: this.getHeaders() });
  }

  updateItem(itemData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/items`, itemData, { headers: this.getHeaders() });
  }

  createPO(poData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase-orders`, poData, { headers: this.getHeaders() });
  }
}
