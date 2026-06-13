import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NavService } from '../services/nav.service';

@Component({
  selector: 'app-update-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h3 class="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Update Item</h3>
      <div class="mb-6 flex gap-2">
        <input #searchNo placeholder="Item No." class="flex-1 rounded border-gray-300 p-2 border sm:text-sm" />
        <button (click)="find(searchNo.value)" class="bg-slate-700 text-white px-4 py-2 rounded">Find</button>
      </div>
      <form *ngIf="found()" [formGroup]="itemForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <input formControlName="Description" class="mt-1 block w-full rounded border-gray-300 p-2 border sm:text-sm" />
        </div>
        <div class="md:col-span-2">
          <button type="submit" [disabled]="itemForm.invalid" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Update Item
          </button>
        </div>
      </form>
      <p *ngIf="message" class="mt-4 text-sm text-blue-600">{{ message }}</p>
    </div>
  `,
})
export class UpdateItemComponent {
  private fb = inject(FormBuilder);
  private navService = inject(NavService);
  found = signal(false);
  message = '';

  itemForm = this.fb.group({
    Key: ['', Validators.required],
    No: ['', Validators.required],
    Description: ['', Validators.required],
  });

  find(no: string) {
    this.navService.getItems(100).subscribe(res => {
      const item = (res?.Item || []).find((i: any) => i.No === no);
      if (item) {
        this.itemForm.patchValue(item);
        this.found.set(true);
      } else {
        this.message = 'Not found';
      }
    });
  }

  onSubmit() {
    this.navService.updateItem(this.itemForm.value).subscribe({
      next: () => this.message = 'Updated!',
      error: (e) => this.message = 'Error: ' + e.message
    });
  }
}
