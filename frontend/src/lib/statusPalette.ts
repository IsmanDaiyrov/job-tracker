import type { ApplicationStatus } from '../types/application'

// Fixed application-funnel order for the dashboard charts. Never reorder — the order carries
// meaning (progression through the pipeline), same reasoning as APPLICATION_STATUSES.
export const STATUS_ORDER: ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]

// Reserved, fixed status colors for chart bar fills — one hue family per outcome, matching
// StatusBadge.tsx's existing badge colors but darkened for solid fills: a light badge chip with
// dark text needs far less contrast against the paper background than a large solid bar fill
// does. Each validated at >=3:1 WCAG contrast against --color-paper (#faf8f3), except
// `withdrawn`, which is deliberately the most muted/receding of the seven (an inactive,
// dismissed record) — its lower contrast is mitigated by the mandatory value label on every bar.
export const STATUS_CHART_COLORS: Record<ApplicationStatus, string> = {
  saved: '#8f8f83',
  applied: '#5c5c50',
  screening: '#7c8f1a',
  interview: '#57661a',
  offer: '#7c9473',
  rejected: '#d94a36',
  withdrawn: '#a8a89c',
}
