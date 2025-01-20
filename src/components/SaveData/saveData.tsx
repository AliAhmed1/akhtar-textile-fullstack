// SaveData.tsx
"use client";
import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import recipe from '@/app/(auth)/recipe/page';

interface SaveDataProps {
  form: any;
  tableData: any[];
  recipe1: any;
}

const SaveData: React.FC<SaveDataProps> = ({ form, tableData, recipe1 }) => {
  const saveRecipe = async () => {
    console.log('check');
    try {
      console.log('Recipe', recipe1);
      const values = form.getFieldsValue();
      values.name = recipe1.file_name;
      console.log(values);
      console.log(tableData);
      const newTableData = tableData.map((item: any) => {
        let { key, ...rest } = item;
        return { ...rest ,
        step_id : key
      };
      });
      // await Promise.all(newTableData);
      console.log('newTableData',newTableData);
      const stepsObj = [];
      const recipeData = {
        ...values,
        steps: newTableData
        // steps: tableData.map((step, index) => {
        //   if(step.step === tableData[index+1].step){

        //     stepsObj.push({
        //       step_no: step.step,
        //     action: step.action,
        //     minutes: step.minutes,
        //     litres: step.liters,
        //     rpm: step.rpm,
        //     // chemicals: chemicals,
        //     temperature: step.centigrade
        //     });
        //   }
        // })
      };

      console.log('Recipe Data to be sent:', recipeData);

      await axios.post('/api/saveRecipe/', recipeData, {
        headers: { 'Content-Type': 'application/json' },
      });

      message.success('Recipe saved successfully');
    } catch (error) {
      console.error('Error saving recipe:', error);
      message.error('Error saving recipe');
    }
  };

  return (
    <Button style={{ backgroundColor: '#797FE7', color: 'white', borderRadius: '100px'}}
     onClick={saveRecipe}>Save Recipe</Button>
  );
};

export default SaveData;
