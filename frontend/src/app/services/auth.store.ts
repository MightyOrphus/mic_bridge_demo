import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  username = signal<string>('');
  password = signal<string>('');

  updateUsername(val: string) {
    this.username.set(val);
  }

  updatePassword(val: string) {
    this.password.set(val);
  }

  get credentials() {
    return {
      username: this.username(),
      password: this.password(),
    };
  }
}
