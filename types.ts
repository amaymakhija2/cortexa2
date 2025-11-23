
export interface MetricDetail {
  label: string;
  value: string;
  subtext: string;
  status: 'Healthy' | 'Needs attention' | 'Critical';
}

export interface PracticeMetrics {
  revenue: MetricDetail;
  sessions: MetricDetail;
  clientGrowth: MetricDetail;
  attendance: MetricDetail;
  compliance: MetricDetail;
}

export interface LiveNote {
  id: string;
  text: string;
  timestamp?: string;
}

export interface TrendDataPoint {
  time: string;
  booked: number;
  completed: number;
  cancelled: number;
}
