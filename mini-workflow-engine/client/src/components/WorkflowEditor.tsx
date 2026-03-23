import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createWorkflow, getWorkflow, updateWorkflow } from "../api";

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [stepsJson, setStepsJson] = useState("[]");
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    } else {
      // Default sample step
      setStepsJson(
        JSON.stringify(
          [
            {
              type: "filter",
              conditions: [{ path: "type", op: "eq", value: "test" }],
            },
            {
              type: "transform",
              ops: [
                {
                  op: "template",
                  to: "message",
                  template: "Received {{type}}",
                },
              ],
            },
          ],
          null,
          2,
        ),
      );
    }
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    try {
      const data = await getWorkflow(workflowId);
      setName(data.name);
      setEnabled(data.enabled);
      setStepsJson(JSON.stringify(data.steps, null, 2));
    } catch (err) {
      console.error(err);
      setError("Failed to load workflow");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let steps;
      try {
        steps = JSON.parse(stepsJson);
      } catch (e) {
        setError("Invalid JSON in steps");
        return;
      }

      const payload = { name, enabled, steps };

      if (id) {
        await updateWorkflow(id, payload);
      } else {
        await createWorkflow(payload);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div>
      <h1>{id ? "Edit Workflow" : "Create Workflow"}</h1>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Slack Notification"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ width: "auto", marginRight: "0.5rem" }}
            />
            Enabled
          </label>
        </div>

        <div className="form-group">
          <label>Steps (JSON)</label>
          <textarea
            value={stepsJson}
            onChange={(e) => setStepsJson(e.target.value)}
            rows={20}
            style={{ fontFamily: "monospace", width: "100%", padding: "1rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
