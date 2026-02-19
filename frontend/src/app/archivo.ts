import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Archivo {

  constructor(private http: HttpClient) {}

  descargarArchivo(id: number): Observable<Blob> {

    return this.http.get(
      `http://localhost:8000/descargar/${id}`,
      {
        responseType: 'blob'
      }
    );

  }

}


