'use client'

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input , Spin, Form, Pagination } from 'antd';
import EmployeeForm from '@/components/EmployeeForm/EmployeeForm';
import { LoadingOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form'; // Import FormInstance
import { useRouter } from 'next/navigation';
import SetupUtilityPanel from '../SetupUtilityPanel/SetupUtilityPanel';

interface User {
  id: string;                       // Unique identifier
  created_at: string;              // Timestamp for when the user was created
  username: string;                 // Username of the user
  password: string;
  code: string;                    // Hashed password
  name: string;                     // Full name of the user
  department: string | null;        // Department of the user (nullable)
  designation: string | null;       // Designation of the user (nullable)
  cnic: string | null;              // CNIC number (nullable)
  manager: string | null;           // Manager's name or ID (nullable)
  bank: string | null;              // Bank information (nullable)
  phone: string | null;             // Phone number (nullable)
  account: string | null;           // Account information (nullable)
  createdBy: string | null;         // User ID of the creator (nullable)
  updatedBy: string | null;         // User ID of the last updater (nullable)
  accesslevels: string[];           // Access levels of the user
}

interface EmployeeFormProps {
userData : User[]
}

const Employees:React.FC<EmployeeFormProps> = ({userData}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [originalEmployeeList, setOriginalEmployeeList] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  // const [formRef, setFormRef] = useState<FormInstance | null>(null); 
  const [form] = Form.useForm();
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;
  const [isAdminSelected, setIsAdminSelected] = useState<boolean>(false);
  const router = useRouter();

  const keys = ["name","code","username","cnic"];
  const search = (data:any) => {
    return data.filter((item:any)=>{
     return keys.some(key=>item[key]?.toLowerCase().includes(query.toLowerCase()));
    })
  }
  const totalItems = search(userData).length;

  useEffect(()=>{
    const filteredData = search(userData);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    setUsers(paginatedData);

  },[query, originalEmployeeList, currentPage, pageSize]);
  
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {

    // if (formRef) {
      form.resetFields();

    // }
    setIsModalVisible(false);
    setIsAdminSelected(false); // Reset the isAdminSelected state


  };

  const handleEdit = (user: User) => {
    console.log("user",user)
     form.setFieldsValue({
      id: user.id,
      name: user.name,
      username: user.username,
      password: user.password,
      code: user.code,
      department: user.department,
      designation: user.designation,
      cnic: user.cnic,
      manager: user.manager,
      bank: user.bank,
      phone: user.phone,
      account: user.account,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      accesslevels: user.accesslevels.map((level: any) => level.accesslevels),
    });
    console.log("form",form.getFieldValue('id'))
    setIsModalVisible(true);

  };

    // Function to handle the form submission success
    const handleFormSuccess = () => {
      router.refresh();
        // fetchUsers(); // Refresh the user list
        setIsModalVisible(false); // Close the modal
      };
      if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin indicator={pageLoadingSpinner} /></div>;
console.log("userData",userData)
  return (
    <div>
      <div className="flex items-center justify-between">
        <h5 className="mt-0 mb-2 text-gray-800 font-medium text-lg">Employees</h5>
        <div className="flex items-center space-x-4">
        <SetupUtilityPanel
          placeholder='Search Names'
          setQuery={(value) => setQuery(value)}
          showModal={showModal}
          buttonText="Create"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-8">
  <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-lg">
    <thead className="bg-[#FAFAFA] border border-gray-200 text-gray-600">
      <tr>
        <th className="w-1/12 px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
          Code
        </th>
        <th className="w-1/4 px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
          Basic Info
        </th>
        <th className="w-1/4 px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
          Employee Info
        </th>
        <th className="w-1/4 px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
          Bank Info
        </th>
        <th className="w-1/6 px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
          History
        </th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-200">
      {users.map((user: User ) => (

        <tr key={user.id} className="hover:bg-purple-50 transition duration-200" onClick={() => handleEdit(user)} >
          <td className="px-6 py-4 whitespace-nowrap text-[#797FE7] font-medium">{user.code}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="font-semibold">Name:</span> <span className='text-[#797FE7] font-medium'>{user.name}</span>
            <br />
            {`CNIC: ${user.cnic ? user.cnic : '-'}`}<br />
            {`Department: ${user.department ? user.department : '-'}`}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {`Designation: ${user.designation ? user.designation : '-'}`}<br />
            {`Phone: ${user.phone ? user.phone : '-'}`}<br />
            {`Manager: ${user.manager ? user.manager : '-'}`}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {`Bank Name: ${user.bank ? user.bank : '-'}`}<br />
            {`Account#: ${user.account ? user.account : '-'}`}<br />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="font-semibold">Creator:</span> <span className=' text-[#797FE7] font-medium'>{user.createdBy}</span>
            <br />
            <span className="font-semibold">Modifier:</span> <span className='text-gray-500 font-medium'>{user.updatedBy == null ? '( )' : user.updatedBy}</span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
{/* Pagination */}
<div className="mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
          // showSizeChanger
          // pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        cancelText="Cancel"
        footer={null}
        width={1000}
      >
        <h1 className="text-xl font-bold mb-4">Employee Form</h1>
        <hr className="mb-2" />

        <EmployeeForm onSuccess={handleFormSuccess}
         setIsModalVisible={setIsModalVisible}
         form={form} 
         setIsAdminSelected={setIsAdminSelected}
         isAdminSelected={isAdminSelected}
         />
      </Modal>
    </div>
  );
};

export default Employees;
