import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50 border-slate-200">
          <h3 class="font-bold text-slate-800">Purchase Order Headers (Master)</h3>
          <button (click)="load()" [disabled]="loading()" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
             {{ loading() ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
        <div *ngIf="error()" class="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
          <strong>Error:</strong> {{ error() }}
        </div>
        <div class="overflow-x-auto max-h-[400px]">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">PO No.</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Vendor</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <body class="divide-y divide-slate-200 bg-white">
              <tr *ngFor="let po of pos()"
                  (click)="selectPO(po)"
                  [class.bg-blue-50]="selectedPO()?.No === po.No"
                  class="cursor-pointer hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900">{{ po.No }}</td>
                <td class="px-6 py-4 text-slate-600">{{ po.Buy_from_Vendor_Name || po.Buy_from_Vendor_No }}</td>
                <td class="px-6 py-4 text-slate-600">{{ po.Order_Date }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="po.Status === 'Released' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
                    {{ po.Status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="!loading() && pos().length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-500 italic">No Purchase Orders found.</td>
              </tr>
              <tr *ngIf="loading()">
                <td colspan="4" class="px-6 py-12 text-center text-slate-500">Fetching POs from Dynamics NAV...</td>
              </tr>
            </body>
          </table>
        </div>
      </div>

      <div *ngIf="selectedPO()" class="bg-white shadow rounded-lg overflow-hidden border-t-4 border-blue-500 animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="px-6 py-4 border-b bg-slate-50 border-slate-200">
          <h3 class="font-bold text-slate-800">Lines for Order: <span class="text-blue-600">{{ selectedPO()?.No }}</span></h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">No.</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider">Unit Cost</th>
                <th class="px-6 py-3 text-right font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <body class="divide-y divide-slate-200 bg-white">
              <tr *ngFor="let line of getLines()">
                <td class="px-6 py-4 font-medium text-slate-900">{{ line.No }}</td>
                <td class="px-6 py-4 text-slate-600">{{ line.Description }}</td>
                <td class="px-6 py-4 text-right text-slate-600">{{ line.Quantity }}</td>
                <td class="px-6 py-4 text-right text-slate-600">{{ line.Direct_Unit_Cost | number:'1.2-2' }}</td>
                <td class="px-6 py-4 text-right font-bold text-blue-600">{{ line.Line_Amount | number:'1.2-2' }}</td>
              </tr>
            </body>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class POListComponent implements OnInit {
  private navService = inject(NavService);
  pos = signal<any[]>([]);
  selectedPO = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.navService.getPurchaseOrders(50).subscribe({
      next: (res) => {
        const list = res?.PurchaseOrder || [];
        this.pos.set(Array.isArray(list) ? list : [list]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || err.message);
        this.loading.set(false);
      }
    });
  }

  selectPO(po: any) {
    this.selectedPO.set(po);
  }

  getLines() {
    const po = this.selectedPO();
    if (!po) return [];
    let lines = [];
    if (po.PurchaseOrder_Lines) {
       lines = po.PurchaseOrder_Lines.PurchaseOrder_Lines || po.PurchaseOrder_Lines;
    } else if (po.Lines) {
       lines = po.Lines.PurchaseOrder_Lines || po.Lines;
    }
    return Array.isArray(lines) ? lines : (lines ? [lines] : []);
  }
}
