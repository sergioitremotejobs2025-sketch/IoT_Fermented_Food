import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { BehaviorSubject, Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

import { environment } from 'src/environments/environment'

import { Light } from '@models/light.model'
import { Microcontroller } from '@models/microcontroller.model'

import { Measure } from '@alias/measure.type'
import { MeasureStats } from '@alias/measure-stats.type'
import { Pictures } from '@models/pictures.model'
import { ApiResponse } from '@models/api-response.model'

@Injectable({
  providedIn: 'root'

})
export class ArduinoService {

  private microcontrollersSubject = new BehaviorSubject<Microcontroller[]>([])
  allArduinos = this.microcontrollersSubject.asObservable()
  microcontrollers: Microcontroller[] = []

  constructor(
    private http: HttpClient
  ) { }

  getMicrocontrollers(): Observable<Microcontroller[]> {
    if (this.microcontrollers.length) {
      return of(this.microcontrollers)
    } else {
      return this.http.get<Microcontroller[]>(`${environment.ORCHESTRATOR_MS}/microcontrollers`)
        .pipe(
          tap(response => {
            this.microcontrollers = response
            this.microcontrollers.forEach(micro => micro.isInactive = false)
            this.microcontrollersSubject.next(this.microcontrollers)
          })
        )
    }
  }

  async getMicrocontroller(ip: string, measure: string): Promise<Microcontroller> {
    const findMicrocontroller = (microcontrollers: Microcontroller[]): Microcontroller => {
      return microcontrollers.filter(micro => micro.ip === ip && micro.measure === measure)[0]
    }

    if (this.microcontrollers.length) {
      return of(findMicrocontroller(this.microcontrollers)).toPromise()
    } else {
      return findMicrocontroller(await this.getMicrocontrollers().toPromise())
    }
  }

  postMicrocontroller(microcontroller: Microcontroller): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.ORCHESTRATOR_MS}/microcontrollers`, microcontroller)
      .pipe(tap(() => this.clearMicrocontrollers()))
  }

  deleteMicrocontroller(microcontroller: Microcontroller): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${environment.ORCHESTRATOR_MS}/microcontrollers`, {
      params: {
        ip: microcontroller.ip,
        measure: microcontroller.measure
      }
    }
    )
      .pipe(tap(() => this.clearMicrocontrollers()))
  }

  putMicrocontroller(updatedMicrocontroller: Partial<Microcontroller>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${environment.ORCHESTRATOR_MS}/microcontrollers`, updatedMicrocontroller)
      .pipe(tap(() => this.clearMicrocontrollers()))
  }

  private getCurrentMeasures(measure: string): Observable<Measure[]> {
    return this.http.get<Measure[]>(`${environment.ORCHESTRATOR_MS}/${measure}`)
  }

  clearMicrocontrollers() {
    this.microcontrollers = []
  }

  async getCurrentMeasure(ip: string, measure: string): Promise<Measure> {
    return new Promise<Measure>(resolve => {
      this.getCurrentMeasures(measure)
        .subscribe((measures: Measure[]) => {
          const filteredMeasures = measures.filter((measure: Measure) => measure && measure.ip === ip)
          resolve(filteredMeasures.length ? filteredMeasures[0] : null)
        })
    })
  }

  async postLightStatus(ip: string, status: string): Promise<Light> {
    return this.http.post<Light>(
      `${environment.ORCHESTRATOR_MS}/light`,
      { ip, status }
    )
      .toPromise()
  }

  getPreviousMeasures(
    ip: string,
    measure: string,
    group: string,
    init_date?: string,
    end_date?: string,
    limit?: number
  ): Observable<MeasureStats[]> {
    let params = new HttpParams()
        .set('path', group)
        .set('ip', ip);
        
    if (init_date) params = params.set('init_date', init_date);
    if (end_date) params = params.set('end_date', end_date);
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get<MeasureStats[]>(
      `${environment.ORCHESTRATOR_MS}/${measure}`,
      { params }
    )
  }

  getPicturesHistory(
    ip: string,
    init_date: string,
    end_date: string
  ): Observable<Pictures[]> {
    return this.http.get<Pictures[]>(
      `${environment.ORCHESTRATOR_MS}/pictures`,
      {
        params: {
          path: 'pictures/history',
          ip,
          init_date,
          end_date
        }
      }
    )
  }

}
