import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type Application,
} from "../../types/application";
import { Button } from "../ui/Button";
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
    formState: { errors, isSubmitting },
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
      });
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Input id="applied_at" type="date" {...register("applied_at")} />
        </div>
      </div>

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
