"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { usePathname } from 'next/navigation';
import type { DatePickerProps } from 'antd';
import { DatePicker, Space } from 'antd';
import UtilityPanel from '../UtilityPanel/UtilityPanel';
import axios from 'axios';
const { Option } = Select;

const DamcoForm: React.FC = () => {
const [form] = Form.useForm();
const tableRef = useRef<any>(null);
const [tableData, setTableData] = useState<TableData[]>([]);
const [chemicalOptions, setChemicalOptions] = useState<string[]>([]);
const [position, setPosition] = useState<'success'| 'failed'>('success');
const [searchTerm, setSearchTerm] = useState<string>('');
const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);
const [uploading, setUploading] = useState<boolean>(false);
const [isExporting, setIsExporting] = useState<boolean>(false);
const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
  };
  const handleFiles = () => {
    setPosition('failed');
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      message.error('Please select both start and end dates');
      return;
    } else if (startDate > endDate) {
      message.error('Start date is less than end date');
      return;
    }
    setIsExporting(true);

    try {
      const responseResult = await axios.get('/api/getExportRecipe', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'json',
      });
      const data = responseResult.data.files;
      console.log(data);
      const response = await axios.post('/api/exportRecipes', {data},
        {headers:{'Content-Type': 'application/json'},
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'recipes.xlsx');
      document.body.appendChild(link);
      link.click();
      message.success('File Downloaded');
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export recipes:', error);
      message.error('Failed to export recipes');
    } finally {
      setIsExporting(false);
    }
  };

  interface TableData {
    // key: number;
    id: number;
    poNumber: string;
    planHod: string;
    country: string;
    orderQty: string;
    cartonQty: string;
    cartonType: string;
    cartonCbm: string;
    grossWeight: string;
    bookingId: string;
    status:string;
    createdAt: string;
  }
  const capitalizeTitle = (title: string): string => {
    return title.replace(/\b\w/g, char => char.toUpperCase());
  };

  const columns: ColumnsType<TableData> = [
  {
    title: capitalizeTitle('ID'),
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: capitalizeTitle('PO Number'),
    dataIndex: 'poNumber',
    key: 'poNumber',
  },
  {
    title: capitalizeTitle('Plan hod'),
    dataIndex: 'planHod',
    key: 'planHod',
  },
  {
    title: capitalizeTitle('Country'),
    dataIndex: 'country',
    key: 'country',
  },
  {
    title: capitalizeTitle('Order qty'),
    dataIndex: 'orderQty',
    key: 'orderQty',
  },
  {
    title: capitalizeTitle('Carton qty'),
    dataIndex: 'cartonQty',
    key: 'cartonQty',
  },
  {
    title: capitalizeTitle('Carton type'),
    dataIndex: 'cartonType',
    key: 'cartonType',
  },
  {
    title: capitalizeTitle('Carton cbm'),
    dataIndex: 'cartonCbm',
    key: 'cartonCbm',
  },
  {
    title: capitalizeTitle('Gross weight'),
    dataIndex: 'grossWeight',
    key: 'grossWeight',
  },
  {
    title: capitalizeTitle('Booking id'),
    dataIndex: 'bookingId',
    key: 'bookingId',
  },
  {
    title: capitalizeTitle('Status'),
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: capitalizeTitle('Created at'),
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
];

  return (  <div>
          <Row style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Filters</h1>
        </Col>

      </Row>
      <br />

      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', margin: "auto" }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>

            <Col xs={24} md={12}>
              <Form.Item label="From" name="from">
              <Space direction="vertical" style={{ width: '100%' }}>
    <DatePicker onChange={onChange}
        placeholder="dd/mm/yyyy"
        style={{ width: '100%' }} 
    />
     </Space>

              </Form.Item>
            </Col>

            <Col  xs={24} md={12} >
              <Form.Item label="To" name="to">
              <Space direction="vertical" style={{ width: '100%' }}>
    <DatePicker onChange={onChange} 
    placeholder="dd/mm/yyyy"
    style={{ width: '100%' }} 

    />
     </Space>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
           
            <Col xs={24} md={12}>
              <Form.Item label="Search" name="search">
              <Input style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col>
          <Button type="primary" style={{ marginTop: '40%', backgroundColor: '#797FE7', borderRadius: '100px'}} >Search</Button>
        </Col>
          </Row>
         
        </Form>
        <br />
      </div>

      <Row style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <Col>
          <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold", marginRight: "5rem" }}> Damco Data</h1>

        </Col>
        <Col>
          <UtilityPanel
              position={position}
              setPosition={setPosition}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              handleExport={handleExport}
              handleFailedFiles={handleFiles}
              uploading={uploading}
              isExporting={isExporting} onChange={function (e: any): void {
                throw new Error('Function not implemented.');
              } }  // exportSpinner={exportSpinner}
/>
        </Col>
        <Col>
        <div className="ml-4 flex gap-2 md:absolute md:left-[70%] md:top-[10%] md:mb-4 lg: absolute lg:left-[76%] lg:top-[9%] lg:mb-8 xl:relative xl:left-0 xl:mb-0">
        <label style={{ color: '#797FE7' }}>From: </label>
        <input style={{ textAlign: 'center' }} type="date" onChange={(e) => setStartDate(e.target.value)} />
        <label style={{ color: '#797FE7' }}>To: </label>
        <input style={{ textAlign: 'center' }} type="date" onChange={(e) => setEndDate(e.target.value)} />
      </div>
        </Col>
      </Row>

{/* Table */}


<div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', }}>
          <Table
            ref={tableRef}
            columns={columns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: 'max-content' }}

          />
        </div>




  </div>

  );
};          

export default DamcoForm;
