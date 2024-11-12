"use client";

import React, { useState } from 'react';
import { Form, Input, Select, Row, Col, Button, message } from 'antd';

const { Option } = Select;

interface ChemicalFormProps {
  setIsModalVisible: (visible: boolean) => void;
  onSuccess: () => void;
  form: any;
}

const ChemicalForm: React.FC<ChemicalFormProps> = ({ setIsModalVisible,onSuccess,form }) => {

  const [loading, setLoading] = useState(false); // Loader state

  const onFinish = async (values: any) => {
    console.log('Form values:', values);
    setLoading(true); // Start loading
    try {
      const response = await fetch('/api/createChemical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Chemical created successfully.');
        form.resetFields(); 

        onSuccess(); 
        // Optional: Reset form after success
        setIsModalVisible(false);
         // Close modal after success
      } else {
        const error = await response.json();
        message.error('Chemical creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error creating Chemical:', error);
      message.error('Error creating Chemical. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} >
      {/* Your form fields here */}
      <Row gutter={16}>
      <Col xs={24} md={8}>
    <Form.Item label="Washing Name" name="name" rules={[{ required: true, message: 'Please input your washing name!' }]}>
      <Input style={{ width: '100%' }}  />
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Full Name" name="full_name" rules={[{ required: true, message: 'Please input your full name!' }]}>
      <Input style={{ width: '100%' }} />
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Cost/KG" name="costPerKg" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="KG/Can" name="kgPerCan" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Cost/Unit Of Usage" name="costPerUnit" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Cost/UOM" name="costUom" >
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
</Row>

<Row gutter={16}>
 
  <Col xs={24} md={8}>
    <Form.Item label="Type & Use" name="typeAndUse">
    <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Unit Used" name="unitUsed">
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Unit Conversion" name="unitConversion" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
</Row>



      <Button
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
        loading={loading} // Loader when submitting
        disabled={loading} // Disable button while loading
        style={{ backgroundColor: '#797FE7', color: '#ffffff', borderRadius: '100px' }}
        className="mt-10 px-4 py-2 rounded-sm hover:bg-blue-600 rounded-2xl"
      >
        Submit
      </Button>
    </Form>
  );
};

export default ChemicalForm;
