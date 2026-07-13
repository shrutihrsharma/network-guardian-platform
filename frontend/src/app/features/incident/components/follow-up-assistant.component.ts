import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-follow-up-assistant',
  standalone: true,
  template: `
    <section class="assistant-card">
      <div class="assistant-card__header">
        <h3>Need more help?</h3>
        <p>Ask follow-up troubleshooting questions to keep the incident moving.</p>
      </div>

      <div class="assistant-conversation">
        <div class="assistant-bubble">How can I validate the certificate chain?</div>
        <div class="assistant-bubble assistant-bubble--reply">Check the intermediate CA and compare the expiration window with the host certificate.</div>
      </div>

      <div class="assistant-input">
        <input type="text" placeholder="Ask a follow-up question" />
        <button type="button">Send</button>
      </div>
    </section>
  `,
  styles: `
    .assistant-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: 1rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .assistant-card__header h3 {
      margin: 0 0 0.25rem;
      color: #e0e7ff;
      font-size: 1.02rem;
      font-weight: 700;
    }

    .assistant-card__header p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .assistant-conversation {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .assistant-bubble {
      align-self: flex-start;
      padding: 0.65rem 0.8rem;
      border-radius: 0.9rem;
      background: rgba(255,255,255,0.06);
      color: #e0e7ff;
      font-size: 0.9rem;
      max-width: 80%;
    }

    .assistant-bubble--reply {
      align-self: flex-end;
      background: var(--app-primary-soft);
      color: #e0e7ff;
    }

    .assistant-input {
      display: flex;
      gap: 0.6rem;
    }

    .assistant-input input {
      flex: 1;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      padding: 0.6rem 0.8rem;
      background: transparent;
      color: #e0e7ff;
    }

    .assistant-input button {
      border: 0;
      border-radius: 999px;
      padding: 0.55rem 0.85rem;
      background: var(--app-primary);
      color: white;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowUpAssistantComponent {
  readonly incident = input<unknown>(null);
}
