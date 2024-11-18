"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Row, Col, Button, message } from 'antd';

const { Option } = Select;

interface EmployeeFormProps {
  setIsModalVisible: (visible: boolean) => void;
  onSuccess: () => void;
  setFormRef: (form: any) => void;
  setIsAdminSelected: (value: boolean) => void; 
  isAdminSelected: boolean;

}

// const validationSchema = yup.object().shape({
//   name: yup.string().required('Name is required'),
//   username: yup.string().required('Username is required'),
//   password: yup.string().required('Password is required'),
//   code: yup.string().required('Employee Code is required'),
//   phone: yup
//   .string()
//   .length(11, 'Phone # must be exactly 11 digits')
//   .matches(/^\d{11}$/, 'Phone # must be exactly 11 digits'),
//   cnic: yup
//   .string()
//   .length(13, 'CNIC must be exactly 13 digits')
//   .matches(/^\d{13}$/, 'CNIC must be a 13-digit number'),
//   accesslevels: yup.array().length(1, 'Please select at least one access level').required('Access levels are required'),
//    // Ensures it only contains digits

// });

const EmployeeForm: React.FC<EmployeeFormProps> = ({ setIsModalVisible,onSuccess,setFormRef,setIsAdminSelected, isAdminSelected  }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // Loader state

  const [selectedAccessLevels, setSelectedAccessLevels] = useState<string[]>([]);
  // const [isAdminSelected, setIsAdminSelected] = useState<boolean>(false);

  useEffect(() => {
    setFormRef(form);

  }, [form, setFormRef]);
  
  const onFinish = async (values: any) => {
    setLoading(true); // Start loading
    try {
      // await validationSchema.validate(values, { abortEarly: false });

      const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Employee created successfully.');
        form.resetFields(); 
        setSelectedAccessLevels([]);
      
        onSuccess(); 
        // Optional: Reset form after success
        setIsModalVisible(false);
        setIsAdminSelected(false);
         // Close modal after success
      } else {
        const error = await response.json();
        message.error('Employee creation failed. Please try again.');
      }
    } catch (error:any) {
      if (error.inner) {
        error.inner.forEach((err: any) => {
          form.setFields([{ name: err.path, errors: [err.message] }]);

        });
      }else{

      message.error('Error creating employee. Please try again.');
    }  

 
    } finally {
      setLoading(false); // Stop loading
    }
  };
  // const handleInputChange = (name: string) => {
  //   // Clear validation errors for the input field
  //   form.setFields([{ name, errors: [] }]);
  // };
const validateAccessLevels = (rule: any, value: string) => {
  console.log("value",value, 'rule',rule)
  if(value && value.length >= 1){
    return Promise.resolve();
  }
  return Promise.reject('Please select at least one access level');
}
  const handleAccessLevelChange = (value: string[]) => {
console.log("value",value)

    const isAdminSelected = value.includes("Admin");
    setIsAdminSelected(isAdminSelected);
  
    // If Admin is selected, only allow "Admin" and clear others
    setSelectedAccessLevels(isAdminSelected ? ["Admin"] : value);
  };

  const handleValidationClear = (name: string, length: number, value: string) => {
    if (value.length === length) {
      form.setFields([{ name, errors: [] }]);
    }
  };


  return (
    <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
      {/* Your form fields here */}
      <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
              <Input style={{ width: '100%' }} 
              //  onChange={() => handleInputChange('name')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Department" name="department">
              <Select placeholder="Select Department" style={{ width: '100%' }}>
                <Option defaultValue=""> </Option>
                <Option value="Accounts">Accounts</Option>
                <Option value="Operations">Operations</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="User Name" name="username" rules={[{ required: true, message: 'Username is required' }]}>
              <Input style={{ width: '100%' }} 
         
                // onChange={() => handleInputChange('username')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="CNIC" name="cnic"  rules={[
      { required: true, message: 'CNIC is required' },
      { len: 13, message: 'CNIC must be exactly 13 digits' },
      { pattern: /^\d{13}$/, message: 'CNIC must be a 13-digit number' },
    ]}>
              <Input style={{ width: '100%' }} 
              maxLength={13} 
              // onChange={(e) => handleValidationClear('cnic', 13, e.target.value)}

              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Designation" name="designation">
              <Select placeholder="Select Designation" style={{ width: '100%' }}>
                <Option defaultValue=""> </Option>
                <Option value="Manager">Manager</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Password" name="password" rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' },
              { max: 12, message: 'Password must not exceed 12 characters' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
            ]}>
              <Input.Password type="password" style={{ width: '100%' }}
              autoComplete="new-password"
              //  onChange={() => handleInputChange('password')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Employee Code" name="code" initialValue={""}>
              <Input style={{ width: '100%' }}
              // onChange={() => handleInputChange('code')}

              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Manager" name="manager">
              <Select placeholder="Select Manager" style={{ width: '100%' }}>
              <Option defaultValue=""> </Option>
                <Option value="Saad">Saad</Option>
                <Option value="Farrukh">Farrukh</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Bank" name="bank" initialValue={""}>
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Phone #" name="phone" initialValue={""}>
              <Input style={{ width: '100%' }}
                maxLength={11} 
                onChange={(e) => handleValidationClear('phone', 11, e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Provide Access" name="accesslevels" hasFeedback={true} rules={[
              { required: true, message: 'Provide Access is required'},
              {validator: validateAccessLevels}
            ]}>
            <Select 
              style={{ width: "100%" }}
              placeholder="Provide Access"
              mode="multiple"
              onChange={handleAccessLevelChange}
              >
                <Option value="Admin">Admin</Option>
                <Option value="Dashboard"  disabled={isAdminSelected} >Dashboard</Option>
                <Option value="Recipe"  disabled={isAdminSelected}>Recipe</Option>
                <Option value="Employees" disabled={isAdminSelected}>Employees</Option>
                <Option value="Chemicals" disabled={isAdminSelected}>Chemicals</Option>
                <Option value="P&L" disabled={isAdminSelected}>P&L</Option>
                <Option value="Damco Data"  disabled={isAdminSelected}>Damco Data</Option>
                <Option value="Nexus Data"  disabled={isAdminSelected}>Nexus Data</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Account #" name="account" initialValue={""}>
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      <Button
        type="primary"
        htmlType="submit"
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

export default EmployeeForm;
