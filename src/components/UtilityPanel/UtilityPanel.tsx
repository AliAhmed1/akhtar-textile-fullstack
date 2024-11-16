"use client";
import React, { useState } from 'react';
import { Radio, Input, Button, Spin, Popconfirm } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';


const exportSpinner = <LoadingOutlined style={{ fontSize: 18, color: '#ffffff' }} spin />;
// const checkFetchOnce = useCheckFetchOnce();
interface UtilityPanelProps {
  position: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleExport: () => void;
  // handleFailedFiles: () => void;
  uploading: boolean;
  isExporting: boolean;
  onChange: (e: any) => void;
//   exportSpinner: React.ReactNode;
}

const UtilityPanel: React.FC<UtilityPanelProps> = ({
  position,
  searchTerm,
  setSearchTerm,
  handleExport,
  // handleFailedFiles,
  uploading,
  isExporting,
  onChange

}) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignContent: 'center' }}>
      <Radio.Group value={position} onChange={onChange}>
        <div style={{ display: 'flex' }}>
          <Radio.Button value="success">success</Radio.Button>
          <Radio.Button value="failed">failed</Radio.Button>
        </div>
      </Radio.Group>
<div className='w-[10rem]'>
      <Input 
        placeholder="Search by"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
</div>
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
