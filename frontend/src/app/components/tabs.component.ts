import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
      <button
        *ngFor="let tab of tabs"
        (click)="tabSelected.emit(tab.id)"
        [class.border-blue-500]="activeTab === tab.id"
        [class.text-blue-600]="activeTab === tab.id"
        [class.border-transparent]="activeTab !== tab.id"
        class="py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 transition-all focus:outline-none whitespace-nowrap"
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
    { id: 'create-item', label: 'Create Item' },
    { id: 'update-item', label: 'Update Item' },
  ];
}
