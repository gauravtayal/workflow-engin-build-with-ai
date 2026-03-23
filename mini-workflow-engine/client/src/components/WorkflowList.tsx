import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkflows, deleteWorkflow, triggerWorkflow } from "../api";

interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  triggerPath: string;
  steps: any[];
}

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteWorkflow(id);
    loadWorkflows();
  };

  const copyTriggerUrl = (path: string) => {
    const url = window.location.origin.replace(/:[0-9]+/, ":1337") + path;
    navigator.clipboard.writeText(url);
    alert("Copied to clipboard: " + url);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h1>Workflows</h1>
        <Link to="/new" className="btn btn-primary">
          Create New
        </Link>
      </div>

      <div className="grid">
        {workflows.map((wf) => (
          <div key={wf.id} className="card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{wf.name}</h3>
              <span
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "999px",
                  backgroundColor: wf.enabled ? "#dcfce7" : "#f1f5f9",
                  color: wf.enabled ? "#166534" : "#64748b",
                  fontSize: "0.75rem",
                }}
              >
                {wf.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p
              style={{
                margin: "1rem 0",
                fontFamily: "monospace",
                background: "#f8fafc",
                padding: "0.5rem",
              }}
            >
              POST {wf.triggerPath}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-ghost"
                onClick={() => copyTriggerUrl(wf.triggerPath)}
              >
                Copy URL
              </button>
              <Link to={`/edit/${wf.id}`} className="btn btn-ghost">
                Edit
              </Link>
              <Link to={`/runs/${wf.id}`} className="btn btn-ghost">
                Runs
              </Link>
              <button
                onClick={() => handleDelete(wf.id)}
                className="btn btn-danger"
                style={{ marginLeft: "auto" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {workflows.length === 0 && (
          <div
            className="card"
            style={{ textAlign: "center", color: "var(--text-muted)" }}
          >
            No workflows found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
