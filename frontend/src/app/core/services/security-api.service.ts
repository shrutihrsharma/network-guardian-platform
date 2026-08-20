import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DecisionResponse } from '../models/decision-response.model';
import { JiraTicketResponse, RemediationPlan, RemediationStatusResponse, RemediationVerificationResponse, SecurityFinding } from '../models/security-finding.model';

@Injectable({ providedIn: 'root' })
export class SecurityApiService {
  private readonly base = `${environment.apiBaseUrl}/security/findings`;

  constructor(private readonly http: HttpClient) {}

  getFindings(filters?: {
    vendor?: string;
    region?: string;
    category?: string;
    severity?: string;
    businessService?: string;
  }) {
    let params = new HttpParams();

    if (filters) {
      if (filters.vendor) params = params.set('vendor', filters.vendor);
      if (filters.region) params = params.set('region', filters.region);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.severity) params = params.set('severity', filters.severity);
      if (filters.businessService) params = params.set('businessService', filters.businessService);
    }

    return this.http
      .get<SecurityFinding[]>(this.base, { params })
      .pipe(catchError(this.handleError));
  }

  getFindingById(id: string) {
    return this.http
      .get<SecurityFinding>(`${this.base}/${id}`)
      .pipe(catchError(this.handleError));
  }

  analyzeFinding(id: string) {
    return this.http
      .post<DecisionResponse>(`${this.base}/${id}/analyze`, {})
      .pipe(catchError(this.handleError));
  }

  generateRemediationPlan(id: string) {
    return this.http
      .post<RemediationPlan>(`${this.base}/${id}/remediation-plan`, {})
      .pipe(catchError(this.handleError));
  }

  createJiraTicket(id: string) {
    return this.http
      .post<JiraTicketResponse>(`${this.base}/${id}/remediation-plan/jira`, {})
      .pipe(catchError(this.handleError));
  }

  getRemediationStatus(id: string) {
    return this.http
      .get<RemediationStatusResponse>(`${this.base}/${id}/remediation-status`)
      .pipe(catchError(this.handleError));
  }

  verifyRemediation(id: string) {
    return this.http
      .post<RemediationVerificationResponse>(`${this.base}/${id}/remediation-status/verify`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unable to load security findings.';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status === 404) {
      message = 'Security finding not found.';
    } else if (typeof error.error?.message === 'string' && error.error.message.trim()) {
      message = error.error.message;
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }

    return throwError(() => new Error(message));
  }
}
