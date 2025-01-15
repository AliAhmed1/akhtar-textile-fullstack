"use client";
import { Button, message } from "antd";
import React, { useEffect } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import axios from "axios";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";
interface RunRecipeProps {
    tableData: any[];
    form: any;
    logData?: any;
    userId?: string;
}
const RunRecipe: React.FC<RunRecipeProps> = ({ tableData, form, logData, userId }) => {
    const router = useRouter();
    const [isExecuted, setIsExecuted] = React.useState(false);  
    useEffect(() => {
        console.log("check",logData);
        console.log("userId",userId);
        if(logData?.status === "executed" || null){
            setIsExecuted(true);
        }else {
            setIsExecuted(false);
        }
    },[logData]);
    const runRecipe = async () => {
        console.log('check',form.getFieldValue("id"));
        const data = {
            recipeFno: form.getFieldValue("fno"),
            status: "executed",
            userid: userId
        };
        const recipeChemicals = tableData.filter((step:any) => step.dosage!== undefined && step.dosage > 0);
        console.log(recipeChemicals);
        try{
            console.log(data);
            await axios.post('/api/createRecipeLog/', {data, recipeChemicals} ,{
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            router.refresh();
            message.success('Recipe executed successfully');
        } catch(e){
            message.error("recipe was not executed");
        }
    };

    const revertRecipe = async () => {
        console.log("check",logData.id);
        try{
            console.log("check>>>>>");
            const recipeChemicals = tableData.filter((step:any) => step.dosage!== undefined && step.dosage > 0);
        const response = await axios.put(`/api/revertRecipeLog/`,recipeChemicals,{
            params:{
                id: logData.id
            }
        });
        router.refresh();
        message.success(response.data.message);
    } catch(e){
        message.error("recipe was not reverted");
    }
    }

    return (
        form.getFieldValue("id") && <div style={{ display: 'flex', gap: '1rem', alignContent: 'center' }}>
        <Button onClick={runRecipe} style={{ backgroundColor: '#797FE7', color: 'white', borderRadius: '100px'}} disabled={isExecuted}>execute<ArrowRightOutlined /></Button>
        <Button onClick={revertRecipe} style={{ backgroundColor: '#d32e2e', color: 'white', borderRadius: '100px'}} disabled={!isExecuted}>Cancel</Button>
        </div>
    );
};

export default RunRecipe;