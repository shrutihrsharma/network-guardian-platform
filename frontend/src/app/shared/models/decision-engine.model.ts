export interface DecisionEngine {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  status: 'READY' | 'COMING SOON';
  metrics?: {
    today: string;
    confidence: string;
    response: string;
  };
}
