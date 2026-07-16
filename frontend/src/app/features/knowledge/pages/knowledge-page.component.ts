import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { KnowledgeApiService, KnowledgeDocument } from '../../../core/services/knowledge-api.service';

@Component({
  selector: 'app-knowledge-page',
  standalone: true,
  imports: [PageHeaderComponent, FormsModule],
  template: `
    <section class="knowledge-page">
      <app-page-header
        title="Knowledge Base"
        description="Upload documents to enrich AI incident decisions with unstructured knowledge — runbooks, post-mortems, vendor advisories."
      />

      <div class="upload-card">
        <h3>Upload Document</h3>
        <div class="upload-form">
          <label class="file-label">
            <input type="file" accept=".txt,.md" (change)="onFileSelected($event)" hidden />
            <span class="file-btn">{{ selectedFile ? selectedFile.name : 'Choose file (.txt, .md)' }}</span>
          </label>

          <select [(ngModel)]="sourceType" class="type-select">
            <option value="runbook">Runbook</option>
            <option value="postmortem">Post-Mortem</option>
            <option value="advisory">Vendor Advisory</option>
            <option value="wiki">Wiki / KB Article</option>
          </select>

          <button class="upload-btn" (click)="upload()" [disabled]="!selectedFile || isUploading()">
            {{ isUploading() ? 'Uploading...' : 'Upload & Ingest' }}
          </button>
        </div>

        @if (uploadResult()) {
          <div class="upload-result">
            ✓ Ingested <strong>{{ uploadResult()!.chunksStored }}</strong> chunks from
            <strong>{{ uploadResult()!.sourceFile }}</strong>
          </div>
        }

        @if (uploadError()) {
          <div class="upload-error">{{ uploadError() }}</div>
        }
      </div>

      <div class="docs-card">
        <h3>Ingested Documents</h3>
        @if (documents().length === 0) {
          <p class="empty">No documents ingested yet.</p>
        } @else {
          <div class="docs-table">
            <div class="docs-table__row docs-table__row--head">
              <span>File</span>
              <span>Type</span>
              <span>Chunks</span>
              <span>Ingested At</span>
              <span>Action</span>
            </div>
            @for (doc of documents(); track doc.sourceFile) {
              <div class="docs-table__row">
                <span>{{ doc.sourceFile }}</span>
                <span class="type-badge">{{ doc.sourceType }}</span>
                <span>{{ doc.chunks }}</span>
                <span>{{ doc.ingestedAt.replace('T', ' ').slice(0, 19) }}</span>
                <button class="delete-btn" (click)="delete(doc.sourceFile)">Delete</button>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .knowledge-page { display: flex; flex-direction: column; gap: 1.2rem; }

    .upload-card, .docs-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1.25rem;
    }

    h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: var(--app-text); }

    .upload-form {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .file-btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      border: 1px solid var(--app-border);
      border-radius: 0.6rem;
      background: var(--app-surface-strong);
      color: var(--app-text);
      cursor: pointer;
      font-size: 0.88rem;
      white-space: nowrap;
      overflow: hidden;
      max-width: 220px;
      text-overflow: ellipsis;
    }

    .type-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 0.6rem;
      background: var(--app-surface-strong);
      color: var(--app-text);
      font-size: 0.88rem;
    }

    .upload-btn {
      padding: 0.5rem 1.25rem;
      border: 0;
      border-radius: 999px;
      background: var(--app-primary);
      color: white;
      font-size: 0.88rem;
      cursor: pointer;
    }

    .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .upload-result {
      margin-top: 0.75rem;
      padding: 0.6rem 1rem;
      border-radius: 0.6rem;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.25);
      color: #86efac;
      font-size: 0.88rem;
    }

    .upload-error {
      margin-top: 0.75rem;
      padding: 0.6rem 1rem;
      border-radius: 0.6rem;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      color: #fca5a5;
      font-size: 0.88rem;
    }

    .empty { color: var(--app-text-muted); font-size: 0.9rem; margin: 0; }

    .docs-table { display: flex; flex-direction: column; gap: 0.5rem; }

    .docs-table__row {
      display: grid;
      grid-template-columns: 2fr 1fr 0.6fr 1.4fr 0.6fr;
      gap: 0.75rem;
      align-items: center;
      padding: 0.7rem 0.8rem;
      border: 1px solid var(--app-border);
      border-radius: 0.7rem;
      color: var(--app-text);
      font-size: 0.88rem;
    }

    .docs-table__row--head {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--app-text-muted);
      border: 0;
      background: transparent;
    }

    .type-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: var(--app-primary-soft);
      color: var(--app-primary);
      font-size: 0.75rem;
      font-weight: 600;
      width: fit-content;
    }

    .delete-btn {
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 999px;
      padding: 0.3rem 0.7rem;
      background: transparent;
      color: #fca5a5;
      font-size: 0.78rem;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KnowledgePageComponent implements OnInit {
  readonly documents = signal<KnowledgeDocument[]>([]);
  readonly isUploading = signal(false);
  readonly uploadResult = signal<{ sourceFile: string; chunksStored: number } | null>(null);
  readonly uploadError = signal<string | null>(null);

  selectedFile: File | null = null;
  sourceType = 'runbook';

  constructor(private readonly api: KnowledgeApiService) {}

  ngOnInit() { this.loadDocuments(); }

  loadDocuments() {
    this.api.list().subscribe({ next: (docs) => this.documents.set(docs) });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.uploadResult.set(null);
    this.uploadError.set(null);
  }

  upload() {
    if (!this.selectedFile) return;
    this.isUploading.set(true);
    this.uploadResult.set(null);
    this.uploadError.set(null);

    this.api.ingest(this.selectedFile, this.sourceType).subscribe({
      next: (res) => {
        this.uploadResult.set(res);
        this.isUploading.set(false);
        this.selectedFile = null;
        this.loadDocuments();
      },
      error: () => {
        this.uploadError.set('Upload failed. Make sure the backend is running.');
        this.isUploading.set(false);
      }
    });
  }

  delete(sourceFile: string) {
    this.api.delete(sourceFile).subscribe({ next: () => this.loadDocuments() });
  }
}
