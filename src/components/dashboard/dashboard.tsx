'use client';
import { useEffect, useState } from 'react';
import { Form, Input, Spin, Select, Row, Col, Button, message,Avatar, Space  } from 'antd';
import Graphs from '../Graphs/Graphs';
import {  LoadingOutlined } from '@ant-design/icons';
const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;

  return (
    <div>
   <Row gutter={[24 , 24]}>
     <Col span={8}>
     <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Recent Recipes</h1>
     <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px' }}>
    
     <Space size={16} wrap style={{ marginBottom: "5px" }}>
     <Avatar size={40} style={{ backgroundColor: '#fde3cf', color: '#718EBF' }}>1</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>Angel island(D) 1548</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>23 September 2024</span>
     </div>
     </Space>

     <Space size={16} wrap style={{ marginBottom: "5px" }}>
     <Avatar size={40} style={{ backgroundColor: '#E7EDFF', color: '#718EBF' }}>2</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>Angel island(D) 1548</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>23 September 2024</span>
     </div>
     </Space>
     </div>
     </Col>
     <Col span={8}>
     <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Recent Damco Entries</h1>
     <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px' }}>
    
     <Space size={16} wrap style={{ marginBottom: "5px" }}>
     <Avatar size={40} style={{ backgroundColor: '#fde3cf', color: '#718EBF' }}>1</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>Angel island(D) 1548</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>23 September 2024</span>
     </div>
     </Space>

     <Space size={16} wrap style={{ marginBottom: "5px" }}>
     <Avatar size={40} style={{ backgroundColor: '#E7EDFF', color: '#718EBF' }}>2</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>Angel island(D) 1548</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>23 September 2024</span>
     </div>
     </Space>
     </div>
     </Col>     

     <Col span={8}>
     <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}> Recent Nexus Entries</h1>
     <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', marginTop:'10px' }}>
    
     <Space size={16} wrap style={{ marginBottom: "5px" }}>
     <Avatar size={40} style={{ backgroundColor: '#fde3cf', color: '#718EBF' }}>1</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>Angel island(D) 1548</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>23 September 2024</span>
     </div>
     </Space>

     <Space size={16} wrap style={{ marginBottom: "5px" }}>
     <Avatar size={40} style={{ backgroundColor: '#E7EDFF', color: '#718EBF' }}>2</Avatar>
     <div> 
     <span style={{  fontWeight: "bold", color: '#232323',position: 'relative', top: '-1px' }}>Angel island(D) 1548</span>
     <br />
     <span style={{   color: '#718EBF',position: 'relative', top: '-5px' }}>23 September 2024</span>
     </div>
     </Space>
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
