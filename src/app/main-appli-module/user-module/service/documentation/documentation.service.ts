import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {

  constructor(private readonly http: HttpClient) {}
  private apiUrlDoc: string = `${environment.apiUrlDocumentation}`

  public getMainDocumentation(): Observable<Blob> {
    return this.http.get(this.apiUrlDoc, { responseType: 'blob' });
  }

}
