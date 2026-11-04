import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Apache del servidor de producción bloquea PUT, PATCH y DELETE (responde 403).
 * Enviamos esas peticiones como POST con el header X-HTTP-Method-Override y el
 * backend las convierte de nuevo al método original antes de enrutarlas.
 */
export const methodOverrideInterceptor: HttpInterceptorFn = (req, next) => {
  const method = req.method.toUpperCase();

  if (method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return next(
      req.clone({
        method: 'POST',
        setHeaders: { 'X-HTTP-Method-Override': method },
      }),
    );
  }

  return next(req);
};
