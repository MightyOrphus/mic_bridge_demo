import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
        <h3 class="font-bold text-gray-700">Customers</h3>
        <button (click)="loadCustomers()" class="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">City</th>
            </tr>
          </thead>
          <body class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let customer of customers()">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ customer.No }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ customer.Name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ customer.City }}</td>
            </tr>
            <tr *ngIf="customers().length === 0">
              <td colspan="3" class="px-6 py-10 text-center text-gray-500">No customers found.</td>
            </tr>
          </body>
        </table>
      </div>
    </div>
  `,
})
export class CustomerListComponent implements OnInit {
  private navService = inject(NavService);
  customers = signal<any[]>([]);

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.navService.getCustomers(50).subscribe({
      next: (res) => {
        const list = res?.Customer || [];
        this.customers.set(Array.isArray(list) ? list : [list]);
      },
      error: (err) => console.error(err),
    });
  }
}
