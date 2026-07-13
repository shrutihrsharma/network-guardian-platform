import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeviceInventoryItem } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/devices`;

  constructor(private readonly http: HttpClient) {}

  getDevices() {
    return this.http.get<DeviceInventoryItem[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  getDevice(deviceId: string) {
    return this.http.get<DeviceInventoryItem>(`${this.baseUrl}/${deviceId}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Unable to load device inventory.';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.status === 404) {
      message = 'Device not found.';
    } else if (error.status) {
      message = `Request failed with status ${error.status}`;
    }

    return throwError(() => new Error(message));
  }
}
