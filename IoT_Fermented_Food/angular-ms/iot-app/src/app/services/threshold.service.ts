import { Injectable } from '@angular/core/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Threshold {
  ip: string;
  measure: 'temperature' | 'humidity';
  min: number;
  max: number;
}

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  private apiUrl = `${environment.urlOrchestrator}/thresholds`;

  constructor(private http: HttpClient) { }

  getThresholds(ip: string): Observable<Threshold[]> {
    return this.http.get<Threshold[]>(`${this.apiUrl}/${ip}`);
  }

  updateThreshold(threshold: Threshold): Observable<any> {
    return this.http.put(`${this.apiUrl}`, threshold);
  }
}
