'use client'

import React, { useState, useReducer, useEffect } from 'react';
import { Modal, Button, Input } from 'antd';
import { Col, Row } from "antd";
import EmployeeForm from '@/components/EmployeeForm/EmployeeForm';

function recordsReducer(state: any, action: any) {
    switch (action.type) {
        case 'toggle': { return { ...state, [action.fieldName]: action.payload } }
        case 'create': {
            return {
                ...state,
                create: true,
                visible: true,
            }
        }
        case 'edit': {
            return {
                ...state,
                edit: true,
                visible: true,
            }
        }
        case 'modalOff': {
            return {
                ...state,
                visible: false,
                create: false,
                edit: false
            }
        }
        default: return state
    }
}

const initialState = {
    records: [],
    load: true,
    visible: false,
    create: false,
    edit: false,


};

// interface Users {

//   }

const employees = () => {

    const [state, dispatch] = useReducer(recordsReducer, initialState);
    const { records, visible } = state;
    const [users, setUsers] = useState<any>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/getAllUsers');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();


                setUsers(data.users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };


    return (
        <div>
            <div className="flex items-center justify-between">
                <h5 className="mt-0 mb-2 text-gray-800 font-medium text-lg">Employees</h5>
                <div className="flex items-center space-x-4">
                    <Input
                        placeholder="Enter Name"
                        className="border border-gray-300 rounded-sm px-3 py-2 text-gray-800 text-sm transition-all duration-300 hover:border-blue-500 hover:border-r rounded-2xl"
                    />
                    <Button
                        type="primary"
                        onClick={showModal}
                        style={{ backgroundColor: '#797FE7',  borderRadius: '100px'}}
                        className="px-4 py-2"
                    >
                        Create
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="mt-8 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                    <thead className="bg-gray-50 border border-gray-200 text-gray-500">
                        <tr>
                            <th className="w-1/12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Basic Info
                            </th>
                            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee Info
                            </th>
                            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bank Info
                            </th>
                            <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                History
                            </th>
                        </tr>
                    </thead>


                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: any) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {`Name: ${user.name}`}<br />
                                    {`CNIC: ${user.cnic}`}<br />
                                    {`Department: ${user.department}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {`Designation: ${user.designation}`}<br />
                                    {`Phone: ${user.phone}`}<br />
                                    {`Manager: ${user.manager}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {`Bank Name: ${user.bank}`}<br />
                                    {`Account#: ${user.account}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">Active</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal
                open={isModalVisible}
                onCancel={handleCancel}
                cancelText="Cancel"
                footer={null}
                width={1000}

            >
                {/* Add your form fields here */}
                <h1 className="text-xl font-bold mb-4">Employee Form</h1>
                <hr className='mb-2' />

                <EmployeeForm />


            </Modal>
        </div>

    )
}


export default employees

