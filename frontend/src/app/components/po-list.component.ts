import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Create PO Block -->
      <div class="bg-white shadow rounded-lg border-l-4 border-amber-500 overflow-hidden">
        <div class="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">Create New Purchase Order</h3>
          <button (click)="showCreate = !showCreate" class="text-xs text-blue-600 font-bold uppercase tracking-wider">
            {{ showCreate ? 'Hide Form' : 'Show Form' }}
          </button>
        </div>
        <div *ngIf="showCreate" class="p-6">
          <form [formGroup]="createForm" (ngSubmit)="onCreate()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor No.</label>
              <input formControlName="Buy_from_Vendor_No" placeholder="e.g. 10000" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Order Date</label>
              <input type="date" formControlName="Order_Date" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <input formControlName="Description" placeholder="Internal memo" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-4">
              <button type="submit" [disabled]="createForm.invalid || loading()" class="w-full bg-amber-600 text-white py-2 rounded font-bold text-sm hover:bg-amber-700 transition-colors shadow-sm">
                Create Order Header
              </button>
            </div>
          </form>
          <p *ngIf="createMessage" class="mt-4 text-sm font-medium" [class.text-green-600]="!createError" [class.text-red-600]="createError">
            {{ createMessage }}
          </p>
        </div>
      </div>

      <!-- Master Table: PO Headers -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50 border-slate-200">
          <h3 class="font-bold text-slate-800">Purchase Order Headers (Master)</h3>
          <button (click)="load()" [disabled]="loading()" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
             {{ loading() ? 'Loading...' : 'Refresh List' }}
          </button>
        </div>
        <div *ngIf="error()" class="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
          {{ error() }}
        </div>
        <div class="overflow-x-auto max-h-[400px]">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">PO No.</th>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">Vendor</th>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <body class="divide-y divide-slate-200 bg-white">
              <tr *ngFor="let po of pos()"
                  (click)="selectPO(po)"
                  [class.bg-blue-50]="selectedPO()?.No === po.No"
                  class="cursor-pointer hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-bold text-slate-900">{{ po.No }}</td>
                <td class="px-6 py-4 text-slate-600">{{ po.Buy_from_Vendor_Name || po.Buy_from_Vendor_No }}</td>
                <td class="px-6 py-4 text-slate-600">{{ po.Order_Date }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        [ngClass]="po.Status === 'Released' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'">
                    {{ po.Status }}
                  </span>
                </td>
              </tr>
            </body>
          </table>
        </div>
      </div>

      <!-- Detail Table: PO Lines -->
      <div *ngIf="selectedPO()" class="bg-white shadow rounded-lg overflow-hidden border-t-4 border-blue-500 animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="px-6 py-4 border-b bg-slate-50 border-slate-200">
          <h3 class="font-bold text-slate-800">Lines for Order: <span class="text-blue-600">{{ selectedPO()?.No }}</span></h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">No.</th>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">Description</th>
                <th class="px-6 py-3 text-right font-bold text-slate-500 uppercase">Quantity</th>
                <th class="px-6 py-3 text-right font-bold text-slate-500 uppercase">Unit Cost</th>
                <th class="px-6 py-3 text-right font-bold text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <body class="divide-y divide-slate-200 bg-white">
              <tr *ngFor="let line of getLines()">
                <td class="px-6 py-4 font-bold text-slate-900">{{ line.No }}</td>
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
  private fb = inject(FormBuilder);

  pos = signal<any[]>([]);
  selectedPO = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showCreate = false;

  createMessage = '';
  createError = false;

  createForm = this.fb.group({
    Buy_from_Vendor_No: ['', Validators.required],
    Order_Date: [new Date().toISOString().split('T')[0], Validators.required],
    Description: [''],
  });

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

  onCreate() {
    this.loading.set(true);
    this.createMessage = 'Creating...';
    this.navService.createPO(this.createForm.value).subscribe({
      next: () => {
        this.createMessage = 'Successfully created!';
        this.createError = false;
        this.createForm.reset({ Order_Date: new Date().toISOString().split('T')[0] });
        this.load();
      },
      error: (e) => {
        this.createMessage = e.error?.message || e.message;
        this.createError = true;
        this.loading.set(false);
      }
    });
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
