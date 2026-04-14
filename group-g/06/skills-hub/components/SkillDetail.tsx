'use client';

import React from 'react';
import { Modal, Descriptions, Tag, Button, Typography, List, message } from 'antd';
import { EditOutlined, GithubOutlined, FileTextOutlined, FolderOutlined, DownloadOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

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

interface SkillDetailProps {
  visible: boolean;
  skill: Skill | null;
  onClose: () => void;
  onEdit?: (skill: Skill) => void;
}

export default function SkillDetail({ visible, skill, onClose, onEdit }: SkillDetailProps) {
  if (!skill) return null;

  const tags = skill.tags ? (() => { try { return JSON.parse(skill.tags); } catch { return []; } })() : [];

  const handleDownload = async () => {
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
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>{skill.name}</span>
          <Tag color="blue">{skill.version}</Tag>
          {skill.sourceType === 'git' && <Tag color="purple">Git</Tag>}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        skill.filePath && (
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            下载压缩包
          </Button>
        ),
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            onClose();
            onEdit?.(skill);
          }}
        >
          编辑
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="分类">
            {skill.category ? <Tag color="blue">{skill.category}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="作者">{skill.author || '-'}</Descriptions.Item>
          <Descriptions.Item label="使用次数">{skill.usageCount}</Descriptions.Item>
          <Descriptions.Item label="来源">
            {skill.sourceType === 'git' ? (
              <Tag icon={<GithubOutlined />} color="purple">Git</Tag>
            ) : (
              <Tag icon={<FileTextOutlined />} color="orange">手动</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(skill.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(skill.updatedAt).toLocaleString()}
          </Descriptions.Item>
          {skill.filePath && (
            <Descriptions.Item label="本地路径" span={2}>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                skills/{skill.filePath}
              </code>
            </Descriptions.Item>
          )}
        </Descriptions>

        {skill.description && (
          <div>
            <h4 className="font-semibold mb-2">描述</h4>
            <p className="text-gray-600">{skill.description}</p>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">标签</h4>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag: string) => (
                <Tag key={tag} color="green">{tag}</Tag>
              ))}
            </div>
          </div>
        )}

        {skill.gitUrl && (
          <div>
            <h4 className="font-semibold mb-2">Git 来源</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">地址：</span> {skill.gitUrl}
            </p>
            {skill.gitPath && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">路径：</span> {skill.gitPath}
              </p>
            )}
          </div>
        )}

        {/* Skill 文件列表 */}
        {skill.skillFiles && skill.skillFiles.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">
              <FolderOutlined className="mr-1" />
              文件结构 ({skill.skillFiles.length} 个文件)
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
              <List
                size="small"
                dataSource={skill.skillFiles}
                renderItem={(file: string) => (
                  <List.Item className="py-1 px-0 border-0">
                    <span className="text-sm font-mono text-gray-600">
                      <FileTextOutlined className="mr-2 text-gray-400" />
                      {file}
                    </span>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* SKILL.md 内容 */}
        {skill.content && (
          <div>
            <h4 className="font-semibold mb-2">SKILL.md 内容</h4>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono whitespace-pre-wrap">
              {skill.content}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
