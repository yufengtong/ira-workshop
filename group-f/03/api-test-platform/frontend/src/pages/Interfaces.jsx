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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { projectApi, interfaceApi } from '../services/api';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function Interfaces() {
  const [interfaces, setInterfaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [open, setOpen] = useState(false);
  const [editingInterface, setEditingInterface] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    name: '',
    path: '',
    method: 'GET',
    headers: '{}',
    request_body: '{}',
  });

  useEffect(() => {
    loadProjects();
    loadInterfaces();
  }, []);

  useEffect(() => {
    loadInterfaces();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const response = await projectApi.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadInterfaces = async () => {
    try {
      const response = await interfaceApi.getAll(selectedProject || undefined);
      setInterfaces(response.data);
    } catch (error) {
      console.error('Failed to load interfaces:', error);
    }
  };

  const handleOpen = (iface = null) => {
    if (iface) {
      setEditingInterface(iface);
      setFormData({
        project_id: iface.project_id,
        name: iface.name,
        path: iface.path,
        method: iface.method,
        headers: JSON.stringify(iface.headers || {}, null, 2),
        request_body: JSON.stringify(iface.request_body || {}, null, 2),
      });
    } else {
      setEditingInterface(null);
      setFormData({
        project_id: selectedProject || (projects[0]?.id || ''),
        name: '',
        path: '',
        method: 'GET',
        headers: '{}',
        request_body: '{}',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInterface(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        headers: JSON.parse(formData.headers || '{}'),
        request_body: JSON.parse(formData.request_body || '{}'),
      };

      if (editingInterface) {
        await interfaceApi.update(editingInterface.id, data);
      } else {
        await interfaceApi.create(data);
      }
      handleClose();
      loadInterfaces();
    } catch (error) {
      console.error('Failed to save interface:', error);
      alert('保存失败，请检查JSON格式');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个接口吗？')) {
      try {
        await interfaceApi.delete(id);
        loadInterfaces();
      } catch (error) {
        console.error('Failed to delete interface:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">接口管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          新建接口
        </Button>
      </Box>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>选择项目</InputLabel>
        <Select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>接口名称</TableCell>
              <TableCell>请求方法</TableCell>
              <TableCell>接口路径</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interfaces.map((iface) => (
              <TableRow key={iface.id}>
                <TableCell>{iface.name}</TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        iface.method === 'GET'
                          ? '#4caf50'
                          : iface.method === 'POST'
                          ? '#2196f3'
                          : iface.method === 'PUT'
                          ? '#ff9800'
                          : iface.method === 'DELETE'
                          ? '#f44336'
                          : '#9e9e9e',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    {iface.method}
                  </span>
                </TableCell>
                <TableCell>{iface.path}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(iface)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(iface.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingInterface ? '编辑接口' : '新建接口'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>所属项目</InputLabel>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              label="所属项目"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="接口名称"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>请求方法</InputLabel>
            <Select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              label="请求方法"
            >
              {HTTP_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="接口路径"
            fullWidth
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            placeholder="/api/v1/users"
          />
          <TextField
            margin="dense"
            label="请求头 (JSON格式)"
            fullWidth
            multiline
            rows={3}
            value={formData.headers}
            onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
          />
          <TextField
            margin="dense"
            label="请求体模板 (JSON格式)"
            fullWidth
            multiline
            rows={4}
            value={formData.request_body}
            onChange={(e) => setFormData({ ...formData, request_body: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
