import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@models/api-response.model';

export interface PerformanceResult {
    mae: number;
    sample_count: number;
}

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = environment.ORCHESTRATOR_MS;

    constructor(private http: HttpClient) { }

    trainModel(ip: string, measure: string, limit?: number): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/ai/train`, { ip, measure, limit });
    }

    predict(ip: string, measure: string, recentValues: number[]): Observable<{ prediction: number }> {
        return this.http.post<{ prediction: number }>(`${this.apiUrl}/ai/predict`, {
            ip,
            measure,
            recent_values: recentValues
        });
    }

    evaluate(ip: string, measure: string): Observable<{ mae: number, sample_count: number }> {
        return this.http.post<{ mae: number, sample_count: number }>(`${this.apiUrl}/ai/evaluate`, { ip, measure });
    }
}
