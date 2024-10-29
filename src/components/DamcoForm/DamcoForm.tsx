"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table, message, Upload, Spin, Dropdown } from 'antd';
import { DownOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { usePathname } from 'next/navigation';
import type { DatePickerProps, GetProp, MenuProps, UploadFile, UploadProps } from 'antd';
import { DatePicker, Space } from 'antd';
import UtilityPanel from '../UtilityPanel/UtilityPanel';
import axios from 'axios';
import useCheckFetchOnce from '@/utils/useCheckFetchOnce';
import { formatDate } from '@/utils/formatDate';
import { delay } from 'lodash';
// import { UploadProps } from 'antd/lib';
const { Option } = Select;
// const checkFetchOnce = useCheckFetchOnce();
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

let first = false
const DamcoForm: React.FC = () => {
  const [form] = Form.useForm();
  const tableRef = useRef<any>(null);
  const [tableData, setTableData] = useState<TableData[]>([]);
  // const [chemicalOptions, setChemicalOptions] = useState<string[]>([]);
  const [damco_records, setDamco_records] = useState<any[]>([]);
const [position, setPosition] = useState<'success'| 'failed'>('success');
const [searchTerm, setSearchTerm] = useState<string>('');
const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);
const [uploading, setUploading] = useState<boolean>(false);
const [loading, setLoading] = useState<boolean>(false);
const [automationId, setAutomationId] = useState<boolean>(false);
const [isExporting, setIsExporting] = useState<boolean>(false);
const [fileList, setFileList] = useState<UploadFile[]>([]);
const [selectedAction, setSelectedAction] = useState<'Execute' | 'Ammend'>('Execute');
// const onChange: DatePickerProps['onChange'] = (date, dateString) => {
//     console.log(date, dateString);
//   };
  // const handleFiles = () => {
    //   setPosition('failed');
    // };
   

const checkFetchOnce = useCheckFetchOnce();
useEffect(() => {
  if(checkFetchOnce()){
  handleRecords(position,selectedAction);
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

const onChangeDate = (e:any,dateTag:string) => {
      console.log(dateTag);
      let start = startDate, end = endDate;
  if(dateTag==="start"){ 
  setStartDate(e)
  start = e;
  }
  if(dateTag==="end"){
    setEndDate(e)
    end = e;
  }
  handleRecords(position,selectedAction,start,end);
}

  const handleExport = async () => {
    if (!startDate || !endDate) {
      message.error('Please select both start and end dates');
      return;
    } else if (startDate > endDate) {
      message.error('Start date is less than end date');
      return;
    }
    setIsExporting(true);
// console.log('start:',startDate, 'end:',endDate);
    try {

      if(selectedAction === "Execute"){
        const data = await fetchDamcoExecute(position);
        console.log(data)
      const response = await axios.post('/api/exportDamcoRecords', {data},
        {headers:{'Content-Type': 'application/json'},
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `damco execute ${position} records.xlsx`);
      document.body.appendChild(link);
      link.click();
      message.success('File Downloaded');
      document.body.removeChild(link);
    }else {
      const data = await fetchDamcoAmmend(position);
      const response = await axios.post('/api/exportDamcoRecords', {data},
        {headers:{'Content-Type': 'application/json'},
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `damco ammend ${position} records.xlsx`);
      document.body.appendChild(link);
      link.click();
      message.success('File Downloaded');
      document.body.removeChild(link);
    }
    } catch (error) {
      console.error('Failed to export recipes:', error);
      message.error('Failed to export recipes');
    } finally {
      setIsExporting(false);
    }
  };
//  let input: string = '';
  const filterData: TableData[] = tableData?.filter((item:TableData) => (
    item.id.toString().includes(searchTerm) ||
    item.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.plan_hod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.order_qty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.carton_qty.toString().includes(searchTerm) ||
    item.ctn_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.carton_cbm.toString().includes(searchTerm) ||
    item.gross_weight.toString().includes(searchTerm) ||
    item.booking_id.toLowerCase().includes(searchTerm.toLowerCase())||
    item.timestamp.includes(searchTerm)
  ));

const fetchDamcoExecute = async (position:any, startDate?:string | null,endDate?:string | null) => {
  const response = await axios.get('https://huge-godiva-arsalan-3b36a0a1.koyeb.app/damco-records',{
    headers: { status: position},
    params:  { start_date: startDate, end_date: endDate }, 
    responseType: 'json',});
    console.log('execute',response.data.damco_records);
    return  response.data.damco_records
}

const fetchDamcoAmmend = async (position:any, startDate?:string | null,endDate?:string | null) => {
  console.log('fetchDamcoAmmend',startDate, endDate); 
  const response = await axios.get('https://huge-godiva-arsalan-3b36a0a1.koyeb.app/damco-ammend-records',{
    headers: { status: position},
    params:  { start_date: startDate, end_date: endDate }, 
    responseType: 'json',});
    console.log('ammend',response.data.damco_ammend_records);
    return response.data.damco_ammend_records
} 

  const handleRecords = async (pos: any, key:any, startDate?:string | null, endDate?:string | null) => {
    console.log('selectItem',selectedAction);
    console.log(pos);
    console.log(key)
    try {
      console.log('check')
      setLoading(true);
      if(key === 'Execute'){
        console.log('execute')
      const data = await fetchDamcoExecute(pos,startDate,endDate);
        setTableData(data);
      }else if (key === 'Ammend'){
        console.log('ammend')
        const data = await fetchDamcoAmmend(pos,startDate,endDate);
        setTableData(data);
      }
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
function delay(ms:any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
  interface TableData {
    key: number;
    id: number;
    po_number: string;
    plan_hod: string;
    country: string;
    order_qty: string;
    carton_qty: number;
    ctn_type: string;
    carton_cbm: number;
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
    render: (carton_qty) => parseFloat(carton_qty).toFixed(2)
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
    render: (carton_cbm) => parseFloat(carton_cbm).toFixed(2)
  },
  {
    title: capitalizeTitle('Gross weight'),
    dataIndex: 'gross_weight',
    key: 'gross_weight',
    render: (gross_weight) => parseFloat(gross_weight).toFixed(2)
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
    render: (timestamp) => formatDate(timestamp),
  },
];

const items: MenuProps['items'] = [
  {
    label: <a > Execute</a>,
    key: 'Execute',
  },
  {
    label: <a >Ammend</a>,
    key: 'Ammend',
  },
];


const handleMenuClick = async (e: { key: string }) => {
  // Update the selected item based on the key
  switch (e.key) {
    case 'Execute':
      setSelectedAction('Execute');
      break;
    case 'Ammend':
      setSelectedAction('Ammend');
      break;
    default:
      setSelectedAction('Execute');
  }
  handleRecords(position,e.key);
  // console.log(selectedAction);
};
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
          <h1 className="text-[#343C6A] text-[20px] font-bold md:mr-[6rem] lg:mr-112 xl:mr-192">Result</h1>
        </Col>
        <Col>
        <div className='flex border border-gray-300 p-[5px] rounded-md mr-3 pd-[10px] pl-[12px] pr-[12px] bg-white'>
        <Dropdown menu={{ items, onClick: (e)=>{handleMenuClick(e); console.log(e)} }} trigger={['click']} >
    <a className= "text-black hover:text-[#797fe7]" onClick={(e) => e.preventDefault()} >
      <Space>
        {selectedAction}
        <DownOutlined className='w-[0.65rem] h-[0.65rem]'/>
      </Space>
    </a>
  </Dropdown>
  </div>
        </Col>
        <Col>
          <UtilityPanel
              position={position}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExport={handleExport}
              uploading={uploading}
              isExporting={isExporting} onChange={(e) => {
                handleRecords(e.target.value,selectedAction)
                setPosition(e.target.value)
                }}  
/>
        </Col>
        <Col className="pb-0">
        <div className="ml-2 flex gap-2">
        <label style={{ color: '#797FE7' }}>From: </label>
        <input style={{ textAlign: 'center' }} type="date" onChange={(e) => onChangeDate(e.target.value,"start")} />
        <label style={{ color: '#797FE7' }}>To: </label>
        <input style={{ textAlign: 'center' }} type="date" onChange={(e) => onChangeDate(e.target.value,"end")} />
      </div></Col>
      </Row>
{/* Table */}


<div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', }}>
  {loading ?  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <Spin indicator={<LoadingOutlined spin />} size="large" />
</div>

: 
<Table
            ref={tableRef}
            columns={columns}
            dataSource={filterData}
            // pagination={false}
            scroll={{ x: 'max-content' }}
          />}
          
        </div>
  </>

  );
};          

export default DamcoForm;
