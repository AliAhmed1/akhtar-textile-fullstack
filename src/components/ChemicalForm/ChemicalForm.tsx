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
        body: JSON.stringify([[values]]),
      });
console.log('response',response);
      if (response.ok) {
        message.success('Cheical created successfully.');
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
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
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
    <Form.Item label="Cost/KG" name="cost_per_kg" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="KG/Can" name="kg_per_can" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Cost/Unit Of Usage" name="cost_per_unit" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Cost/UOM" name="cost_uom" initialValue={''}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
</Row>

<Row gutter={16}>
 
  <Col xs={24} md={8}>
    <Form.Item label="Type & Use" name="type_and_use" initialValue={''}>
    <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Unit Used" name="unit_used" initialValue={''}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Unit Conversion" name="unit_conversion" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
</Row>

<Row gutter={16}>
<Col xs={24} md={8}>
    <Form.Item label="Free" name="free" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="On Order" name="on_order" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Total" name="total" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Requirement" name="requirement" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Order" name="order" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Boxes" name="boxes" initialValue={0}>
      <Input style={{ width: '100%' }}/>
    </Form.Item>
  </Col>
  <Col xs={24} md={8}>
    <Form.Item label="Cost" name="cost" initialValue={0}>
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
