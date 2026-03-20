import { cn } from "@/lib/utils"

export interface FieldMapping {
  systemField: string
  label: string
  required?: boolean
}

const TICKET_FIELDS: FieldMapping[] = [
  { systemField: "account_name", label: "Account Name", required: true },
  { systemField: "ticket_id", label: "Ticket ID", required: true },
  { systemField: "created_date", label: "Created Date", required: true },
  { systemField: "subject", label: "Subject", required: true },
  { systemField: "description", label: "Description" },
  { systemField: "status", label: "Status" },
  { systemField: "priority", label: "Priority" },
  { systemField: "satisfaction_score", label: "Satisfaction Score" },
  { systemField: "resolution_date", label: "Resolution Date" },
  { systemField: "assigned_to", label: "Assigned To" },
  { systemField: "category", label: "Category" },
]

const NPS_FIELDS: FieldMapping[] = [
  { systemField: "account_name", label: "Account Name", required: true },
  { systemField: "score", label: "NPS Score" },
  { systemField: "date", label: "Date", required: true },
  { systemField: "feedback", label: "Feedback" },
  { systemField: "respondent_name", label: "Respondent Name" },
  { systemField: "respondent_role", label: "Respondent Role" },
]

const USAGE_FIELDS: FieldMapping[] = [
  { systemField: "account_name", label: "Account Name", required: true },
  { systemField: "event_type", label: "Event Type", required: true },
  { systemField: "count_last_30_days", label: "Count (Last 30 Days)", required: true },
  { systemField: "count_previous_30_days", label: "Count (Previous 30 Days)", required: true },
  { systemField: "active_users", label: "Active Users" },
  { systemField: "date", label: "Date" },
]

interface ColumnMapperProps {
  type: "tickets" | "nps" | "usage"
  csvColumns: string[]
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
}

export function ColumnMapper({
  type,
  csvColumns,
  mapping,
  onChange,
}: ColumnMapperProps) {
  const fields =
    type === "tickets"
      ? TICKET_FIELDS
      : type === "nps"
      ? NPS_FIELDS
      : USAGE_FIELDS

  const handleChange = (systemField: string, csvColumn: string) => {
    onChange({ ...mapping, [systemField]: csvColumn || "" })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm font-medium text-muted-foreground">
        <span>ChurnWhisper Field</span>
        <span>Your CSV Column</span>
      </div>
      {fields.map((f) => (
        <div key={f.systemField} className="grid grid-cols-2 gap-2 items-center">
          <label className="text-sm">
            {f.label}
            {f.required && <span className="text-destructive ml-1">*</span>}
          </label>
          <select
            value={mapping[f.systemField] || ""}
            onChange={(e) => handleChange(f.systemField, e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Select column --</option>
            {csvColumns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
