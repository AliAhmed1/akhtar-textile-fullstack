// UploadData.tsx
import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

interface UploadDataProps {
  setTableData: (data: any) => void;
  setChemicalOptions: (options: string[]) => void;
  setIsModalOpen: (open: boolean) => void;
  form: any;
  setRecipe1: (recipe: any) => void;
}

const UploadData: React.FC<UploadDataProps> = ({ setTableData, setChemicalOptions, setIsModalOpen, form, setRecipe1 }) => {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await axios.post('https://huge-godiva-arsalan-3b36a0a1.koyeb.app/uploadfile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("ABC")
      console.log('Upload Response:', response);
      const recipe = response.data.recipes[0];
      console.log(recipe.recipe_no);
      setRecipe1(recipe);
 
      const recipesDataForTable = () => {
        let data: any[] = [];
        recipe.step.forEach((step:any,index:number)=>{
          const baseData = {
            key: index,
            step: step.step_no,
            action: step.action,
            minutes: step.minutes,
            liters: step.litres,
            rpm: step.rpm,
            centigrade: step.temperature,
        };
          if(step.chemicals.length > 0) {
            step.chemicals.forEach((chemical:any) => {
              data.push({
                ...baseData,
                chemicalName:chemical.recipe_name,
              percentage: chemical.percentage,
              dosage: chemical.dosage,
              });
            })
          } else {
             data.push({
              ...baseData,
              chemicalName:step.chemical,
              percentage: step.chemical,
              dosage: step.chemical,
             });
            }
            
          })
        return data

      }


      console.log(recipesDataForTable);
      setTableData(recipesDataForTable);
      form.setFieldsValue({
        fileName: recipe.file_name,
        loadSize: recipe.load_size,
        machineType: recipe.machine_type,
        finish: recipe.finish,
        recipe: recipe.recipe_no,
        fabric: recipe.fabric,
        fno: recipe.Fno,
      });
      setChemicalOptions(recipe.step || []);
      message.success('File uploaded successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Error uploading file');
    }
  };

  return (
    
    <Upload
      beforeUpload={handleUpload}
      accept=".xlsx, .xls"
      multiple={false}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default UploadData;
