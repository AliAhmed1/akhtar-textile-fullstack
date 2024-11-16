
'use client';
import React, { useState, useEffect, use, useRef } from 'react';
import { Modal, Button, Input, Spin, Pagination, Form, message } from 'antd';
import ChemicalForm from '@/components/ChemicalForm/ChemicalForm';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { set } from 'lodash';
import { on } from 'events';
import { fi } from 'date-fns/locale';
import SetupUtilityPanel from '../SetupUtilityPanel/SetupUtilityPanel';

interface Chemical {
  id: string | null | undefined;
  name: string;
  full_name: string | null;
  cost_per_kg: number | null;
  kg_per_can: number | null;
  cost_per_unit: number | null;
  cost_uom: string | null;
  type_and_use: string | null;
  unit_used: string | null;
  unit_conversion: number | null;
}

interface ChemicalFormProps {
  chemicalData: Chemical[];
  
}

const Chemicals: React.FC<ChemicalFormProps> = ({ chemicalData }) => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [modalFlag, setModalFlag] = useState<1 | 2>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;
  const [form] = Form.useForm();
  const keys = ["name"];
  const [modalWidth, setModalWidth] = useState<number>();
  const [notUploaded, setNotUploaded] = useState(true);
  const [fileList, setFileList] = useState<any[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  // Search function
  const search = (data: Chemical[]) => {
    return data.filter((item) =>
      keys.some((key) => item[key as keyof Chemical]?.toString().toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Update chemicals based on search and pagination
  useEffect(() => {
    const filteredData = search(chemicalData);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    setChemicals(paginatedData);
  }, [query, chemicalData, currentPage, pageSize]);

  const showModal = (flag: 1 | 2) => {
    flag=== 1 && setModalWidth(1000)  
    flag=== 2 && setModalWidth(660)
    setModalFlag(flag);
    setIsModalVisible(true);
  };

  const HandleEdit = (chemical: Chemical) => {
    console.log("chemical",chemical)
    form.setFieldsValue({
      id: chemical.id,
         name: chemical.name,
      full_name: chemical.full_name,
      costPerKg: chemical.cost_per_kg,
      kgPerCan: chemical.kg_per_can,
      costPerUnit: chemical.cost_per_unit,
      costUom: chemical.cost_uom,
      typeAndUse: chemical.type_and_use,
      unitUsed: chemical.unit_used,
      unitConversion: chemical.unit_conversion
    });
    console.log("form",form)
    showModal(1);
  }

  const handleFileUplaod = (fileList:any) => {
    setFileList(fileList);
    setNotUploaded(false);
    // console.log("fileList",fileList);
  }

  const handleImport = async () => {

    console.log("fileList",fileList);
    const formData = new FormData();
    for(const file of fileList) {
      console.log("file",file);
      formData.append('files', file);
    };

    try{
      const response = await axios.post('http://127.0.0.1:8001/upload-chemicals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
console.log(response.data.error);
if(response.data.status === "200") {
  
}
      const chemicalsUploaded = await axios.post('/api/createChemical', [response.data.chemicals], { headers: { 'Content-Type': 'application/json' }})

      message.success('Chemicals added successfully');
      handleFormSuccess();
    } catch(err) {
      message.error('Error uploading files');
    } finally {
      setIsModalVisible(false);
      fileInput.current?.files?.length ? fileInput.current.value = "": null;
    }

  }
  const handleCancel = () => {
    setIsModalVisible(false);
    
  };

  const handleFormSuccess = () => {
    router.refresh();
    setIsModalVisible(false);
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);

  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin indicator={pageLoadingSpinner} />
      </div>
    );
  }

  const totalItems = search(chemicalData).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h5 className="mt-0 mb-2 text-gray-800 font-medium text-lg">Chemicals</h5>
        <div className="flex items-center space-x-4">
          <SetupUtilityPanel
          placeholder='Search Chemicals'
          setQuery={handleSearchChange}
          showModal={()=> showModal(1)}
          buttonText="Create"
          />

          <Button 
           icon={<DownloadOutlined />}
           onClick={() => showModal(2)}
           style={{ border: '1px solid #797FE7', backgroundColor: '#ffffff' }}
           >
            Import
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-lg">
          <thead className="bg-[#FAFAFA] border border-gray-200 text-gray-600">
            <tr>
              <th className="w-1/9 px-4 text-left text-xs text-black">Washing Name</th>
              <th className="w-1/9 text-left text-xs text-black">Full Name</th>
              <th className="w-1/9 text-left text-xs text-black">Cost/KG</th>
              <th className="w-1/9 py-3 text-left text-xs text-black">KG/Can</th>
              <th className="w-1/9 py-3 text-left text-xs text-black">Cost/Unit Of Usage</th>
              <th className="w-1/9 py-3 text-left text-xs text-black">Cost/UOM</th>
              <th className="w-1/9 py-3 text-left text-xs text-black">Type & Use</th>
              <th className="w-1/9 py-3 text-left text-xs text-black">Unit Used</th>
              <th className="w-1/9 py-3 text-left text-xs text-black">Unit Conversion</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chemicals.map((chemical: Chemical, index: number) => (
              <tr key={chemical.id || index} className="hover:bg-purple-50 transition duration-200" onClick={() => HandleEdit(chemical)}>
                <td className="px-6 py-4"><span className='text-[#797FE7]'>{chemical.name}</span></td>
                <td className="px-3 py-4"><span className='text-[#797FE7]'>{chemical.full_name}</span></td>
                <td className="px-3 py-4 text-center"><span className='text-[#797FE7]'>{chemical.cost_per_kg}</span></td>
                <td className="px-3 py-4 text-center"><span className='text-[#797FE7]'>{chemical.kg_per_can}</span></td>
                <td className="px-3 py-4 text-center"><span className='text-[#797FE7]'>{chemical.cost_per_unit}</span></td>
                <td className="px-3 py-4 text-center"><span className='text-[#797FE7]'>{chemical.cost_uom}</span></td>
                <td className="px-3 py-4"><span className='text-[#797FE7]'>{chemical.type_and_use}</span></td>
                <td className="px-3 py-4 text-center"><span className='text-[#797FE7]'>{chemical.unit_used}</span></td>
                <td className="px-3 py-4 text-center"><span className='text-[#797FE7]'>{chemical.unit_conversion}</span></td>
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
          showSizeChanger
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        cancelText="Cancel"
        footer={null}
        width={modalWidth}
      >{modalFlag === 1 ?(<>
        <h1 className="text-xl font-bold mb-4">Chemical Form</h1>
        <hr className="mb-2" />
        <ChemicalForm onSuccess={handleFormSuccess} setIsModalVisible={setIsModalVisible} form={form}/>
        </>)
      :( modalFlag === 2 && <>
        <h1 className="text-xl font-bold mb-4">Import Chemicals</h1>
        <hr className="mb-2" />
        <Button type='primary' disabled={notUploaded} onClick={handleImport}>Import Chemicals</Button>
        <input style={{ width: '26rem', border: 'none', marginLeft: '0.5rem' }} type="file" name="file" ref={fileInput} onChange={(e) => handleFileUplaod(e.target.files) } multiple/>
        </>
      )}
      </Modal>
    </div>
  );
};

export default Chemicals;
