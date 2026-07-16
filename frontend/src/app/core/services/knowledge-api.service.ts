import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface KnowledgeDocument {
  sourceFile: string;
  sourceType: string;
  chunks: number;
  ingestedAt: string;
}

export interface IngestResponse {
  sourceFile: string;
  sourceType: string;
  chunksStored: number;
}

@Injectable({ providedIn: 'root' })
export class KnowledgeApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/knowledge`;

  constructor(private readonly http: HttpClient) {}

  list() {
    return this.http.get<KnowledgeDocument[]>(this.baseUrl);
  }

  ingest(file: File, sourceType: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('sourceType', sourceType);
    return this.http.post<IngestResponse>(`${this.baseUrl}/ingest`, form);
  }

  delete(sourceFile: string) {
    return this.http.delete(`${this.baseUrl}/${encodeURIComponent(sourceFile)}`);
  }
}
