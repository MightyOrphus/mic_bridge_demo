import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  username = signal<string>('');
  password = signal<string>('');
  isLoggedIn = signal<boolean>(false);

  updateUsername(val: string) {
    this.username.set(val);
  }

  updatePassword(val: string) {
    this.password.set(val);
  }

  login() {
    this.isLoggedIn.set(true);
  }

  logout() {
    this.isLoggedIn.set(false);
  }

  get credentials() {
    return {
      username: this.username(),
      password: this.password(),
    };
  }
}
