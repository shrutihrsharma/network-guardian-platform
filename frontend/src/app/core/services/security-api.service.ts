import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DecisionResponse } from '../models/decision-response.model';
import { SecurityFinding } from '../models/security-finding.model';

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

  private handleError(error: HttpErrorResponse) {
    let message = 'Unable to load security findings.';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status === 404) {
      message = 'Security finding not found.';
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }

    return throwError(() => new Error(message));
  }
}
