import { useEffect, useState } from "react";
import { NoticeBox } from "../../components/common/NoticeBox";
import type { Notice, Project, SaveProjectPayload } from "../../shared/types";

interface InspectorProps {
  activeProject: Project | null;
  notice: Notice | null;
  onSaveProject: (payload: SaveProjectPayload) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
}

export function Inspector({ activeProject, notice, onSaveProject, onUploadFile }: InspectorProps) {
  const [draftName, setDraftName] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setDraftName(activeProject?.name || "");
    setDraftPrompt(activeProject?.systemPrompt || "");
    setSelectedFile(null);
  }, [activeProject]);

  return (
    <aside className="inspector">
      <div className="inspector-head">
        <h3>System Prompt</h3>
        <button
          className="secondary-btn"
          onClick={() => activeProject && onSaveProject({ id: activeProject.id, name: draftName, systemPrompt: draftPrompt })}
          type="button"
          disabled={!activeProject}
        >
          Save
        </button>
      </div>

      <section className="inspector-section">
        <div className="field">
          <label htmlFor="projectName">Agent name</label>
          <input id="projectName" value={draftName} onChange={(event) => setDraftName(event.target.value)} disabled={!activeProject} />
        </div>
        <div className="field">
          <label htmlFor="systemPrompt">Prompt</label>
          <textarea id="systemPrompt" value={draftPrompt} onChange={(event) => setDraftPrompt(event.target.value)} disabled={!activeProject} />
        </div>
        <NoticeBox notice={notice} />
      </section>

      <section className="inspector-section">
        <h3>Files</h3>
        <p className="small muted">Upload a small text file and we will attach its contents to this agent as reusable context.</p>
        <div className="file-row">
          <input
            type="file"
            accept=".txt,.md,.json,.csv"
            disabled={!activeProject}
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <button
            className="secondary-btn"
            onClick={() => selectedFile && onUploadFile(selectedFile)}
            type="button"
            disabled={!activeProject || !selectedFile}
          >
            Upload file
          </button>
        </div>
      </section>
    </aside>
  );
}
