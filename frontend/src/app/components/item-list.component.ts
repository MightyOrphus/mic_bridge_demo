import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Create Item Block -->
      <div class="bg-white shadow rounded-lg border-l-4 border-green-500 overflow-hidden">
        <div class="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">Create New Item</h3>
          <button (click)="showCreate = !showCreate" class="text-xs text-blue-600 font-bold uppercase tracking-wider">
            {{ showCreate ? 'Hide Form' : 'Show Form' }}
          </button>
        </div>
        <div *ngIf="showCreate" class="p-6">
          <form [formGroup]="createForm" (ngSubmit)="onCreate()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Item No.</label>
              <input formControlName="No" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <input formControlName="Description" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Base Unit</label>
              <input formControlName="Base_Unit_of_Measure" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Price</label>
              <input type="number" formControlName="Unit_Price" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-3 flex items-end">
              <button type="submit" [disabled]="createForm.invalid || loading()" class="bg-green-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-green-700 transition-colors w-full">
                Create Item
              </button>
            </div>
          </form>
          <p *ngIf="createMessage" class="mt-4 text-sm font-medium" [class.text-green-600]="!createError" [class.text-red-600]="createError">
            {{ createMessage }}
          </p>
        </div>
      </div>

      <!-- Item List Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800">System Items</h3>
          <button (click)="load()" [disabled]="loading()" class="text-sm font-semibold text-blue-600 hover:text-blue-800">
            {{ loading() ? 'Loading...' : 'Refresh List' }}
          </button>
        </div>
        <div *ngIf="error()" class="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
          {{ error() }}
        </div>
        <div class="overflow-x-auto max-h-[500px]">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">No.</th>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">Description</th>
                <th class="px-6 py-3 text-left font-bold text-slate-500 uppercase">Base Unit</th>
                <th class="px-6 py-3 text-right font-bold text-slate-500 uppercase">Price</th>
              </tr>
            </thead>
            <body class="divide-y divide-slate-200 bg-white text-slate-700">
              <tr *ngFor="let item of items()"
                  (click)="selectItem(item)"
                  [class.bg-blue-50]="selectedItem()?.No === item.No"
                  class="hover:bg-slate-50 cursor-pointer transition-colors">
                <td class="px-6 py-4 font-bold text-slate-900">{{ item.No }}</td>
                <td class="px-6 py-4">{{ item.Description }}</td>
                <td class="px-6 py-4">{{ item.Base_Unit_of_Measure }}</td>
                <td class="px-6 py-4 text-right font-medium">{{ item.Unit_Price | number:'1.2-2' }}</td>
              </tr>
            </body>
          </table>
        </div>
      </div>

      <!-- Edit Item Block (Conditional) -->
      <div *ngIf="selectedItem()" class="bg-white shadow rounded-lg border-l-4 border-blue-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div class="px-6 py-4 border-b bg-slate-50">
          <h3 class="font-bold text-slate-800">Edit Item: <span class="text-blue-600">{{ selectedItem()?.No }}</span></h3>
        </div>
        <div class="p-6">
          <form [formGroup]="editForm" (ngSubmit)="onUpdate()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <input formControlName="Description" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Price</label>
              <input type="number" formControlName="Unit_Price" class="w-full rounded border-slate-200 p-2 text-sm focus:ring-blue-500" />
            </div>
            <div class="md:col-span-1 flex items-end gap-2">
              <button type="submit" [disabled]="editForm.invalid || loading()" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700 transition-colors">
                Save
              </button>
              <button type="button" (click)="selectedItem.set(null)" class="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded font-bold text-sm hover:bg-slate-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
          <p *ngIf="editMessage" class="mt-4 text-sm font-medium" [class.text-blue-600]="!editError" [class.text-red-600]="editError">
            {{ editMessage }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ItemListComponent implements OnInit {
  private navService = inject(NavService);
  private fb = inject(FormBuilder);

  items = signal<any[]>([]);
  selectedItem = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showCreate = false;

  createMessage = '';
  createError = false;
  editMessage = '';
  editError = false;

  createForm = this.fb.group({
    No: ['', Validators.required],
    Description: ['', Validators.required],
    Base_Unit_of_Measure: ['กล่อง'],
    Unit_Price: [0],
  });

  editForm = this.fb.group({
    Key: ['', Validators.required],
    No: ['', Validators.required],
    Description: ['', Validators.required],
    Unit_Price: [0],
  });

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
        this.error.set(err.error?.message || err.message);
        this.loading.set(false);
      }
    });
  }

  selectItem(item: any) {
    this.selectedItem.set(item);
    this.editForm.patchValue(item);
    this.editMessage = '';
  }

  onCreate() {
    this.loading.set(true);
    this.createMessage = 'Creating...';
    this.navService.createItem(this.createForm.value).subscribe({
      next: () => {
        this.createMessage = 'Successfully created!';
        this.createError = false;
        this.createForm.reset({ Base_Unit_of_Measure: 'กล่อง', Unit_Price: 0 });
        this.load();
      },
      error: (e) => {
        this.createMessage = e.error?.message || e.message;
        this.createError = true;
        this.loading.set(false);
      }
    });
  }

  onUpdate() {
    this.loading.set(true);
    this.editMessage = 'Updating...';
    this.navService.updateItem(this.editForm.value).subscribe({
      next: () => {
        this.editMessage = 'Successfully updated!';
        this.editError = false;
        this.load();
      },
      error: (e) => {
        this.editMessage = e.error?.message || e.message;
        this.editError = true;
        this.loading.set(false);
      }
    });
  }
}
