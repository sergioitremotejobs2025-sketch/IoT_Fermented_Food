import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnvironmentPattern } from '@models/simulation.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  constructor(private http: HttpClient) { }

  setEnvironmentPattern(pattern: EnvironmentPattern): Observable<any> {
    return this.http.post(`${environment.ORCHESTRATOR_MS}/simulation/pattern`, { pattern });
  }
}
