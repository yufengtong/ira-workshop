'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Modal, message, Upload, Button, Tabs, Tag } from 'antd';
import { UploadOutlined, FileZipOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload';

const { TextArea } = Input;

interface Skill {
  id: number;
  name: string;
  description: string | null;
  content: string | null;
  author: string | null;
  version: string;
  tags: string | null;
  category: string | null;
  usageCount: number;
  sourceType: string;
  gitUrl: string | null;
  gitPath: string | null;
  filePath: string | null;
  skillFiles?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SkillFormProps {
  visible: boolean;
  skill?: Skill | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function SkillForm({ visible, skill, onCancel, onSuccess }: SkillFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('form');
  const [zipFile, setZipFile] = useState<RcFile | null>(null);
  const isEditing = !!skill;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (visible && skill) {
      const tags = skill.tags ? (() => { try { return JSON.parse(skill.tags); } catch { return []; } })() : [];
      form.setFieldsValue({
        name: skill.name,
        description: skill.description,
        content: skill.content,
        author: skill.author,
        version: skill.version,
        category: skill.category,
        tags: Array.isArray(tags) ? tags.join(', ') : '',
      });
      setActiveTab('form');
      setZipFile(null);
    } else if (visible) {
      form.resetFields();
      setActiveTab('form');
      setZipFile(null);
    }
  }, [visible, skill, form]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/skills/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 'zip') {
      return handleZipUpload();
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };

      const url = isEditing ? `/api/skills/${skill.id}` : '/api/skills';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        message.success(isEditing ? '技能更新成功' : '技能创建成功');
        onSuccess();
      } else {
        message.error(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Error saving skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZipUpload = async () => {
    if (!zipFile) {
      message.warning('请先选择 ZIP 文件');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', zipFile);

      const category = form.getFieldValue('category');
      if (category) {
        formData.append('category', category);
      }

      let url: string;
      let method: string;

      if (isEditing) {
        url = `/api/skills/${skill.id}/upload`;
        method = 'PUT';
      } else {
        url = '/api/skills/upload';
        method = 'POST';
      }

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success) {
        message.success(isEditing ? '技能更新成功（ZIP上传）' : '技能创建成功（ZIP上传）');
        onSuccess();
      } else {
        message.error(data.error || 'ZIP 上传失败');
      }
    } catch (error) {
      console.error('Error uploading zip:', error);
      message.error('ZIP 上传失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!skill) return;
    try {
      const res = await fetch(`/api/skills/${skill.id}/download`);
      if (!res.ok) {
        message.error('下载失败');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${skill.filePath || skill.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      message.error('下载失败');
    }
  };

  const beforeUpload = (file: RcFile) => {
    if (!file.name.endsWith('.zip')) {
      message.error('仅支持 .zip 格式的文件');
      return false;
    }
    setZipFile(file);
    return false; // 阻止自动上传
  };

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ version: '1.0.0' }}
    >
      <Form.Item
        name="name"
        label="名称"
        rules={[{ required: activeTab === 'form', message: '请输入技能名称' }]}
      >
        <Input placeholder="输入技能名称（将作为 SKILL.md 中的 name）" />
      </Form.Item>

      <Form.Item name="description" label="描述">
        <TextArea rows={2} placeholder="输入技能描述（将写入 SKILL.md frontmatter）" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="category" label="分类">
          <Select
            placeholder="选择或输入分类"
            allowClear
            showSearch
            options={categories.map(c => ({ label: c, value: c }))}
            dropdownRender={(menu) => <>{menu}</>}
          />
        </Form.Item>
        <Form.Item name="version" label="版本">
          <Input placeholder="例如：1.0.0" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="author" label="作者">
          <Input placeholder="输入作者名称" />
        </Form.Item>
        <Form.Item name="tags" label="标签">
          <Input placeholder="输入标签，用逗号分隔" />
        </Form.Item>
      </div>

      <Form.Item
        name="content"
        label="SKILL.md 正文内容"
        rules={[{ required: activeTab === 'form', message: '请输入技能内容' }]}
      >
        <TextArea
          rows={10}
          placeholder={"## 使用场景\n- 场景描述1\n- 场景描述2\n\n## 执行步骤\n1. 步骤1\n2. 步骤2"}
          className="font-mono"
        />
      </Form.Item>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <strong>提示：</strong>保存后将自动生成标准 Skill 目录结构，包含 SKILL.md 文件（元数据作为 YAML frontmatter）。
      </div>
    </Form>
  );

  const zipContent = (
    <div className="space-y-4">
      {isEditing && (
        <Form form={form} layout="vertical">
          <Form.Item name="category" label="分类">
            <Select
              placeholder="选择分类（可选，覆盖 ZIP 中的分类）"
              allowClear
              showSearch
              options={categories.map(c => ({ label: c, value: c }))}
            />
          </Form.Item>
        </Form>
      )}

      <Upload.Dragger
        accept=".zip"
        maxCount={1}
        beforeUpload={beforeUpload}
        onRemove={() => setZipFile(null)}
        fileList={zipFile ? [{ uid: '-1', name: zipFile.name, status: 'done' } as UploadFile] : []}
      >
        <p className="text-4xl text-gray-400 mb-2">
          <FileZipOutlined />
        </p>
        <p className="text-base">点击或拖拽 ZIP 文件到此处</p>
        <p className="text-sm text-gray-400 mt-1">
          ZIP 内须包含 SKILL.md 文件
        </p>
      </Upload.Dragger>

      <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
        <p className="font-semibold mb-2">ZIP 标准结构示例：</p>
        <pre className="text-xs font-mono bg-white p-2 rounded">
{`my-skill/
├── SKILL.md          # 必需：元数据 + 执行指令
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：参考文档
├── templates/        # 可选：模板文件
└── assets/           # 可选：资源文件`}
        </pre>
      </div>

      {isEditing && skill?.filePath && (
        <Button icon={<DownloadOutlined />} onClick={handleDownload} block>
          下载当前版本压缩包
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      title={isEditing ? '编辑技能' : '添加新技能'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      cancelText="取消"
      okText={activeTab === 'zip' ? '上传 ZIP' : '保存'}
      width={750}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'form',
            label: '手动填写',
            children: formContent,
          },
          {
            key: 'zip',
            label: (
              <span>
                <FileZipOutlined className="mr-1" />
                ZIP 上传
              </span>
            ),
            children: zipContent,
          },
        ]}
      />
    </Modal>
  );
}
