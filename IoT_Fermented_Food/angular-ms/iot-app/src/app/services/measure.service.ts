import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface MeasureHistory {
  date: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class MeasureService {

  constructor(private http: HttpClient) { }

  getHistory(ip: string, measure: string, range: string): Observable<MeasureHistory[]> {
    const params = new HttpParams()
      .set('ip', ip)
      .set('measure', measure)
      .set('range', range);

    return this.http.get<MeasureHistory[]>(`${environment.ORCHESTRATOR_MS}/measures/history`, { params });
  }
}
