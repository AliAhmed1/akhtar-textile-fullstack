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
}
const Dashboard: React.FC<DashboardProps> = ({ recentRecipes, damcoExecuteSuccess, nexusSuccess}) => {
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
     <Space size={16} wrap style={{ marginBottom: "5px" }}>
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
     <Space size={16} wrap style={{ marginBottom: "5px" }}>
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
     <Space size={16} wrap style={{ marginBottom: "5px" }}>
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

   <div>

    <Graphs />
   </div>
    </div>


  );
};

export default Dashboard;
