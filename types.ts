
export interface MetricDetail {
  label: string;
  value: string;
  valueLabel?: string;
  subtext: string;
  status: 'Healthy' | 'Needs attention' | 'Critical';
}

export interface ConsultationMetricDetail extends MetricDetail {
  booked: number;
  converted: number;
  inProgress: number;
  lost: number;
}

export interface PracticeMetrics {
  revenue: MetricDetail;
  sessions: MetricDetail;
  consultations: ConsultationMetricDetail;
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
