import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h3 class="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Create New Item</h3>
      <form [formGroup]="itemForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Item No.</label>
          <input formControlName="No" class="mt-1 block w-full rounded border-gray-300 p-2 border sm:text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <input formControlName="Description" class="mt-1 block w-full rounded border-gray-300 p-2 border sm:text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Base Unit</label>
          <input formControlName="Base_Unit_of_Measure" class="mt-1 block w-full rounded border-gray-300 p-2 border sm:text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" formControlName="Unit_Price" class="mt-1 block w-full rounded border-gray-300 p-2 border sm:text-sm" />
        </div>
        <div class="md:col-span-2">
          <button type="submit" [disabled]="itemForm.invalid" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
            Create Item
          </button>
        </div>
      </form>
      <p *ngIf="message" class="mt-4 text-sm text-blue-600">{{ message }}</p>
    </div>
  `,
})
export class CreateItemComponent {
  private fb = inject(FormBuilder);
  private navService = inject(NavService);
  message = '';

  itemForm = this.fb.group({
    No: ['', Validators.required],
    Description: ['', Validators.required],
    Base_Unit_of_Measure: ['กล่อง'],
    Unit_Price: [0],
  });

  onSubmit() {
    this.navService.createItem(this.itemForm.value).subscribe({
      next: () => { this.message = 'Created!'; this.itemForm.reset(); },
      error: (e) => this.message = 'Error: ' + e.message
    });
  }
}
