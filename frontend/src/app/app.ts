import { Component, signal, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header.component';
import { TabsComponent } from './components/tabs.component';
import { CreateItemComponent } from './components/create-item.component';
import { UpdateItemComponent } from './components/update-item.component';
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
    CreateItemComponent,
    UpdateItemComponent,
    CategoryListComponent,
    CustomerListComponent,
    ItemListComponent,
    POListComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
      <app-header (loginTriggered)="onAuthChange()"></app-header>

      <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <app-tabs [activeTab]="activeTab()" (tabSelected)="activeTab.set($event)"></app-tabs>

        <div *ngIf="!authStore.isLoggedIn()" class="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <h2 class="text-2xl font-bold text-blue-800 mb-2">Welcome to Dynamics NAV BFF</h2>
          <p class="text-blue-600">Please enter your Domain\\User and Password above to connect to the system.</p>
        </div>

        <div *ngIf="authStore.isLoggedIn()" [ngSwitch]="activeTab()">
          <app-item-list *ngSwitchCase="'items'"></app-item-list>
          <app-po-list *ngSwitchCase="'purchase-orders'"></app-po-list>
          <app-customer-list *ngSwitchCase="'customers'"></app-customer-list>
          <app-category-list *ngSwitchCase="'categories'"></app-category-list>
          <app-create-item *ngSwitchCase="'create-item'"></app-create-item>
          <app-update-item *ngSwitchCase="'update-item'"></app-update-item>
        </div>
      </main>
    </div>
  `,
})
export class App {
  activeTab = signal<string>('items');
  authStore = inject(AuthStore);

  onAuthChange() {
    // This will trigger re-render of current tab components which usually fetch on init
    // but since they might already be initialized, they should ideally listen to auth changes or we can reset tab
    const current = this.activeTab();
    this.activeTab.set('');
    setTimeout(() => this.activeTab.set(current), 10);
  }
}
