// SaveData.tsx
import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

interface SaveDataProps {
  form: any;
  tableData: any[];
  recipe1: any;
}

const SaveData: React.FC<SaveDataProps> = ({ form, tableData, recipe1 }) => {
  const saveRecipe = async () => {

    try {

      const values = form.getFieldsValue();
      const recipeData = {
        fileName: recipe1.file_name,
        steps: tableData.map((step) => {
          const chemicals = step.chemicalName.map((name: string, index: number) => ({
            recipe_name: name,
            percentage: step.percentage[index],
            dosage: step.dosage[index],
          }));

          return {
            step_no: step.step,
            action: step.action,
            minutes: step.minutes,
            litres: step.liters,
            rpm: step.rpm,
            chemicals: chemicals,
            temperature: step.centigrade,
          };
        }),
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
