"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table, message, Upload, Spin } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { usePathname } from 'next/navigation';
import type { DatePickerProps, GetProp, UploadFile, UploadProps } from 'antd';
import { DatePicker, Space } from 'antd';
import UtilityPanel from '../UtilityPanel/UtilityPanel';
import axios from 'axios';
import useCheckFetchOnce from '@/utils/useCheckFetchOnce';
// import { UploadProps } from 'antd/lib';
const { Option } = Select;
// const checkFetchOnce = useCheckFetchOnce();
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

let first = false
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
const [loading, setLoading] = useState<boolean>(false);
const [automationId, setAutomationId] = useState<boolean>(false);
const [isExporting, setIsExporting] = useState<boolean>(false);
const [fileList, setFileList] = useState<UploadFile[]>([]);
// const onChange: DatePickerProps['onChange'] = (date, dateString) => {
//     console.log(date, dateString);
//   };
  // const handleFiles = () => {
  //   setPosition('failed');
  // };
useEffect(() => {
  if(!first){
  handleFailedFiles(position, "useEffect");
  first = true
  }
},[]);

const props: UploadProps = {
  onRemove: ((file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    // console.log("file",fileList);
    return true;
  }),
  beforeUpload: (file) => {
    setFileList([...fileList, file]);

    return false;
  },
  fileList,
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

  const handleFailedFiles = async (pos: any, x: any) => {

    // console.log(x);
    console.log(pos);
    try {
      setLoading(true);
      const response = await axios.get('https://huge-godiva-arsalan-3b36a0a1.koyeb.app/damco-records',{
        headers: { status: pos},
        params:  (startDate && endDate) ? { start_date: startDate, end_date: endDate } : undefined, 
        responseType: 'json',});
        // console.log(response.data.damco_records);
        Number(response.data.damco_records.gross_weight)
        setTableData(response.data.damco_records);

      setLoading(false);
    } catch (error) {
      message.error("Failed to fetch failed records");
    }
  }
const handleExceute = async () => {
  console.log('username',form.getFieldValue('username'));
  console.log('password',form.getFieldValue('password'));
  try{
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file as FileType);
      console.log(file);
    });
    setUploading(true);
const response = await axios.post('http://127.0.0.1:8000/damco-execute',formData, {
  headers: {
    username: form.getFieldValue('username'),
    password: form.getFieldValue('password'),
  }
})
  }catch(err){
    console.log(err);
  } finally {
    setFileList([]);
    setUploading(false);
  }
}
const handleAmmend = async () => {
  try{
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file as FileType);
      console.log(file);
    });
    console.log("username: ",form.getFieldValue('username'),
    "password: ",form.getFieldValue('password'));
    setUploading(true);
const response = await axios.post('http://127.0.0.1:8000/damco-ammend',formData, {
  headers: {
    username: form.getFieldValue('username'),
    password: form.getFieldValue('password'),
  }
})
  }catch(err){
    console.log(err);
  }finally {
    setFileList([]);
    setUploading(false);
  }
}
  // const onChangeStatus = (e: any) => {
  //   console.log("Within function: ",e.target.value)
  //   setPosition(e.target.value=="success" ? "success" : "failed");
  //   handleFailedFiles(e.target.value);
  // }
  interface TableData {
    // key: number;
    id: number;
    po_number: string;
    plan_hod: string;
    country: string;
    order_qty: string;
    carton_qty: string;
    ctn_type: string;
    carton_cbm: string;
    gross_weight: number;
    booking_id: string;
    booking_status:string;
    timestamp: string;
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
    dataIndex: 'po_number',
    key: 'po_number',
    
  },
  {
    title: capitalizeTitle('Plan hod'),
    dataIndex: 'plan_hod',
    key: 'plan_hod',
  },
  {
    title: capitalizeTitle('Country'),
    dataIndex: 'country',
    key: 'country',
  },
  {
    title: capitalizeTitle('Order qty'),
    dataIndex: 'order_qty',
    key: 'order_qty',
  },
  {
    title: capitalizeTitle('Carton qty'),
    dataIndex: 'carton_qty',
    key: 'carton_qty',
  },
  {
    title: capitalizeTitle('Carton type'),
    dataIndex: 'ctn_type',
    key: 'ctn_type',
  },
  {
    title: capitalizeTitle('Carton cbm'),
    dataIndex: 'carton_cbm',
    key: 'carton_cbm',
  },
  {
    title: capitalizeTitle('Gross weight'),
    dataIndex: 'gross_weight',
    key: 'gross_weight',
  },
  {
    title: capitalizeTitle('Booking id'),
    dataIndex: 'booking_id',
    key: 'booking_id',
  },
  {
    title: capitalizeTitle('Status'),
    dataIndex: 'booking_status',
    key: 'booking_status',
  },
  {
    title: capitalizeTitle('Created at'),
    dataIndex: 'timestamp',
    key: 'timestamp',
  },
];

  return ( uploading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',gap: '1rem' }}>
    <Spin indicator={<LoadingOutlined spin />} size="large" />
    Automation in progress ...
  </div> : <>
          <Row style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Damco Automation</h1>
        </Col>

      </Row>
      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', margin: "auto", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="w-[50%]">
        <Form form={form} layout="vertical" className="w-[28rem]" >
          <Row gutter={16}>
            <Col xs={24} md={32}>
              <Form.Item label="Username" name="username" >
              {/* <Space direction="vertical" style={{ width: '100%' }}> */}
    <Input style={{ width: '100%' }} required/>
     {/* </Space> */}

              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
           
            <Col xs={24} md={32}>
              <Form.Item label="Password" name="password" >
              <Input type='password' style={{ width: '100%' }} required/>
              </Form.Item>
            </Col>
          </Row>
          <Row className='gap-6'>
          <Col>
          <Button type="primary" style={{  backgroundColor: '#797FE7'}} onClick={handleExceute}>Execute</Button>
        </Col>
        <Col>
        <Button type="primary" style={{ backgroundColor: '#797FE7'}} onClick={handleAmmend}>Ammend</Button>
        </Col>
          </Row>
         
        </Form>
        </div>
        {/* <div className=" flex w-px h-32 bg-gray-200"></div> */}
        {/* <br /> */}
        <div className=' w-1/2'>
        <div style={{ borderRadius: '15px', padding: '60px', backgroundColor: 'white', border: '2px dashed #D0D6D6' , gap: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          Upload excel
      <Upload {...props} accept=".xlsx, .xls" >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      </div>
    </div>
      </div>

      <Row style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <Col>
          <h1 className="text-[#343C6A] text-[20px] font-bold md:mr-28 lg:mr-112 xl:mr-192"> Damco Data</h1>
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
              // handleFailedFiles={handleFailedFiles}
              uploading={uploading}
              isExporting={isExporting} onChange={(e) => {
                handleFailedFiles(e.target.value, "button")
                setPosition(e.target.value)
                }}  
/>
        </Col>
        <Col className="pb-0">
        <div className="ml-2 flex gap-2">
        <label style={{ color: '#797FE7' }}>From: </label>
        <input style={{ textAlign: 'center' }} type="date" onChange={(e) => setStartDate(e.target.value)} />
        <label style={{ color: '#797FE7' }}>To: </label>
        <input style={{ textAlign: 'center' }} type="date" onChange={(e) => setEndDate(e.target.value)} />
      </div></Col>
      </Row>
{/* Table */}


<div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', }}>
  {loading ?  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <Spin indicator={<LoadingOutlined spin />} size="large" />
</div>
: <Table
            ref={tableRef}
            columns={columns}
            dataSource={tableData}
            // pagination={false}
            scroll={{ x: 'max-content' }}
          />}
          
        </div>




  </>

  );
};          

export default DamcoForm;
