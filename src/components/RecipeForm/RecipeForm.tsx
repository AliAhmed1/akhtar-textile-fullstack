// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table, Spin } from 'antd';
// import { ColumnsType } from 'antd/es/table';
// import UploadData from '@/components/UploadData/uploadData'; 
// import SaveData from '@/components/SaveData/saveData';
// import { usePathname } from 'next/navigation';
// import {LoadingOutlined } from '@ant-design/icons';

// const { Option } = Select;

// const RecipeForm: React.FC = () => {
//   const pathname = usePathname();
//   const [chemicalOptions, setChemicalOptions] = useState<string[]>([]);
//   const [tableData, setTableData] = useState<StepData[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [form] = Form.useForm();
//   const [recipe1, setRecipe1] = useState<any>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const tableRef = useRef<any>(null);
//   const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;

//   interface StepData {
//     key: number;
//     step: number;
//     action: string;
//     minutes: number;
//     liters: number;
//     rpm: number;
//     chemicalName: string[];
//     percentage: number[];
//     dosage: number[];
//     centigrade: number;
//   }

//   const columns: ColumnsType<StepData> = [
//     {
//       title: 'Step',
//       dataIndex: 'step',
//       key: 'step',
//     },
//     {
//       title: 'Action',
//       dataIndex: 'action',
//       key: 'action',
//     },
//     {
//       title: 'Minutes',
//       dataIndex: 'minutes',
//       key: 'minutes',
//     },
//     {
//       title: 'Liters',
//       dataIndex: 'liters',
//       key: 'liters',
//     },
//     {
//       title: 'RPM',
//       dataIndex: 'rpm',
//       key: 'rpm',
//     },
//     {
//       title: 'Chemical Name',
//       dataIndex: 'chemicalName',
//       key: 'chemicalName',
//       render: (text, record) => (
//         <Select defaultValue={text} style={{ width: 200 }} mode="multiple">
//           {chemicalOptions.map(option => (
//             <Option key={option} value={option}>{option}</Option>
//           ))}
//         </Select>
//       ),
//     },
//     {
//       title: '%',
//       dataIndex: 'percentage',
//       key: 'percentage',
//       render: (text) => (
//         <InputNumber
//           min={0}
//           max={100}
//           defaultValue={text}
//           style={{ width: '100%' }}
//         />
//       ),
//     },
//     {
//       title: 'Dosage',
//       dataIndex: 'dosage',
//       key: 'dosage',
//       render: (text) => (
//         <InputNumber
//           min={0}
//           defaultValue={text}
//           style={{ width: 60 }}
//         />
//       ),
//     },
//     {
//       title: 'Centigrade',
//       dataIndex: 'centigrade',
//       key: 'centigrade',
//       render: (text) => (
//         <InputNumber
//           min={0}
//           defaultValue={text}
//           style={{ width: 60 }}
//         />
//       ),
//     },
//   ];

//   const showModal = () => {
//     setIsModalOpen(true);
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//   };

//   const addStep = () => {
//     const newStep: StepData = {
//       key: tableData.length + 1,
//       step: 0,
//       action: '',
//       minutes: 0,
//       liters: 0,
//       rpm: 0,
//       chemicalName: [''],
//       percentage: [0],
//       dosage: [0],
//       centigrade: 0,
//     };
//     setTableData([...tableData, newStep]);
//   };

//   useEffect(() => {
//     const fetchRecipe = async (id: string) => {
//       setLoading(true);
//       try {
//         const response = await fetch(`/api/getRecipeDetails/${id}`);
//         const data = await response.json();

//         console.log('Fetched Data:', data.steps);

//         if (response.ok) {
//           setRecipe1(data);

//           form.setFieldsValue({
//             loadSize: data.load_size,
//             machineType: data.machine_type,
//             finish: data.finish,
//             recipe: data.recipe,
//             fabric: data.fabric,
//             fno: data.fno,
//           });


//           const recipesDataForTable = data.steps.map((step: any, index: number) => ({
//             key: index,
//             step: step.step_no, 
//             action: step.action,
//             minutes: step.minutes, 
//             centigrade: step.centigrade,
//             liters: step.liters,
//             rpm: step.rpm,
//             chemicalName: step.chemicals.map((chemical: any) => chemical.chemical_name),
//             percentage: step.chemicals.map((chemical: any) => chemical.percentage),
//             dosage: step.chemicals.map((chemical: any) => chemical.dosage),
//           }));
//           setTableData(recipesDataForTable)

//         } else {
//           setError(data.message || 'Error fetching recipe');
//         }
//       } catch (err) {
//         console.error('Error:', err);
//         setError('Error fetching recipe');
//       } finally {
//         setLoading(false);
//       }
//     };


//     const id = pathname?.split('/').pop();
//     if (id) {
//       fetchRecipe(id);
//     }
//   }, [pathname, form]);



//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
//           <Spin indicator={pageLoadingSpinner} />
//       </div>
//     );
//   }  

//   return (
//     <div>
//       <Row style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Col>
//           <h1 style={{ color: '#343C6A', fontSize: "20px", fontWeight: "bold" }}>Recipe Form</h1>
//         </Col>
//         <Col>
//           <Button type="primary" style={{ backgroundColor: '#797FE7' }} onClick={showModal}>Upload Excel</Button>
//         </Col>
//       </Row>
//       <br />
//       <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', margin: "auto" }}>
//         <Form form={form} layout="vertical">
//           <Row gutter={16}>
//             <Col xs={24} md={12}>
//               <Form.Item label="Load Size" name="loadSize">
//                 <InputNumber style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//             <Col xs={24} md={12}>
//               <Form.Item label="Machine Type" name="machineType">
//                 <Select placeholder="Select machine type" style={{ width: '100%' }}>
//                   <Option value="UP SYSTEM">UP SYSTEM</Option>
//                   <Option value="type2">Type 2</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16}>
//             <Col xs={24} md={12}>
//               <Form.Item label="Finish" name="finish">
//                 <Input style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//             <Col xs={24} md={12}>
//               <Form.Item label="Recipe" name="recipe">
//                 <InputNumber style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16}>
//             <Col xs={24} md={12}>
//               <Form.Item label="Fabric" name="fabric">
//                 <Input style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//             <Col xs={24} md={12}>
//               <Form.Item label="FNO" name="fno">
//                 <InputNumber style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//           </Row>
//         </Form>
//         <br />
//         <SaveData form={form} tableData={tableData} recipe1={recipe1} />
//       </div>
//       <br />
//       <div style={{ backgroundColor: '#f5f5f5' }}>
//         <Row style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Col>
//             <h1 style={{ color: '#343C6A', fontSize: '20px', fontWeight: 'bold' }}>Recipe Steps</h1>
//           </Col>
//           <Col>
//             <Button type="primary" style={{ backgroundColor: '#797FE7' }} onClick={addStep}>Add Step</Button>
//           </Col>
//         </Row>
//         <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px' }}>
//           <Table
//             ref={tableRef}
//             columns={columns}
//             dataSource={tableData}
//             pagination={false}
//             bordered
//             style={{ width: '100%' }}
//           />
//         </div>
//       </div>
//       <Modal title="Upload Excel" open={isModalOpen} onCancel={handleCancel} footer={null}>
//         <UploadData
//           setTableData={setTableData}
//           setChemicalOptions={setChemicalOptions}
//           setIsModalOpen={setIsModalOpen}
//           form={form}
//           setRecipe1={setRecipe1}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default RecipeForm;


"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col, Button, Table, Spin, Space, message } from "antd";
import { ColumnsType } from "antd/es/table";
import UploadData from "@/components/UploadData/uploadData";
import SaveData from "@/components/SaveData/saveData";
import { usePathname } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";
import useCheckFetchOnce from "@/utils/useCheckFetchOnce";
import RunRecipe from "../RunRecipe/RunRecipe";
import { on } from "events";

const { Option } = Select;
interface Props {
  userId?: string;
  logData?: any;
  action?: any;
}

const RecipeForm: React.FC<Props> = ({ userId, logData, action}) => {
  const pathname = usePathname();
  const [chemicalOptions, setChemicalOptions] = useState<Chemical[]>([]);
  const [actionOptions, setActionOptions] = useState<any[]>([]);
  const [originalChemicalList, setOriginalChemicalList] = useState<string[]>([]);
  const [tableData, setTableData] = useState<StepData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [recipe1, setRecipe1] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<any>(null);
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: "#800080" }} spin />;
  const checkFetchOnce = useCheckFetchOnce();

  
interface Chemical {
  id: string;
  name: string;
}
  interface StepData {
    key: string;
    step: number;
    action: string;
    minutes: number;
    liters: number;
    rpm: number;
    chemicalName: string;
    percentage: number;
    dosage: number;
    centigrade: number;
    chemicalId?: string;
  }

  // const columns: ColumnsType<StepData> = [
  //   {
  //     title: "Step",
  //     dataIndex: "step",
  //     key: "step",
  //     render: (text,record) => <InputNumber min={0} max={100} defaultValue={text} style={{ width: "70%" }} onChange={(text) => handleStepChange(record,text)}/>,
  //   },
  //   {
  //     title: "Action",
  //     dataIndex: "action",
  //     key: "action",
  //     render: (text, record) => <Input defaultValue={text}  onChange={(e) => handleActionChange(record, e.target.value)}/>,
  //   },
  //   {
  //     title: "Minutes",
  //     dataIndex: "minutes",
  //     key: "minutes",
  //     render: (text, record) => <InputNumber min={0} max={100} defaultValue={text} style={{ width: "70%" }} onChange={(value) => handleMinutesChange(record, value)}/>,
  //   },
  //   {
  //     title: "Liters",
  //     dataIndex: "liters",
  //     key: "liters",
  //     render: (text, record) => <InputNumber min={0} max={100} defaultValue={text} style={{ width: "85%" }} onChange={(value) => handleLitersChange(record, value)}/>,
  //   },
  //   {
  //     title: "RPM",
  //     dataIndex: "rpm",
  //     key: "rpm",
  //     render: (text, record) => <InputNumber min={0} max={100} defaultValue={text} style={{ width: "65%" }} onChange={(value) => handleRpmChange(record, value)}/>,
  //   },
  //   {
  //     title: "Chemical Name",
  //     dataIndex: "chemicalName",
  //     key: "chemicalName",
  //     render: (text, record) => (
  //       <Select defaultValue={text} style={{ width: 200 }}  onChange={(value) => handleChemicalChange(record, value)}>
  //         {chemicalOptions.map((option) => (
  //           <Option key={option.name} value={option.name}>
  //             {option.name}
  //           </Option>
  //         ))}
  //       </Select>
  //     ),
  //   },
  //   {
  //     title: "%",
  //     dataIndex: "percentage",
  //     key: "percentage",
  //     render: (text, record) => <InputNumber min={0} max={100} defaultValue={text} style={{ width: "100%" }} onChange={(value) => handlePercentageChange(record, value)}/>,
  //   },
  //   {
  //     title: "Dosage",
  //     dataIndex: "dosage",
  //     key: "dosage",
  //     render: (text, record) => <InputNumber min={0} defaultValue={text} style={{ width: 60 }} onChange={(value) => handleDosageChange(record, value)}/>,
  //   },
  //   {
  //     title: "Centigrade",
  //     dataIndex: "centigrade",
  //     key: "centigrade",
  //     render: (text, record) => <InputNumber min={0} defaultValue={text} style={{ width: 50 }} onChange={(value) => handleCentigradeChange(record, value)} />,
  //   },
  //   {
  //     title: "Action",
  //     key: "action",
  //     render: (_, record) => (
  //       <Space size="middle">
  //         <a onClick={() => onDelete(record)}>Delete</a>
  //         </Space>
  //     ),
  //   },
  // ];

  const onDelete = (record: StepData) => {
    console.log("record>>>>>",record);
    const updatedData = tableData.filter((item) => item.key !== record.key).map((item,index) => ({...item,key:index.toString()}));
    console.log("updatedData>>>>",updatedData)
// const updatedData
    // tableData.splice(record.key, 1);
    // console.log("updatedData>>>>",tableData)
    // const updatedData = tableData;
    // updatedData.forEach((item, index) => (item.key = index));
    setTableData(updatedData);
    console.log("updatedData2>>>>",tableData)  }

    const onSearch = (value: string,item: StepData) => {
      if(value)
      item.action = value;
      const updatedData = [...tableData];
      setTableData(updatedData);
      
    };
  const handleActionChange = (record: StepData, value: string ) => {
    // const update = actionOptions.filter((option) => value.includes(option.name));
    console.log("update>>>",value);
    record.action = value;
    const updatedData = [...tableData];
    setTableData(updatedData);
  }
  const handleMinutesChange = (record: StepData, value: number | null) => {
    if(value)
    record.minutes = value;
    const updatedData = [...tableData];
  setTableData(updatedData);
  }
  const handleLitersChange = (record: StepData, value: number | null) => {
    if(value)
       record.liters = value;
    const updatedData = [...tableData];
    setTableData(updatedData);
  }
  const handleRpmChange = (item: StepData, value: number | null) => {
    console.log("fgdfd",value)
    if(value)
    item.rpm = value;
    const updatedData = [...tableData];
  setTableData(updatedData);
    // console.log("fgdfd>>",item.rpm);
    // record.rpm = value
  }
  const handlePercentageChange = (record: StepData, value: number | null) => {
    if(value)
    record.percentage = value;
    const updatedData = [...tableData];
  setTableData(updatedData);
  }
  const handleCentigradeChange = (record: StepData, value: number | null) => {
    if(value)
    record.centigrade = value;
    const updatedData = [...tableData];
  setTableData(updatedData);
  }
  const handleDosageChange = (record: StepData, value: number | null) => {
    if(value)
    record.dosage = value;
    const updatedData = [...tableData];
  setTableData(updatedData);
  }
  const handleStepChange = ( record: StepData,value: number | null, index:number) => {
    console.log("record>>>>>Before",record,value)
    console.log(index);
    if(value)
    record.step = value;
  const updatedData = [...tableData];
  setTableData(updatedData);
    
    console.log("record>>>>>After",tableData)
  }
const handleChemicalChange = (record: StepData, value: string) => {
  const update = chemicalOptions.filter((option) => value.includes(option.name));
  console.log("update>>>>>",update)
  console.log("record>>>>>Before",record)
  record.chemicalName = value;
  update.length > 0? record.chemicalId = update[0].id:record.chemicalId = "";
  console.log("record>>>>>After",record)
}
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const addStep = () => {
    const newStep: StepData = {
      key: String(tableData.length + 1),
      step: 0,
      action: "",
      minutes: 0,
      liters: 0,
      rpm: 0,
      chemicalName: "",
      percentage: 0,
      dosage: 0,
      centigrade: 0,
      chemicalId: "",
    };
    setTableData([...tableData, newStep]);
    message.success("Step added successfully!");
  };

  // Fetch chemicals from API
  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getAllChemicals");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setChemicalOptions(data.chemicals);
      
      // setOriginalChemicalList(data.chemicals); // Store original chemical list
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chemicals:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
console.log(">>>>>>>>>>>>",tableData);
console.log("action", action);
// fetchChemicals();
  },[tableData])
  // useEffect(() => {
    const fetchRecipe = async (id: string) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/getRecipeDetails/${id}`);
        const data = await response.json();
        console.log('data',data);
        if (response.ok) {
          setRecipe1(data);

          form.setFieldsValue({
            id: data.id,
            load_size: data.load_size,
            machine_type: data.machine_type,
            finish: data.finish,
            recipe: data.recipe,
            fabric: data.fabric,
            fno: data.fno,
          });

          // const recipesDataForTable = data.steps.map((step: any, index: number) => ({
          //   key: index,
          //   step: step.step_no,
          //   action: step.action,
          //   minutes: step.minutes,
          //   centigrade: step.centigrade,
          //   liters: step.liters,
          //   rpm: step.rpm,
          //   chemicalName: step.chemicals.map((chemical: any) => chemical.chemical_name),
          //   percentage: step.chemicals.map((chemical: any) => chemical.percentage),
          //   dosage: step.chemicals.map((chemical: any) => chemical.dosage),
          // }));
          const recipesDataForTable = () => {
            let tableData: any[] = [];
            data.steps.forEach((step:any,index:number)=>{
              // console.log('step',step);
              const baseData = {
                key: index.toString(),
                step: step.step_no,
                action: step.action,
                minutes: step.minutes,
                liters: step.liters,
                rpm: step.rpm,
                centigrade: step.centigrade,
                stepId: step.id,
            };

              if(step.chemicals.length > 0) {
                step.chemicals.forEach((chemical:any) => {
                  tableData.push({
                    ...baseData,
                    chemicalName:chemical.chemical_name,
                  percentage: chemical.percentage,
                  dosage: chemical.dosage,
                  chemicalId: chemical.chemical_id,
                  });
                });
              } else {
                 tableData.push({
                  ...baseData,
                  chemicalName:step.chemical,
                  percentage: step.chemical,
                  dosage: step.chemical,
                 });
                }
                
              })
              // console.log('tableData',tableData);
            return tableData;
    
          }
         
          
          setTableData(recipesDataForTable);
        } else {
          setError(data.message || "Error fetching recipe");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Error fetching recipe");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const id = pathname?.split("/").pop();
    if (checkFetchOnce()) {
      if (id && id !== "upload-recipe") {
        fetchRecipe(id);
        console.log("recipe fetched");
        fetchChemicals(); // Fetch chemicals when recipe loads
        setActionOptions(action);
      }
    }

  }, [pathname, form]);
useEffect(() => {
  fetchChemicals();
  console.log("fetchChemicals");
},[])
  // useEffect(() => {
  //   console.log("form:", form.getFieldValue("id"));
  //   console.log("userId:", userId)
  //   console.log("logData:", logData)
  //   console.log("tableData:", tableData);
  //   console.log("data>>>>", chemicalOptions);
  //   fetchChemicals();
  // }, [tableData]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin indicator={pageLoadingSpinner} />
      </div>
    );
  }
  return (
    <div>
      <Row style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Col>
          <h1 style={{ color: "#343C6A", fontSize: "20px", fontWeight: "bold" }}>Recipe Form</h1>
        </Col>
        <Col>
          <Button type="primary" style={{ backgroundColor: "#797FE7" }} onClick={showModal}>
            Upload Excel
          </Button>
        </Col>
      </Row>
      <br />
      <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "15px", margin: "auto" }}>
        <Form form={form} layout="vertical">
        <Form.Item name="id" hidden>
    <Input />
  </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Load Size" name="load_size">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Machine Type" name="machine_type">
                <Select placeholder="Select machine type" style={{ width: "100%" }}>
                  <Option value="UP SYSTEM">UP SYSTEM</Option>
                  <Option value="type2">Type 2</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Finish" name="finish">
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Recipe" name="recipe">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Fabric" name="fabric">
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="FNO" name="fno">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <br />
        <div style={{ display: "flex", gap: "70%"}}>
        <SaveData form={form} tableData={tableData} recipe1={recipe1} />
        <RunRecipe tableData={tableData} form={form} logData={logData} userId={userId}/>
        </div>
      </div>
      <br />
      <div style={{ backgroundColor: "#f5f5f5" }}>
        <Row style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Col>
            <h1 style={{ color: "#343C6A", fontSize: "20px", fontWeight: "bold" }}>Steps</h1>
          </Col>
          <Col>
            <Button type="primary" style={{ backgroundColor: "#797FE7" }} onClick={addStep}>
              Add Step
            </Button>
          </Col>
        </Row>
        {/* <Table ref={tableRef} columns={columns} dataSource={tableData} pagination={false} style={{overflowX: 'auto'}}/> */}
        <div style={{ padding: "0 20px 20px 20px", backgroundColor: "white", borderRadius: "15px", overflowX: "auto" }}>
        <table>
          <thead>
            <tr style={{textAlign: "center", borderRadius: "15px", backgroundColor: "#f9f9f9" }}>
              <th style={{ minWidth: "50px" , padding: "10px 0 10px 0"}}>Step</th>
              <th style={{ minWidth: "50px", padding: "10px 20px 10px 20px" }}>Action</th>
              <th style={{ minWidth: "50px", padding: "10px 20px 10px 20px" }}>Minutes</th>
              <th style={{ minWidth: "50px", padding: "10px 20px 10px 20px" }}>Liters</th>
              <th style={{ minWidth: "50px", padding: "10px 20px 10px 20px" }}>RPM</th>
              <th style={{ minWidth: "50px", padding: "10px 25px 10px 25px" }}>Chemical Name</th>
              <th style={{ minWidth: "50px", padding: "10px 25px 10px 25px" }}>%</th>
              <th style={{ minWidth: "50px", padding: "10px 20px 10px 20px" }}>Dosage</th>
              <th style={{ minWidth: "50px", padding: "10px 20px 10px 20px" }}>Centigrade</th>
              <th style={{ minWidth: "50px", padding: "10px 0 10px 20px" }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item:StepData, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.step} onChange={(value) => handleStepChange(item, value,index)} /></td>
                <td style={{ textAlign: "center"}}><Select showSearch  filterOption={true} style={{ width: "100%" }} value={item.action} onChange={(e) => handleActionChange(item, e)} options={action} onSearch={(value) => onSearch(value,item)}/></td>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.minutes} onChange={(value) => handleMinutesChange(item, value)} /></td>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.liters} onChange={(value) => handleLitersChange(item, value)} /></td>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}}  value={item.rpm} onChange={(value) => handleRpmChange(item, value)} /></td>
                <td style={{ textAlign: "center"}}><Select showSearch style={{ width: "100%",border: "none" }} value={item.chemicalName} onChange={(value) => handleChemicalChange(item, value)} >
                {chemicalOptions.map((option) => (
                <Option key={option.name} value={option.name}>
                {option.name}
                </Option>
          ))}</Select></td> 
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.percentage} onChange={(value) => handlePercentageChange(item, value)} /></td>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.dosage} onChange={(value) => handleDosageChange(item, value)} /></td>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.centigrade} onChange={(value) => handleCentigradeChange(item, value)} /></td>
                <td style={{ textAlign: "center"}}><a onClick={() => onDelete(item)}>Delete</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <Modal title="Upload Excel" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <UploadData
          setTableData={setTableData}
          setIsModalOpen={setIsModalOpen}
          form={form}
          setRecipe1={setRecipe1}
          logData={logData}
        />
      </Modal>
    </div>
  );
};

export default RecipeForm;
