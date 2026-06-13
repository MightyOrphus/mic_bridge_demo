import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b flex justify-between items-center">
        <h3 class="font-bold text-gray-700">Items</h3>
        <button (click)="load()" class="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">No.</th>
            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Description</th>
            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Base Unit</th>
            <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase">Price</th>
          </tr>
        </thead>
        <body class="divide-y divide-gray-200">
          <tr *ngFor="let item of items()">
            <td class="px-6 py-4 font-medium">{{ item.No }}</td>
            <td class="px-6 py-4">{{ item.Description }}</td>
            <td class="px-6 py-4">{{ item.Base_Unit_of_Measure }}</td>
            <td class="px-6 py-4">{{ item.Unit_Price }}</td>
          </tr>
        </body>
      </table>
    </div>
  `,
})
export class ItemListComponent implements OnInit {
  private navService = inject(NavService);
  items = signal<any[]>([]);

  ngOnInit() { this.load(); }
  load() {
    this.navService.getItems(50).subscribe(res => {
      const list = res?.Item || [];
      this.items.set(Array.isArray(list) ? list : [list]);
    });
  }
}
