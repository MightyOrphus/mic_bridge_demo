import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../services/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center">
      <div class="text-xl font-bold">Dynamics NAV BFF</div>
      <div class="flex gap-4 items-center">
        <input
          type="text"
          [ngModel]="authStore.username()"
          (ngModelChange)="authStore.updateUsername($event)"
          placeholder="Username"
          class="bg-slate-700 text-white text-sm px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          [ngModel]="authStore.password()"
          (ngModelChange)="authStore.updatePassword($event)"
          placeholder="Password"
          class="bg-slate-700 text-white text-sm px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
        />
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authStore = inject(AuthStore);
}
