import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { throwError,Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly apiUrl = 'https://localhost:8085/api';

  constructor(private https: HttpClient) { }

  iniciarSesion(usuario: string, clave: string): Observable<any> {
    const params = new HttpParams()
      .set('usuario', usuario)
      .set('clave', clave);
    
    return this.https.get(`${this.apiUrl}/AuthReport/IniciarSesion`, { params });
  }

  filtrarDocumentos(fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
  
    return this.https.get(`${this.apiUrl}/BillingPayment/filtrarDocumentos`, { params });
  }

  crearDocumento(idEmpresa: string, idCarpeta: string): Observable<any> {
    const body = {
      idEmpresa,
      idCarpeta
    };
  
    return this.https.post(`${this.apiUrl}/BillingPayment/crearDocumento`, body);
  }

  listarArchivosCarpeta(Carpeta: string): Observable<any> {
    const params = new HttpParams()
      .set('Carpeta', Carpeta);
  
    return this.https.get(`${this.apiUrl}/BillingPayment/listarArchivosCarpeta`, { params });
  }

  
  existeDocumento(idEmpresa: string, idCarpeta: string): Observable<any> {
    const params = new HttpParams()
      .set('idEmpresa', idEmpresa)
      .set('idCarpeta', idCarpeta);
    return this.https.post(`${this.apiUrl}/BillingPayment/existeDocumento?idEmpresa=${idEmpresa}&idCarpeta=${idCarpeta}`, null);
  }

  subirArchivoCarpeta(Carpeta: string, nombreArchivo: string, tipoArchivo: string, archivo: File | null): Observable<any> {
    if (!archivo) {
      return throwError(() => new Error('El archivo es nulo'));
    }
  
    const MAX_SIZE = 10 * 1024 * 1024;
    if (archivo.size > MAX_SIZE) {
      return throwError(() => new Error('El archivo excede el tamaño máximo permitido de 10 MB.'));
    }
  
    const extension = archivo.name.split('.').pop();
    const archivoNombreCompleto = `${nombreArchivo}.${extension}`;
  
    const params = new HttpParams()
      .set('Carpeta', Carpeta)
      .set('nombreArchivo', archivoNombreCompleto)
      .set('tipoArchivo', archivo.type);
  
    return this.https.get<{ url: string }>(`${this.apiUrl}/BillingPayment/subirArchivoCarpeta`, { params }).pipe(
      switchMap(response => {
        const uploadUrl = response.url;
        return this.https.put(uploadUrl, archivo, {
          headers: { 'Content-Type': archivo.type }
        });
      }),
      catchError(error => {
        console.error('Error al subir el archivo:', error);
        return throwError(() => error);
      })
    );
  }
  
  
}
