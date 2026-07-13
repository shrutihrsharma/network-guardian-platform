import { Injectable, signal } from '@angular/core';
import { DeviceInventoryItem } from '../../../core/models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceContextStore {
  readonly device = signal<DeviceInventoryItem | null>(null);

  setDevice(device: DeviceInventoryItem | null): void {
    this.device.set(device);
  }
}
