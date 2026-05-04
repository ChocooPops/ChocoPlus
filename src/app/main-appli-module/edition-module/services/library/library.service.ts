import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private readonly apiUrlLibrary: string = `${environment.apiUrlLibrary}`;

  constructor(private readonly http: HttpClient) { }
  
}
