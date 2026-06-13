import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
        <h3 class="font-bold text-gray-700">Item Categories</h3>
        <button (click)="loadCategories()" class="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <body class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let cat of categories()">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ cat.Code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ cat.Description }}</td>
            </tr>
            <tr *ngIf="categories().length === 0">
              <td colspan="2" class="px-6 py-10 text-center text-gray-500">No categories found.</td>
            </tr>
          </body>
        </table>
      </div>
    </div>
  `,
})
export class CategoryListComponent implements OnInit {
  private navService = inject(NavService);
  categories = signal<any[]>([]);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.navService.getCategories(100).subscribe({
      next: (res) => {
        const list = res?.ItemCategory || [];
        this.categories.set(Array.isArray(list) ? list : [list]);
      },
      error: (err) => console.error(err),
    });
  }
}
