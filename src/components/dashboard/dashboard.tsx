'use client';
import { useEffect, useState } from 'react';
import { Form, Input, Spin, Select, Row, Col, Button, message,Avatar, Space  } from 'antd';
import Graphs from '../Graphs/Graphs';
import {  LoadingOutlined } from '@ant-design/icons';
import { text } from 'stream/consumers';
import { trimText } from '@/utils/trimText';
import moment from 'moment';
interface DashboardProps {
  recentRecipes: any[];
  damcoExecuteSuccess: any[];
  nexusSuccess:any[];
  chemicals: any[];
}
const Dashboard: React.FC<DashboardProps> = ({ recentRecipes, damcoExecuteSuccess, nexusSuccess, chemicals}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;


  return (
    <div>
   <Row gutter={[24 , 24]}>
     <Col span={8}>
     <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Recent Recipes</h1>
     <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px' }}>
      <>
    { recentRecipes.map((recipe: any, index: number) => (
     <Space size={16} wrap style={{ marginBottom: "5px" }} key={index}>
     <Avatar size={40} style={{ backgroundColor: index===0 ? '#fde3cf': index===1 ?'#E7EDFF' : '#e9d9f7', color: '#718EBF' }}>{index + 1}</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>{recipe.title}</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>{moment(recipe.created_at).format('DD MMMM YYYY')}</span>
     </div>
     </Space>
     ))
     }
     </>     
     </div>
     </Col>
     <Col span={8}>
     <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Recent Damco Entries</h1>
     <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px' }}>
    <>
    {
      damcoExecuteSuccess.map((record: any, index: number) => (
     <Space size={16} wrap style={{ marginBottom: "5px" }} key={index}>
     <Avatar size={40} style={{ backgroundColor: index===0 ? '#e9d9f7': index===1 ?'#E7EDFF' : '#fde3cf', color: '#718EBF' }}>{index+1}</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>{record.country} {record.po_number}</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>{moment(record.timestamp).format('DD MMMM YYYY')}</span>
     </div>
     </Space>
     ))
    }
    </>
     </div>
     </Col>     

     <Col span={8}>
     <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Recent Nexus Entries</h1>
     <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px' }}>
    <>
    {
      nexusSuccess.map((record: any, index: number) => (
     <Space size={16} wrap style={{ marginBottom: "5px" }} key={index}>
     <Avatar size={40} style={{ backgroundColor: index===0 ? '#fde3cf': index===1 ?'#E7EDFF' : '#e9d9f7', color: '#718EBF' }}>{index+1}</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>{record.booking_number} {record.invoice_number}</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>{moment(record.timestamp).format('DD MMMM YYYY')}</span>
     </div>
     </Space>
      ))
     }
     </>
     </div>
     </Col>

   </Row>
   {/* <Space size={16} style={{ marginTop: "20px" }}></Space> */}
<Row style={{ marginTop: "20px" }} gutter={[24 , 24]}>
  <Col span={8}>
  <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}>Chemical On Order</h1>
  <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px',maxHeight: '200px' }}>
    <div className='flex gap-[9rem] mb-1'>
      <strong>Chemicals</strong>
      <strong>On Order</strong>
    </div>
    <div className='hide-scrollbar overflow-y-auto max-h-[135px]'>
    <table className='w-full'>
      <thead>
        <tr >
          <th  className='text-left'></th>
          <th></th>
          <th className='text-left'></th>
        </tr>
      </thead> 
      <tbody>   
  <>
  {
    chemicals.filter((chemical: any) => Number(chemical.on_order) > 0).map((chemical: any, index: number) => (
      
  // <Space size={16} style={{ marginBottom: "5px" }}>
    <tr key= {index} >
      <td >{trimText(chemical.name,15)}</td>
      <td></td>
      <td className='text-left'>{chemical.on_order}{chemical.unit_used === "NA"? "": " "+chemical.unit_used}</td>
    </tr>
  // </Space>
  ))
  }
  </>
  </tbody>
  </table>
  </div>
  </div>
  </Col>
  <Col span={16}>
  <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}>Chemical Inventory</h1>
  <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px',maxHeight: '200px' }}>
    <div className='flex mb-1'>
      <strong>Chemicals</strong>
      <strong className='ml-[19rem]'>Total</strong>
      <strong className='ml-[7rem]'>Boxes</strong>
    </div>
    <div className='hide-scrollbar overflow-y-auto max-h-[135px]'>
    <table className='w-full'>
      <thead>
        <tr >
          <th  className='text-left'></th>
          <th></th>
          <th className='text-left'></th>
        </tr>
      </thead> 
      <tbody>   
  <>
  {
    chemicals.filter((chemical: any) => chemical.total !=="0" && chemical.on_order !== 'null').map((chemical: any, index: number) => (

  // <Space size={16} style={{ marginBottom: "5px" }}>
    <tr key= {index} >
      <td >{trimText(chemical.name,17)}</td>
      <td className='text-left'>{chemical.total} {chemical.unit_used === "NA" || chemical.unit_used === "null"? "-": chemical.unit_used}</td>
      <td>{chemical.boxes}</td>
    </tr>
  // </Space>
  ))
  }
  </>
  </tbody>
  </table>
  </div>
  </div>
  </Col>

   {/* <div> */}

    {/* <Graphs /> */}
   {/* </div> */}
   </Row>
   <Row style={{ marginTop: "20px" }} gutter={[24 , 24]}>
       <div>

    <Graphs />
   </div>
   </Row>
    </div>


  );
};

export default Dashboard;
