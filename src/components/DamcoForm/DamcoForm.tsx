"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { usePathname } from 'next/navigation';
import type { DatePickerProps } from 'antd';
import { DatePicker, Space } from 'antd';
const { Option } = Select;

const DamcoForm: React.FC = () => {
const [form] = Form.useForm();
const tableRef = useRef<any>(null);
const [tableData, setTableData] = useState<TableData[]>([]);
const [chemicalOptions, setChemicalOptions] = useState<string[]>([]);

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
  };
    

  interface TableData {
    key: number;
    sno: number;
    poNumber: string;
    assignEquipment: number;
    bookingNumber: number;
    loadType: string;
    invoiceNumber: string;
    bl: string;
    carrier: string;
    tLocation: string;
    departure: string;
    equipmentNumType:string;
    routeNumber:String;
    seal:string;
    ctn:string;
    units:string;
    createdAt: string;
  }
  const capitalizeTitle = (title: string): string => {
    return title.replace(/\b\w/g, char => char.toUpperCase());
  };

  const columns: ColumnsType<TableData> = [
  {
    title: capitalizeTitle('ID'),
    dataIndex: 'sno',
    key: 'sno',
  },
  {
    title: capitalizeTitle('PO Number'),
    dataIndex: 'poNumber',
    key: 'poNumber',
  },
  {
    title: capitalizeTitle('Assign Equipment'),
    dataIndex: 'assignEquipment',
    key: 'assignEquipment',
  },
  {
    title: capitalizeTitle('Booking Number'),
    dataIndex: 'bookingNumber',
    key: 'bookingNumber',
  },
  {
    title: capitalizeTitle('Load Type'),
    dataIndex: 'loadType',
    key: 'loadType',
  },
  {
    title: capitalizeTitle('Invoice Number'),
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
  },
  {
    title: capitalizeTitle('Bl/WayBill Number'),
    dataIndex: 'bl',
    key: 'bl',
  },
  {
    title: capitalizeTitle('Carrier'),
    dataIndex: 'carrier',
    key: 'carrier',
  },
  {
    title: capitalizeTitle('Trans-Load Location'),
    dataIndex: 'tLocation',
    key: 'tLocation',
  },
  {
    title: capitalizeTitle('Est. Departure Date'),
    dataIndex: 'departure',
    key: 'departure',
  },
  {
    title: capitalizeTitle('Equipment Number Type'),
    dataIndex: 'equipmentNumType',
    key: 'equipmentNumType',
  },
  {
    title: capitalizeTitle('Route Number'),
    dataIndex: 'routeNumber',
    key: 'routeNumber',
  },
  {
    title: capitalizeTitle('Seal Number'),
    dataIndex: 'seal',
    key: 'seal',
  },
  {
    title: capitalizeTitle('CTN Quantity'),
    dataIndex: 'ctn',
    key: 'ctn',
  },
  {
    title: capitalizeTitle('Units'),
    dataIndex: 'units',
    key: 'units',
  },
  {
    title: capitalizeTitle('Created At'),
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

      <Row style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Damco Data</h1>
        </Col>
        <Col>
          <Button type="primary" style={{ backgroundColor: '#797FE7', borderRadius: '100px'}}>Download</Button>
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
