import { Component, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../services/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center">
      <div class="text-xl font-bold tracking-tight">Dynamics NAV BFF</div>
      <div class="flex gap-3 items-center">
        <input
          type="text"
          [ngModel]="authStore.username()"
          (ngModelChange)="authStore.updateUsername($event)"
          placeholder="Domain\\User"
          class="bg-slate-700 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500 w-40"
        />
        <input
          type="password"
          [ngModel]="authStore.password()"
          (ngModelChange)="authStore.updatePassword($event)"
          placeholder="Password"
          class="bg-slate-700 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500 w-40"
        />
        <button
          (click)="onLogin()"
          class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded transition-colors shadow-sm"
        >
          {{ authStore.isLoggedIn() ? 'Reconnect' : 'Login' }}
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authStore = inject(AuthStore);
  @Output() loginTriggered = new EventEmitter<void>();

  onLogin() {
    this.authStore.login();
    this.loginTriggered.emit();
  }
}
