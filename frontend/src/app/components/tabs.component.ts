import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex border-b border-gray-200 mb-8 overflow-x-auto">
      <button
        *ngFor="let tab of tabs"
        (click)="tabSelected.emit(tab.id)"
        [class.border-blue-500]="activeTab === tab.id"
        [class.text-blue-600]="activeTab === tab.id"
        [class.border-transparent]="activeTab !== tab.id"
        class="py-3 px-6 text-sm font-bold text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 transition-all focus:outline-none whitespace-nowrap"
      >
        {{ tab.label }}
      </button>
    </div>
  `,
})
export class TabsComponent {
  @Input() activeTab: string = 'items';
  @Output() tabSelected = new EventEmitter<string>();

  tabs = [
    { id: 'items', label: 'Items' },
    { id: 'purchase-orders', label: 'Purchase Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'categories', label: 'Item Categories' },
  ];
}
