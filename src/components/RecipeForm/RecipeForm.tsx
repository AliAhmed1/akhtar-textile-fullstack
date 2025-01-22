// src/components/RecipeForm/RecipeForm.tsx
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
  recipeData?: any;
}

const RecipeForm: React.FC<Props> = ({ userId, logData, action, recipeData}) => {
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
    key: number;
    step_no: number;
    action: string;
    minutes: number;
    liters: number;
    rpm: number;
    chemicalName: string;
    percentage: number;
    dosage: number;
    centigrade: number;
    chemicalId?: string;
    chemicalAssociatedId?: string;
  }

 
  const onDelete = (record: StepData) => {
    const updatedData = tableData.filter((item) => item.key !== record.key).map((item,index) => ({...item,key:index}));
    setTableData(updatedData);
  }

    const onSearch = (value: string,item: StepData) => {
      if(value)
      item.action = value;
      const updatedData = [...tableData];
      setTableData(updatedData);
      
    };
  const handleActionChange = (record: StepData, value: string ) => {
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
    if(value)
    item.rpm = value;
    const updatedData = [...tableData];
  setTableData(updatedData);
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
    if(value)
    record.step_no = value;
  const updatedData = [...tableData];
  setTableData(updatedData);
  }
const handleChemicalChange = (record: StepData, value: string) => {
  const update = chemicalOptions.filter((option) => value.includes(option.name));
  record.chemicalName = value;
  update.length > 0? record.chemicalId = update[0].id:record.chemicalId = "";
  const updatedData = [...tableData];
  setTableData(updatedData);
}
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const addStep = () => {
    const newStep: StepData = {
      key: tableData.length,
      step_no: 0,
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
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chemicals:", error);
      setLoading(false);
    }
  };

    const fetchRecipe = async (id?: string) => {
      setLoading(true);
      try {
        // const response = await fetch(`/api/getRecipeDetails/${id}`);
        // const data = await response.json();
        // console.log('data',data);
        const data = recipeData;
          setRecipe1(data);

          form.setFieldsValue({
            id: data?.id,
            load_size: data.load_size,
            machine_type: data.machine_type,
            finish: data.finish,
            recipe: data.recipe,
            fabric: data.fabric,
            fno: data.fno,
          });

      
          const recipesDataForTable = () => {
            let tableData: any[] = [];
            let counter = 0;

            data.steps.forEach((step:any)=>{
          
              const baseData = {
                key: counter,
                step_no: step.step_no,
                action: step.action,
                minutes: step.minutes,
                liters: Number(step.liters),
                rpm: Number(step.rpm),
                centigrade: Number(step.centigrade),
                id: step.id,
            };

              if(step.chemicals.length > 0) {
                step.chemicals.forEach((chemical:any) => {
 
                  baseData.key = counter;
                  tableData.push({
                    ...baseData,
                    chemicalAssociationId:chemical.id,
                    chemicalName:chemical.chemical_name,
                  percentage: chemical.percentage,
                  dosage: chemical.dosage,
                  chemicalId: chemical.chemical_id,
                  });
                  counter++;
                });
              } else {

                 tableData.push({
                  ...baseData,
                  chemicalName:step.chemical,
                  percentage: step.chemical,
                  dosage: step.chemical,
                 });
                 counter++;
                }
                
              })
 
            return tableData;
    
          }
          setTableData(recipesDataForTable);
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
        
        // console.log("recipe fetched");
        fetchChemicals(); // Fetch chemicals when recipe loads
        setActionOptions(action);
      }
    }

  }, [pathname, form]);
useEffect(() => {
  if(recipeData){
  fetchRecipe();
  }
  fetchChemicals();

},[])

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
        <div className="flex md:gap-[70%] lg:gap-[77%] xl:gap-[82%]" >
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
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px]">Step</th>
              <th className="md:min-w-[50px] lg:min-w-[250px] xl:min-w-[290px] py-[10px] px-[20px]">Action</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[20px]">Minutes</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[20px]">Liters</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[20px]">RPM</th>
              <th className="md:min-w-[50px] lg:min-w-[250px] xl:min-w-[290px] py-[10px] px-[25px]">Chemical Name</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[25px]">%</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[20px]">Dosage</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[20px]">Centigrade</th>
              <th className="md:min-w-[50px] lg:min-w-[100px] xl:min-w-[130px] py-[10px] px-[20px]">Options</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item:StepData, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center"}}><InputNumber style={{ width: "50px" , textAlign: "center"}} value={item.step_no} onChange={(value) => handleStepChange(item, value,index)} /></td>
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
          chemicalOptions={chemicalOptions}
        />
      </Modal>
    </div>
  );
};

export default RecipeForm;
