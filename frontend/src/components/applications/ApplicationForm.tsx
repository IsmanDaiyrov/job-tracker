import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type Application,
} from "../../types/application";
import { Button } from "../ui/Button";
import { DatePicker } from "../ui/DatePicker";
import { FieldError, Input, Label, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";

const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role_title: z.string().min(1, "Role is required"),
  job_url: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  job_description: z.string().optional(),
  status: z.enum(APPLICATION_STATUSES),
  applied_at: z.string().optional(),
  notes: z.string().optional(),
  ever_interviewed: z.boolean().optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

const emptyDefaults: ApplicationFormValues = {
  company: "",
  role_title: "",
  job_url: "",
  job_description: "",
  status: "applied",
  applied_at: "",
  notes: "",
  ever_interviewed: false,
};

export function ApplicationForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: {
  initialValues?: Application;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        company: initialValues.company,
        role_title: initialValues.role_title,
        job_url: initialValues.job_url ?? "",
        job_description: initialValues.job_description ?? "",
        status: initialValues.status,
        applied_at: initialValues.applied_at ?? "",
        notes: initialValues.notes ?? "",
        ever_interviewed: initialValues.ever_interviewed,
      });
    }
  }, [initialValues, reset]);

  // ever_interviewed is only sent when the checkbox was actually touched — leaving it untouched
  // omits the field entirely so the backend's normal auto-detection runs unimpeded, rather than
  // this form's stale loaded value silently overriding it on every save.
  const submit = handleSubmit((values) =>
    onSubmit({
      ...values,
      ever_interviewed: dirtyFields.ever_interviewed ? values.ever_interviewed : undefined,
    }),
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="e.g. Google"
            {...register("company")}
          />
          <FieldError>{errors.company?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="role_title">Role</Label>
          <Input
            id="role_title"
            placeholder="e.g. Software Engineer"
            {...register("role_title")}
          />
          <FieldError>{errors.role_title?.message}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="job_url">Job link</Label>
        <Input id="job_url" placeholder="https://…" {...register("job_url")} />
        <FieldError>{errors.job_url?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="job_description">Job description</Label>
        <Textarea
          id="job_description"
          placeholder="Describe the job role and responsibilities..."
          rows={3}
          {...register("job_description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="applied_at">Date applied</Label>
          <Controller
            name="applied_at"
            control={control}
            render={({ field }) => (
              <DatePicker id="applied_at" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {initialValues && (
        <div className="flex items-start gap-2 rounded-[10px] border border-ink/10 p-3">
          <input
            id="ever_interviewed"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-ink/30"
            {...register("ever_interviewed")}
          />
          <label htmlFor="ever_interviewed" className="text-sm">
            <span className="font-medium text-ink">Reached interview stage</span>
            <p className="text-xs text-ink/50">
              Normally set automatically when status moves to Screening, Interview, or Offer, and
              stays checked even if later marked Rejected. Uncheck only to correct a mistake.
            </p>
          </label>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this application..."
          rows={2}
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
