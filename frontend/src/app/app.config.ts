import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    { provide: ErrorHandler, useClass: ErrorHandler } // Standard error handler
  ]
};
