import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly apiUrl = 'https://localhost:8085/api';

  constructor(private http: HttpClient) { }

  iniciarSesion(usuario: string, clave: string): Observable<any> {
    const params = new HttpParams()
      .set('usuario', usuario)
      .set('clave', clave);
    
    return this.http.get(`${this.apiUrl}/AuthReport/IniciarSesion`, { params });
  }

  filtrarDocumentos(fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
  
    return this.http.get(`${this.apiUrl}/BillingPayment/filtrarDocumentos`, { params });
  }

  crearDocumento(idEmpresa: string, idCarpeta: string): Observable<any> {
    const body = {
      idEmpresa,
      idCarpeta
    };
  
    return this.http.post(`${this.apiUrl}/BillingPayment/crearDocumento`, body);
  }

  listarArchivosCarpeta(Carpeta: string): Observable<any> {
    const params = new HttpParams()
      .set('Carpeta', Carpeta);
  
    return this.http.get(`${this.apiUrl}/BillingPayment/listarArchivosCarpeta`, { params });
  }

  subirArchivoCarpeta(Carpeta: string, nombreArchivo:string, tipoArchivo:string): Observable<any> {
    const params = new HttpParams()
      .set('Carpeta', Carpeta)
      .set('nombreArchivo', nombreArchivo)
      .set('tipoArchivo', tipoArchivo);
  
    return this.http.get(`${this.apiUrl}/BillingPayment/subirArchivoCarpeta`, { params });
  }
  
}
