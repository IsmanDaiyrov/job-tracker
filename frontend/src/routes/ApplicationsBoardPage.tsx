import { useState } from "react";
import { ApplicationFormModal } from "../components/applications/ApplicationFormModal";
import { KanbanBoard } from "../components/applications/KanbanBoard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApplicationSearch } from "../hooks/useApplicationSearch";
import {
  useApplicationsQuery,
  useUpdateApplication,
} from "../hooks/useApplications";
import type { Application, ApplicationStatus } from "../types/application";

export function ApplicationsBoardPage() {
  const { data: applications, isLoading } = useApplicationsQuery();
  const { query, setQuery, interviewedOnly, setInterviewedOnly, filtered } =
    useApplicationSearch(applications);
  const updateMutation = useUpdateApplication();
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

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    updateMutation.mutate({ id, payload: { status } });
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
          <Button
            variant={interviewedOnly ? "primary" : "ghost"}
            onClick={() => setInterviewedOnly(!interviewedOnly)}
          >
            Interviewed
          </Button>
          <Button onClick={openAddModal}>Add application</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <div className="-mx-[calc(50vw-50%)] w-screen px-6">
          <KanbanBoard
            applications={filtered}
            onStatusChange={handleStatusChange}
            onCardClick={openEditModal}
          />
        </div>
      )}

      <ApplicationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingApplication={editing}
      />
    </div>
  );
}
