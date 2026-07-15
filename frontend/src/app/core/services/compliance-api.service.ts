import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApproveKriRequest,
  ComplianceDashboardResponse,
  ComplianceDecisionRequest,
  ComplianceKri,
  ComplianceKriGenerationResponse,
  ComplianceRecalculationResponse,
  ComplianceSummaryResponse,
  DecisionAuditRow,
  DeviceComplianceResponse,
} from '../models/compliance.model';
import { DecisionResponse } from '../models/decision-response.model';

@Injectable({ providedIn: 'root' })
export class ComplianceApiService {
  private readonly base = `${environment.apiBaseUrl}/compliance`;

  constructor(private readonly http: HttpClient) {}

  getDashboard() {
    return this.http
      .get<ComplianceDashboardResponse>(`${this.base}/dashboard`)
      .pipe(catchError(this.handleError));
  }

  getSummary() {
    return this.http
      .get<ComplianceSummaryResponse>(`${this.base}/summary`)
      .pipe(catchError(this.handleError));
  }

  getKris() {
    return this.http
      .get<ComplianceKri[]>(`${this.base}/kri`)
      .pipe(catchError(this.handleError));
  }

  getDeviceCompliance(deviceId: string) {
    return this.http
      .get<DeviceComplianceResponse>(`${this.base}/device/${deviceId}`)
      .pipe(catchError(this.handleError));
  }

  recalculate() {
    return this.http
      .post<ComplianceRecalculationResponse>(`${this.base}/recalculate`, {})
      .pipe(catchError(this.handleError));
  }

  analyzeCompliance(request: ComplianceDecisionRequest) {
    return this.http
      .post<DecisionResponse>(`${this.base}/decision`, request)
      .pipe(catchError(this.handleError));
  }

  generateKri(request: ComplianceDecisionRequest) {
    return this.http
      .post<ComplianceKriGenerationResponse>(`${this.base}/generate-kri`, request)
      .pipe(catchError(this.handleError));
  }

  approveKri(request: ApproveKriRequest) {
    return this.http
      .post<ComplianceKri>(`${this.base}/approve-kri`, request)
      .pipe(catchError(this.handleError));
  }

  getDecisionHistory() {
    return this.http
      .get<DecisionAuditRow[]>(`${environment.apiBaseUrl}/decision-engines/history`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unable to load compliance data.';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status === 404) {
      message = 'Compliance data not found.';
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }

    return throwError(() => new Error(message));
  }
}
