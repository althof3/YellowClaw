import { FormEvent, useState } from "react";
import { Modal } from "../../components/common/Modal";
import { DEFAULT_SYSTEM_PROMPT } from "../../shared/constants";
import type { CreateProjectPayload } from "../../shared/types";

interface CreateAgentModalProps {
  onClose: () => void;
  onCreate: (payload: CreateProjectPayload) => Promise<void>;
}

export function CreateAgentModal({ onClose, onCreate }: CreateAgentModalProps) {
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), systemPrompt, files });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent creation failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="New Agent" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="agentName">Agent name</label>
          <input
            id="agentName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sales Qualifier"
            maxLength={80}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="agentPrompt">System prompt</label>
          <textarea
            id="agentPrompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="agentFiles">
            Context files <span className="muted small">(optional)</span>
          </label>
          <input
            id="agentFiles"
            type="file"
            multiple
            accept=".txt,.md,.json,.csv"
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
          {files.length > 0 && (
            <p className="small muted">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {error && <div className="notice">{error}</div>}

        <div className="modal-actions">
          <button className="secondary-btn" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="primary-btn" type="submit" disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? "Creating" : "Create agent"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
