import React, { useState } from 'react';
import { Radio, Input, Button, Spin, Popconfirm } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';

const exportSpinner = <LoadingOutlined style={{ fontSize: 18, color: '#ffffff' }} spin />;

interface UtilityPanelProps {
  position: string;
  setPosition: (value: any) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  handleExport: () => void;
  handleFailedFiles: () => void;
  uploading: boolean;
  isExporting: boolean;
  onChange: (e: any) => void;
//   exportSpinner: React.ReactNode;
}

const UtilityPanel: React.FC<UtilityPanelProps> = ({
  position,
  setPosition,
  searchTerm,
  setSearchTerm,
  setStartDate,
  setEndDate,
  handleExport,
  handleFailedFiles,
  uploading,
  isExporting,

}) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignContent: 'center' }}>
      <Radio.Group value={position} onChange={(e) => setPosition(e.target.value)}>
        <div style={{ display: 'flex' }}>
          <Radio.Button value="success">success</Radio.Button>
          <Radio.Button onClick={handleFailedFiles} value="failed">failed</Radio.Button>
        </div>
      </Radio.Group>

      <Input
        placeholder="Search by recipe name"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

     <Button
        type="primary"
        onClick={handleExport}
        disabled={uploading}
        style={{ backgroundColor: '#797FE7', borderColor: '#797FE7' }}
      >
        {isExporting ? <Spin indicator={exportSpinner} /> : 'Export'}
      </Button>
    </div>
  );
};

export default UtilityPanel;
