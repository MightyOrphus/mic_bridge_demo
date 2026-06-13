import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50 border-slate-200">
        <h3 class="font-bold text-slate-800">Items</h3>
        <button (click)="load()" [disabled]="loading()" class="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-gray-400">
          {{ loading() ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div *ngIf="error()" class="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
        <strong>Error:</strong> {{ error() }}
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">No.</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Base Unit</th>
              <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <body class="divide-y divide-slate-200 bg-white">
            <tr *ngFor="let item of items()" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-medium text-slate-900">{{ item.No }}</td>
              <td class="px-6 py-4 text-slate-600">{{ item.Description }}</td>
              <td class="px-6 py-4 text-slate-600">{{ item.Base_Unit_of_Measure }}</td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ item.Unit_Price | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="!loading() && items().length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-slate-500 italic">No items found.</td>
            </tr>
            <tr *ngIf="loading()">
              <td colspan="4" class="px-6 py-12 text-center text-slate-500">Fetching data from Dynamics NAV...</td>
            </tr>
          </body>
        </table>
      </div>
    </div>
  `,
})
export class ItemListComponent implements OnInit {
  private navService = inject(NavService);
  items = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.navService.getItems(50).subscribe({
      next: (res) => {
        const list = res?.Item || [];
        this.items.set(Array.isArray(list) ? list : [list]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err.error?.message || err.message || 'Unknown error occurred');
        this.loading.set(false);
      }
    });
  }
}
