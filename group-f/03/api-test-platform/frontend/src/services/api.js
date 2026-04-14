import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects API
export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Interfaces API
export const interfaceApi = {
  getAll: (projectId) => api.get('/interfaces', { params: { project_id: projectId } }),
  getById: (id) => api.get(`/interfaces/${id}`),
  create: (data) => api.post('/interfaces', data),
  update: (id, data) => api.put(`/interfaces/${id}`, data),
  delete: (id) => api.delete(`/interfaces/${id}`),
};

// TestCases API
export const testCaseApi = {
  getAll: (interfaceId) => api.get('/testcases', { params: { interface_id: interfaceId } }),
  getById: (id) => api.get(`/testcases/${id}`),
  create: (data) => api.post('/testcases', data),
  update: (id, data) => api.put(`/testcases/${id}`, data),
  delete: (id) => api.delete(`/testcases/${id}`),
};

// Export API
export const exportApi = {
  generateCode: (testcaseId, codeType) => api.post('/export/generate-code', {
    testcase_id: testcaseId,
    code_type: codeType,
  }),
  exportPytest: (interfaceId) => api.post(`/export/pytest/${interfaceId}`),
  exportScript: (testcaseId) => api.post(`/export/script/${testcaseId}`),
  exportExcel: (params) => api.post('/export/excel', params),
  download: (filename) => `${API_BASE_URL}/export/download/${filename}`,
};

export default api;
