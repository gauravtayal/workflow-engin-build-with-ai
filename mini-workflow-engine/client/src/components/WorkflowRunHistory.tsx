import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getWorkflow } from "../api";

export default function WorkflowRunHistory() {
  const { id } = useParams();
  const [runs, setRuns] = useState<any[]>([]);
  const [workflowName, setWorkflowName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (workflowId: string) => {
    try {
      const wf = await getWorkflow(workflowId);
      setWorkflowName(wf.name);
      // Sails blueprint for 'populate' logic might need checking.
      // Or we fetch runs via wf.runs if populated.
      // Standard Sails blueprint `GET /workflows/:id` returns populated associations if configured?
      // Our `WorkflowController.findOne` explicitly populates 'runs'.

      // Sort runs by startedAt desc
      const sorted = (wf.runs || []).sort(
        (a: any, b: any) => b.startedAt - a.startedAt,
      );
      setRuns(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h1>Runs: {workflowName}</h1>
        <Link to="/" className="btn btn-ghost">
          Back to List
        </Link>
      </div>

      <div className="grid">
        {runs.map((run) => (
          <div key={run.id} className="card" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color:
                    {
                      success: "#166534",
                      failed: "#b91c1c",
                      skipped: "#854d0e",
                      pending: "#1e40af",
                    }[run.status as string] || "black",
                }}
              >
                {run.status.toUpperCase()}
              </span>
              <span className="text-muted">
                {new Date(run.startedAt).toLocaleString()}
              </span>
            </div>

            <div style={{ fontSize: "0.875rem" }}>
              <div>
                Duration:{" "}
                {run.finishedAt
                  ? run.finishedAt - run.startedAt + "ms"
                  : "Running..."}
              </div>
            </div>

            {run.error && (
              <div
                style={{
                  marginTop: "0.5rem",
                  color: "#b91c1c",
                  background: "#fee2e2",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                  overflowX: "auto",
                }}
              >
                ERROR: {JSON.stringify(run.error)}
              </div>
            )}

            <details style={{ marginTop: "0.5rem" }}>
              <summary style={{ cursor: "pointer", color: "var(--primary)" }}>
                View Context & Logs
              </summary>
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Logs:</strong>
                <pre
                  style={{
                    background: "#f1f5f9",
                    padding: "0.5rem",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(run.logs, null, 2)}
                </pre>

                <strong style={{ display: "block", marginTop: "0.5rem" }}>
                  Final Context:
                </strong>
                <pre
                  style={{
                    background: "#f1f5f9",
                    padding: "0.5rem",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(run.context, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        ))}

        {runs.length === 0 && <div className="card">No runs recorded yet.</div>}
      </div>
    </div>
  );
}
