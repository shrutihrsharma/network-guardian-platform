import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DeviceLifecycleSummary,
  LifecycleDashboardStats,
  SoftwareLifecycle,
} from '../models/lifecycle.model';
import { DecisionResponse } from '../models/decision-response.model';

@Injectable({ providedIn: 'root' })
export class LifecycleApiService {
  private readonly base = `${environment.apiBaseUrl}/lifecycle`;

  constructor(private readonly http: HttpClient) {}

  getAll() {
    return this.http
      .get<DeviceLifecycleSummary[]>(this.base)
      .pipe(catchError(this.handleError));
  }

  getForDevice(deviceId: string) {
    return this.http
      .get<DeviceLifecycleSummary>(`${this.base}/device/${deviceId}`)
      .pipe(catchError(this.handleError));
  }

  getVendors() {
    return this.http
      .get<string[]>(`${this.base}/vendors`)
      .pipe(catchError(this.handleError));
  }

  getTimeline() {
    return this.http
      .get<SoftwareLifecycle[]>(`${this.base}/timeline`)
      .pipe(catchError(this.handleError));
  }

  getDashboard() {
    return this.http
      .get<LifecycleDashboardStats>(`${this.base}/dashboard`)
      .pipe(catchError(this.handleError));
  }

  executeDecision(deviceId: string) {
    return this.http
      .post<DecisionResponse>(`${this.base}/decision`, { deviceId })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unable to load lifecycle data.';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status === 404) {
      message = 'Lifecycle data not found.';
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }
    return throwError(() => new Error(message));
  }
}
