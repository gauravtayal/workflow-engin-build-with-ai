import axios from "axios";

const api = axios.create({
  baseURL: "/", // Vite proxy will handle forwarding to http://localhost:1337
});

export const getWorkflows = async () => {
  const response = await api.get("/workflows");
  return response.data;
};

export const getWorkflow = async (id: string) => {
  const response = await api.get(`/workflows/${id}`);
  return response.data;
};

export const createWorkflow = async (data: any) => {
  const response = await api.post("/workflows", data);
  return response.data;
};

export const updateWorkflow = async (id: string, data: any) => {
  const response = await api.put(`/workflows/${id}`, data);
  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await api.delete(`/workflows/${id}`);
  return response.data;
};

export const triggerWorkflow = async (path: string, payload: any) => {
  // path is like /t/xyz. We need to strip /t/ if the API expects just path param,
  // but the controller expects /t/:path.
  // The controller route is 'POST /t/:path': 'WorkflowController.trigger'.
  // The path stored in DB is /t/xyz.
  // So we should post to the stored path directly.
  const response = await api.post(path, payload);
  return response.data;
};
