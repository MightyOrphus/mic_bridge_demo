import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header.component';
import { TabsComponent } from './components/tabs.component';
import { CategoryListComponent } from './components/category-list.component';
import { CustomerListComponent } from './components/customer-list.component';
import { ItemListComponent } from './components/item-list.component';
import { POListComponent } from './components/po-list.component';
import { AuthStore } from './services/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TabsComponent,
    CategoryListComponent,
    CustomerListComponent,
    ItemListComponent,
    POListComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100 font-sans text-slate-900">
      <app-header (loginTriggered)="onAuthChange()"></app-header>

      <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <app-tabs [activeTab]="activeTab()" (tabSelected)="activeTab.set($event)"></app-tabs>

        <div *ngIf="!authStore.isLoggedIn()" class="bg-white shadow-xl rounded-2xl p-16 text-center border border-slate-200 animate-in fade-in zoom-in duration-500">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
             <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          </div>
          <h2 class="text-3xl font-black text-slate-800 mb-4">Dynamics NAV BFF Portal</h2>
          <p class="text-slate-500 text-lg max-w-md mx-auto">Enter your enterprise credentials in the header above to access items, purchase orders, and customer data.</p>
        </div>

        <div *ngIf="authStore.isLoggedIn()" [ngSwitch]="activeTab()" class="animate-in fade-in duration-300">
          <app-item-list *ngSwitchCase="'items'"></app-item-list>
          <app-po-list *ngSwitchCase="'purchase-orders'"></app-po-list>
          <app-customer-list *ngSwitchCase="'customers'"></app-customer-list>
          <app-category-list *ngSwitchCase="'categories'"></app-category-list>
        </div>
      </main>
    </div>
  `,
})
export class App {
  activeTab = signal<string>('items');
  authStore = inject(AuthStore);

  onAuthChange() {
    const current = this.activeTab();
    this.activeTab.set('');
    setTimeout(() => this.activeTab.set(current), 10);
  }
}
