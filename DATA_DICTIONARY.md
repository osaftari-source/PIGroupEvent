# Data Dictionary — Checklist_Master

| Column | Purpose |
|---|---|
| Task ID | Stable unique identifier. Do not reuse. |
| Event ID | Links the task to `Event_Master`. |
| Venue | Operational location. |
| Workstream | Reporting category used by filters and PWA. |
| Checklist Item | Specific preparation deliverable. |
| Acceptance Criteria | Evidence required before the item can be considered ready. |
| Scope Owner | PIM, EO, PI Group, Shared, or TBC. |
| Bidang | Committee field responsible for follow-up. |
| PIC | Person accountable for completing the item. |
| Priority | Critical, High, Medium, or Low. |
| Planned Start | Intended start date. |
| Deadline | Required completion date. |
| Status | Operational status dropdown. |
| Progress % | 0–100; separate from verification. |
| Readiness | Formula result based on status, priority and deadline. |
| Blocker | Current impediment. |
| Next Action | Immediate next action. |
| Updated By | Person who entered the latest update. This can differ from PIC. |
| Update Source | PIC update, admin update, coordination meeting, EO or PI Group. |
| Last Updated | Timestamp used by the dashboard/PWA. |
| Evidence Link | Optional Google Drive evidence. |
| Verification | Verification state. |
| Verified By | Person accepting the completed item. |
| Notes | Additional context. |
| Publish to PWA | Only `Ya` rows are returned by the public endpoint. |
| Scenario | `Semua` or applicable scenario A–D. |
| Days to Deadline | Formula. |
| Overdue Flag | Formula. |
| Weight | Formula based on priority. |
| Weighted Progress | Formula used by dashboard aggregation. |
