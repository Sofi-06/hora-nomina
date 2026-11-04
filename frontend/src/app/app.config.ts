import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { Auth } from './services/auth';
import { methodOverrideInterceptor } from './interceptors/method-override.interceptor';

export function initAuthFactory(auth: Auth) {
  return () => auth.initAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([methodOverrideInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthFactory,
      deps: [Auth],
      multi: true
    }
  ]
};