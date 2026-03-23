import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WorkflowList from "./components/WorkflowList";
import WorkflowEditor from "./components/WorkflowEditor";
import WorkflowRunHistory from "./components/WorkflowRunHistory";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <Link to="/" className="logotype">
            Mini Workflow Engine
          </Link>
          <nav>
            <Link to="/new" className="btn btn-primary">
              New Workflow
            </Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/new" element={<WorkflowEditor />} />
            <Route path="/edit/:id" element={<WorkflowEditor />} />
            <Route path="/runs/:id" element={<WorkflowRunHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
