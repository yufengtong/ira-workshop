import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tabs,
  Tab,
  TextareaAutosize,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { projectApi, interfaceApi, testCaseApi, exportApi } from '../services/api';

export default function TestCases() {
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedInterface, setSelectedInterface] = useState('');
  const [open, setOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeTab, setCodeTab] = useState(0);
  const [generatedCode, setGeneratedCode] = useState({ pytest: '', script: '' });
  const [currentTestCase, setCurrentTestCase] = useState(null);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [formData, setFormData] = useState({
    interface_id: '',
    name: '',
    description: '',
    request_params: '{}',
    request_body: '{}',
    expected_status: 200,
    expected_response: '{}',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadInterfaces(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedInterface) {
      loadTestCases(selectedInterface);
    }
  }, [selectedInterface]);

  const loadProjects = async () => {
    try {
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadInterfaces = async (projectId) => {
    try {
      const response = await interfaceApi.getAll(projectId);
      setInterfaces(response.data);
    } catch (error) {
      console.error('Failed to load interfaces:', error);
    }
  };

  const loadTestCases = async (interfaceId) => {
    try {
      const response = await testCaseApi.getAll(interfaceId);
      setTestCases(response.data);
    } catch (error) {
      console.error('Failed to load test cases:', error);
    }
  };

  const handleOpen = (testCase = null) => {
    if (testCase) {
      setEditingTestCase(testCase);
      setFormData({
        interface_id: testCase.interface_id,
        name: testCase.name,
        description: testCase.description || '',
        request_params: JSON.stringify(testCase.request_params || {}, null, 2),
        request_body: JSON.stringify(testCase.request_body || {}, null, 2),
        expected_status: testCase.expected_status,
        expected_response: JSON.stringify(testCase.expected_response || {}, null, 2),
      });
    } else {
      setEditingTestCase(null);
      setFormData({
        interface_id: selectedInterface || (interfaces[0]?.id || ''),
        name: '',
        description: '',
        request_params: '{}',
        request_body: '{}',
        expected_status: 200,
        expected_response: '{}',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTestCase(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        request_params: JSON.parse(formData.request_params || '{}'),
        request_body: JSON.parse(formData.request_body || '{}'),
        expected_response: JSON.parse(formData.expected_response || '{}'),
      };

      if (editingTestCase) {
        await testCaseApi.update(editingTestCase.id, data);
      } else {
        await testCaseApi.create(data);
      }
      handleClose();
      if (selectedInterface) {
        loadTestCases(selectedInterface);
      }
    } catch (error) {
      console.error('Failed to save test case:', error);
      alert('保存失败，请检查JSON格式');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个测试用例吗？')) {
      try {
        await testCaseApi.delete(id);
        if (selectedInterface) {
          loadTestCases(selectedInterface);
        }
      } catch (error) {
        console.error('Failed to delete test case:', error);
      }
    }
  };

  const handleGenerateCode = async (testCase) => {
    setCurrentTestCase(testCase);
    try {
      const [pytestRes, scriptRes] = await Promise.all([
        exportApi.generateCode(testCase.id, 'pytest'),
        exportApi.generateCode(testCase.id, 'script'),
      ]);
      setGeneratedCode({
        pytest: pytestRes.data.code,
        script: scriptRes.data.code,
      });
      setCodeOpen(true);
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = selectedInterface
        ? { interface_id: parseInt(selectedInterface) }
        : selectedProject
        ? { project_id: parseInt(selectedProject) }
        : {};

      const response = await exportApi.exportExcel(params);
      window.open(exportApi.download(response.data.filename), '_blank');
    } catch (error) {
      console.error('Failed to export excel:', error);
    }
  };

  const handleDownloadScript = async (testCase) => {
    try {
      const response = await exportApi.exportScript(testCase.id);
      window.open(exportApi.download(response.data.filename), '_blank');
    } catch (error) {
      console.error('Failed to export script:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">测试用例</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleExportExcel}>
            导出Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={!selectedInterface}
          >
            新建用例
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>选择项目</InputLabel>
          <Select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedInterface('');
              setTestCases([]);
            }}
            label="选择项目"
          >
            <MenuItem value="">全部项目</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>选择接口</InputLabel>
          <Select
            value={selectedInterface}
            onChange={(e) => setSelectedInterface(e.target.value)}
            label="选择接口"
            disabled={!selectedProject}
          >
            <MenuItem value="">全部接口</MenuItem>
            {interfaces.map((iface) => (
              <MenuItem key={iface.id} value={iface.id}>
                {iface.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用例名称</TableCell>
              <TableCell>用例描述</TableCell>
              <TableCell>期望状态码</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testCases.map((testCase) => (
              <TableRow key={testCase.id}>
                <TableCell>{testCase.name}</TableCell>
                <TableCell>{testCase.description || '-'}</TableCell>
                <TableCell>{testCase.expected_status}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(testCase)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(testCase.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleGenerateCode(testCase)}>
                    <CodeIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDownloadScript(testCase)}>
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新建/编辑对话框 */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingTestCase ? '编辑测试用例' : '新建测试用例'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>所属接口</InputLabel>
            <Select
              value={formData.interface_id}
              onChange={(e) => setFormData({ ...formData, interface_id: e.target.value })}
              label="所属接口"
            >
              {interfaces.map((iface) => (
                <MenuItem key={iface.id} value={iface.id}>
                  {iface.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="用例名称"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="用例描述"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="请求参数 (JSON格式)"
            fullWidth
            multiline
            rows={3}
            value={formData.request_params}
            onChange={(e) => setFormData({ ...formData, request_params: e.target.value })}
          />
          <TextField
            margin="dense"
            label="请求体 (JSON格式)"
            fullWidth
            multiline
            rows={4}
            value={formData.request_body}
            onChange={(e) => setFormData({ ...formData, request_body: e.target.value })}
          />
          <TextField
            margin="dense"
            label="期望状态码"
            fullWidth
            type="number"
            value={formData.expected_status}
            onChange={(e) =>
              setFormData({ ...formData, expected_status: parseInt(e.target.value) || 200 })
            }
          />
          <TextField
            margin="dense"
            label="期望响应 (JSON格式)"
            fullWidth
            multiline
            rows={4}
            value={formData.expected_response}
            onChange={(e) => setFormData({ ...formData, expected_response: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 代码预览对话框 */}
      <Dialog open={codeOpen} onClose={() => setCodeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>生成代码预览</DialogTitle>
        <DialogContent>
          <Tabs value={codeTab} onChange={(e, v) => setCodeTab(v)}>
            <Tab label="pytest代码" />
            <Tab label="Python脚本" />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            <TextareaAutosize
              minRows={20}
              maxRows={30}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
              }}
              value={codeTab === 0 ? generatedCode.pytest : generatedCode.script}
              readOnly
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeOpen(false)}>关闭</Button>
          <Button
            variant="contained"
            onClick={() => {
              const code = codeTab === 0 ? generatedCode.pytest : generatedCode.script;
              navigator.clipboard.writeText(code);
            }}
          >
            复制代码
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
