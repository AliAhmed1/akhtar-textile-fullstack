// SaveData.tsx
"use client";
import React from 'react';
import { Button, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import recipe from '@/app/(auth)/recipe/page';
import { set } from 'lodash';

interface SaveDataProps {
  form: any;
  tableData: any[];
  recipe1: any;
}

const SaveData: React.FC<SaveDataProps> = ({ form, tableData, recipe1 }) => {
  const [loading, setLoading] = React.useState(false);
  const saveRecipe = async () => {
    console.log('check');
    try {
      setLoading(true);
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
      console.log('newTableData',newTableData);
      const stepsObj = [];
      const recipeData = {
        ...values,
        steps: newTableData
      };

      console.log('Recipe Data to be sent:', recipeData);

      const response = await axios.post('/api/saveRecipe/', recipeData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      message.success(response.data.message);
    } catch (error) {
      console.error('Error saving recipe:', error);
      message.error('Error saving recipe');
    }
  };

  return (
    <Button style={{ backgroundColor: '#797FE7', color: 'white', borderRadius: '100px'}} disabled={loading}
     onClick={saveRecipe}>Save Recipe    {loading && <Spin indicator={<LoadingOutlined style={{color: 'white'}} spin />} size="small" />}</Button>
  );
};

export default SaveData;
