import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TailorForm } from "../components/tailor/TailorForm";
import { TailorResults } from "../components/tailor/TailorResults";
import { useResumesQuery } from "../hooks/useResumes";
import { useTailorResume } from "../hooks/useTailor";
import { loadTailorCache, saveTailorCache } from "../lib/tailorCache";
import type { TailorResult } from "../types/tailor";

// FastAPI's HTTPException responses always carry { detail: "..." } — surface that verbatim
// (the daily-limit message, the truncation message, etc.) instead of a generic fallback that'd
// make an intentional, expected condition read as an unexplained bug.
function getTailorErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.detail === "string") {
    return error.response.data.detail;
  }
  return "Something went wrong. Please try again.";
}

// The /app/tailor page: paste a job description, pick a resume, and get back suggested bullet
// edits and a cover letter draft from Claude. Standalone rather than tied to a saved application,
// since tailoring naturally happens before you've applied (and possibly before you've logged
// anything) — see TailorResults' footnote for why nothing here is saved automatically.
export function TailorPage() {
  const { data: resumes, isLoading } = useResumesQuery();
  const [resumeId, setResumeId] = useState(
    () => loadTailorCache()?.resumeId ?? "",
  );
  const [jobDescription, setJobDescription] = useState(
    () => loadTailorCache()?.jobDescription ?? "",
  );
  // Read straight from cache on mount rather than off the mutation — useMutation has no
  // equivalent of useQuery's initialData, so there's nothing to rehydrate a mutation's own
  // .data with. Owning the result as plain state is what makes rehydration possible.
  const [result, setResult] = useState<TailorResult | null>(
    () => loadTailorCache()?.result ?? null,
  );
  const tailorMutation = useTailorResume();

  useEffect(() => {
    if (!resumeId && resumes && resumes.length > 0) {
      setResumeId(resumes.find((r) => r.is_base)?.id ?? resumes[0].id);
    }
  }, [resumes, resumeId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl">Tailor resume</h1>
        <p className="mt-1 text-sm text-ink/50">
          Paste a job description and get suggested resume edits, plus a cover
          letter draft
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : resumes && resumes.length === 0 ? (
        <p className="text-sm text-ink/50">
          You need at least one uploaded resume first. Head over to{" "}
          <Link to="/app/resumes" className="font-medium text-ink underline">
            Resumes
          </Link>{" "}
          to upload one.
        </p>
      ) : (
        <div className="max-w-2xl">
          <TailorForm
            resumes={resumes ?? []}
            resumeId={resumeId}
            onResumeIdChange={setResumeId}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            onSubmit={() =>
              tailorMutation.mutate(
                { resumeId, jobDescription },
                {
                  onSuccess: (data) => {
                    setResult(data);
                    saveTailorCache({ resumeId, jobDescription, result: data });
                  },
                },
              )
            }
            isPending={tailorMutation.isPending}
          />

          {tailorMutation.isError && (
            <p className="mt-3 text-xs text-coral">
              {getTailorErrorMessage(tailorMutation.error)}
            </p>
          )}

          {result && <TailorResults result={result} />}
        </div>
      )}
    </div>
  );
}
