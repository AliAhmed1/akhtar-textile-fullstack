"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table, Spin, Upload, Dropdown, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { usePathname } from 'next/navigation';
import type { DatePickerProps, GetProp, UploadFile, UploadProps } from 'antd';
import { DownOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { DatePicker, Space } from 'antd';
import UtilityPanel from '../UtilityPanel/UtilityPanel';
import axios from 'axios';
import useCheckFetchOnce from '@/utils/useCheckFetchOnce';
import { formatDate } from '@/utils/formatDate';
import { se } from 'date-fns/locale';
// import { formatDate } from 'date-fns';
const { Option } = Select;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const NexusForm: React.FC = () => {
const [form] = Form.useForm();
const tableRef = useRef<any>(null);
const [tableData, setTableData] = useState<TableData[]>([]);
const [chemicalOptions, setChemicalOptions] = useState<string[]>([]);
const [uploading, setUploading] = useState<boolean>(false);
const [loading, setLoading] = useState<boolean>(false);
const [fileList, setFileList] = useState<UploadFile[]>([]);
const [position, setPosition] = useState<'success'| 'failed'>('success');
const [searchTerm, setSearchTerm] = useState<string>('');
const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);
const [isExporting, setIsExporting] = useState<boolean>(false);
const [response, setResponse] = useState<string>();
const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
  };

  const checkFetchOnce = useCheckFetchOnce();
useEffect(() => {
  if(checkFetchOnce()){
  handleRecords(position);
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

  const filterData: TableData[] = tableData?.filter((item:TableData) => (
    item.id.toString().includes(searchTerm) ||
    item.po_number.toString().includes(searchTerm.toLowerCase()) ||
    item.assign_equipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.shipment_load_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.invoice_number.toString().includes(searchTerm) ||
    item.bill_waybill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.carrier.toLowerCase().toString().includes(searchTerm.toLowerCase()) ||
    item.updated_transload_location_us_only.toLowerCase().toString().includes(searchTerm.toLowerCase()) ||
    item.estimated_departure_date.toLowerCase().includes(searchTerm.toLowerCase())||
    item.equipment_number_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.route_number.toString().includes(searchTerm) ||
    item.seal_number.toString().includes(searchTerm) ||
    item.ctn_qty.toString().includes(searchTerm) ||
    item.units.toString().includes(searchTerm) ||
    item.timestamp.includes(searchTerm)
  ))

  const fetchNexus = async (position:any, startDate?:string | null,endDate?:string | null) => {
    try{
      const response = await axios.get('http://127.0.0.1:8001/nexus-records',{
      headers: { status: position},
      params:  { start_date: startDate, end_date: endDate }, 
      responseType: 'json',});
      console.log('execute',response.data);
      return  response.data.nexus_records
    }catch (error){
      setResponse("null");
      message.error("Failed to fetch failed records");
    }
  }
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
handleRecords(position,start,end);
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
        const data = await fetchNexus(position);
        console.log(data)
      const response = await axios.post('/api/exportNexusRecords', {data},
        {headers:{'Content-Type': 'application/json'},
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexus ${position} records.xlsx`);
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

  const handleRecords = async (pos: any, startDate?:string | null, endDate?:string | null) => {
    try {
      setLoading(true);
      const data = await fetchNexus(pos,startDate,endDate);
      // console.log(">>>>>",data)
        setTableData(data);
    } catch (error) {
      // console.log(">>>>><<<<<<<<<")
      message.error("Failed to fetch failed records");
    }
    finally{
      setLoading(false);
    }
  }

  const handleExceute = async (action:string) => {
    console.log('username',form.getFieldValue('username'));
    console.log('password',form.getFieldValue('password'));
    try{
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('file', file as FileType);
        console.log(file);
      });
      setUploading(true);
  const response = await axios.post('http://127.0.0.1:8000/nexus-execute',formData, {
    headers: {
      username: form.getFieldValue('username'),
      password: form.getFieldValue('password'),
      mode: action
    }
  })
  response.data.error && message.error(response.data.error);
    }catch(err){
      console.log(err);
    } finally {
      setFileList([]);
      setUploading(false);
    }
  }

  interface TableData {
    key: number;
    id: number;
    po_number: number;
    assign_equipment_id: string;
    booking_number: string;
    shipment_load_type: string;
    invoice_number: number;
    bill_waybill:string;
    carrier: string;
    updated_transload_location_us_only: string;
    estimated_departure_date: string;
    equipment_number_type: string;
    route_number: number;
    seal_number: number;
    ctn_qty: number;
    units: number;
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
      title: capitalizeTitle('Assign Equipment ID'),
      dataIndex: 'assign_equipment_id',
      key: 'assign_equipment_id',
    },
    {
      title: capitalizeTitle('Booking No'),
      dataIndex: 'booking_number',
      key: 'booking_number',
    },
    {
      title: capitalizeTitle('Shipment Load type'),
      dataIndex: 'shipment_load_type',
      key: 'shipment_load_type',
    },
    {
      title: capitalizeTitle('Invoice No'),
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: capitalizeTitle('Billway Bill'),
      dataIndex: 'bill_waybill',
      key: 'bill_waybill',
    },
    {
      title: capitalizeTitle('Carrier'),
      dataIndex: 'carrier',
      key: 'carrier',
    },
    {
      title: capitalizeTitle('Transload Location'),
      dataIndex: 'updated_transload_location_us_only',
      key: 'updated_transload_location_us_only',
    },
    {
      title: capitalizeTitle('Estd. Departure Date'),
      dataIndex: 'estimated_departure_date',
      key: 'estimated_departure_date',
    },
    {
      title: capitalizeTitle('Equipment No Type'),
      dataIndex: 'equipment_number_type',
      key: 'equipment_number_type',
    },
    {
      title: capitalizeTitle('Route No'),
      dataIndex: 'route_number',
      key: 'route_number',
    },
    {
      title: capitalizeTitle('Seal No'),
      dataIndex: 'seal_number',
      key: 'seal_number',
    },
    {
      title: capitalizeTitle('Ctn Qty'),
      dataIndex: 'ctn_qty',
      key: 'ctn_qty',
    },
    {
      title: capitalizeTitle('Units'),
      dataIndex: 'units',
      key: 'units',
    },
    {
      title: capitalizeTitle('Ctreated At'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => formatDate(timestamp),
    },
  ];

  return ( uploading  ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',gap: '1rem' }}>
    <Spin indicator={<LoadingOutlined spin />} size="large" />
    Automation in progress ...
  </div> : <>
          <Row style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Nexus Automation</h1>
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
          <Button type="primary" style={{  backgroundColor: '#797FE7'}} onClick={() => handleExceute("preview")}>Preview</Button>
        </Col>
        <Col>
        <Button type="primary" style={{ backgroundColor: '#797FE7'}} onClick={() => handleExceute("Approve")}>Approve</Button>
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
          <h1 className="text-[#343C6A] text-[20px] font-bold md:mr-[13rem] lg:mr-[34rem] xl:mr-[54rem]">Result</h1>
        </Col>
        {/* <Col>
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
        </Col> */}
        <Col>
          <UtilityPanel
              position={position}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExport={handleExport}
              uploading={uploading}
              isExporting={isExporting} onChange={(e) => {
                handleRecords(e.target.value)
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
  {loading  ?  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

  )
};          

export default NexusForm;
