import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Archivo {

  constructor(private http: HttpClient) {}

  descargarArchivo(id: number): Observable<Blob> {

    return this.http.get(
      `${environment.apiUrl}/descargar/${id}`,
      {
        responseType: 'blob'
      }
    );

  }

  visualizarArchivo(id: number): Observable<Blob> {

    return this.http.get(
      `${environment.apiUrl}/visualizar/${id}`,
      {
        responseType: 'blob'
      }
    );

  }
}
