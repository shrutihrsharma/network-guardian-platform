import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DecisionRequest } from '../models/decision-request.model';
import { DecisionResponse } from '../models/decision-response.model';
import { IncidentSummary } from '../models/incident-summary.model';

@Injectable({
  providedIn: 'root'
})
export class DecisionApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/decision-engines`;

  constructor(private readonly http: HttpClient) {}

  getIncidents() {
    return this.http.get<IncidentSummary[]>(`${environment.apiBaseUrl}/incidents`).pipe(
      catchError(this.handleError)
    );
  }

  getIncidentsByDevice(deviceId: string) {
    return this.http.get<IncidentSummary[]>(`${environment.apiBaseUrl}/devices/${deviceId}/incidents`).pipe(
      catchError(this.handleError)
    );
  }

  executeDecision(request: DecisionRequest) {
    return this.http.post<DecisionResponse>(`${this.baseUrl}/execute`, request).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unable to reach the decision engine at the moment.';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }

    return throwError(() => new Error(message));
  }
}
