import { useState } from "react";
import { ApplicationFormModal } from "../components/applications/ApplicationFormModal";
import { ApplicationTable } from "../components/applications/ApplicationTable";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApplicationSearch } from "../hooks/useApplicationSearch";
import {
  useApplicationsQuery,
  useDeleteApplication,
} from "../hooks/useApplications";
import type { Application } from "../types/application";

export function ApplicationsTablePage() {
  const { data: applications, isLoading } = useApplicationsQuery();
  const { query, setQuery, filtered } = useApplicationSearch(applications);
  const deleteMutation = useDeleteApplication();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (application: Application) => {
    setEditing(application);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Applications</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company or role…"
            />
          </div>
          <Button onClick={openAddModal}>Add application</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        // Breaks the table out of the page's `max-w-6xl` container to span the
        // full viewport width, while the header above stays put — `100vw` plus
        // negative margins sized off the viewport (not this element's own
        // constrained parent) is what escapes the cap.
        // <div className="-mx-[calc(50vw-50%)] w-screen px-6">
        <ApplicationTable
          applications={filtered}
          onEdit={openEditModal}
          onDelete={(application) => deleteMutation.mutate(application.id)}
          emptyMessage={
            query
              ? "No applications match your search."
              : "No applications yet. Add your first one to get started."
          }
        />
        // </div>
      )}

      <ApplicationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingApplication={editing}
      />
    </div>
  );
}
