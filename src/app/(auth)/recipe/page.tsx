'use client';

import { use, useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, Button, message, Upload, Modal, Input, Pagination, Popconfirm, Tabs, Table, Radio } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import { UploadOutlined, LoadingOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import TabPane from 'antd/es/tabs/TabPane';
import { RcFile } from 'antd/es/upload';
import { response } from 'express';
import {formatDate} from '@/utils/formatDate'
import { UploadFile, UploadProps } from 'antd/lib';
import { headers } from 'next/headers';

const { Title, Text } = Typography;

interface Recipe {
  id: number;
  recipe_name: string;
  created_at: string;
  [key: string]: any;
}

interface FileData {
  id: string; // or number, based on your data
  name: string;
  // Add any other properties that you expect in the response
}


const Recipes = () => {
  // console.log("abc")
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const [modalType, setModalType] = useState('success'); // 'success' or 'failed'
  const [showPageElements, setShowPageElements] = useState(true); // State to control visibility
const [position, setPosition] = useState<'success'| 'failed'>('success');
const [isLoading,setIsLoading]=useState<boolean>(true);
  // State for success and failure uploads
  // const [successUploads, setSuccessUploads] = useState<string[]>([]);
  let [getRecipeCounter, setGetRecipeCounter] = useState<number>(0);
  let [postRecipeCounter, setPostRecipeCounter] = useState<number>(0);
// let [sucessful,setSuccessful]=useState<string[]>([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(18); // Adjust page size here

  const exportSpinner = <LoadingOutlined style={{ fontSize: 18, color: '#ffffff' }} spin />;
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;

  useEffect(() => {
    fetchRecipes();
  }, []);
  useEffect(() => {

  }, [isLoading]);

  const fetchRecipes = async () => {
    !loading && setLoading(true)
    try {
      const response = await fetch('/api/getRecipe', { cache: 'no-store' });
      if (!response.ok) throw new Error('Network response was not ok');
      const data: Recipe[] = await response.json();
      setRecipes(data);
    } catch (error) {
      setError('Failed to fetch recipes');
      console.error('Failed to fetch recipes:', error);
    } finally {
      getRecipeCounter > 0 ? setGetRecipeCounter(0):null;
      postRecipeCounter > 0 ? setPostRecipeCounter(0):null;
      setLoading(false);
    }
  };

  const handleRemove = ((file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    return true;
  })

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/deleteRecipe/${id}`);
      message.success('Recipe deleted successfully');
      fetchRecipes();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      message.error('Failed to delete recipe');
    }
  };
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // *************************************************************
  const handleFile: UploadProps['onChange'] = (info) => {
    const { file, fileList: currentFileList } = info;

    // Update the file list, and track status for progress/feedback
    setFileList([...currentFileList]);

    // // if (file.status === 'uploading') {
    //   setIsLoading(true);
    // // }
    const isAnyFileUploading = currentFileList.some((file) => file.status === 'uploading');

    // Set the loading state based on whether any file is still uploading
    setIsLoading(isAnyFileUploading);
    // if (file.status === 'done') {
    //   setIsLoading(false);
    // }
    //   message.success(`${file.name} uploaded successfully`);
    // } else if (file.status === 'error') {
    //   setIsLoading(false);
    //   message.error(`${file.name} upload failed.`);
    // }
  };

  // const beforeUpload = (file: UploadFile) => {
  //   // File size validation (optional)
  //   const isExcel = file.type === 'application/vnd.ms-excel' || 
  //                   file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  //   if (!isExcel) {
  //     message.error('You can only upload Excel files!');
  //     return Upload.LIST_IGNORE;
  //   }

  //   // Optionally validate file size, limit to 10MB for example

  //   return true; // Proceed with the upload
  // };
  // ******************************************************************
  const handleExport = async () => {
    if (!startDate || !endDate) {
      message.error('Please select both start and end dates');
      return;
    } else if (startDate > endDate) {
      message.error('Start date is less than end date');
      return;
    }
    setIsExporting(true);

    try {
      const responseResult = await axios.get('/api/getExportRecipe', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'json',
      });
      const data = responseResult.data.files;
      console.log(data);
      const response = await axios.post('/api/exportRecipes', {data},
        {headers:{'Content-Type': 'application/json'},
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'recipes.xlsx');
      document.body.appendChild(link);
      link.click();
      message.success('File Downloaded');
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export recipes:', error);
      message.error('Failed to export recipes');
    } finally {
      setIsExporting(false);
    }
  };

  interface dataType {
    srNo: number;
    title: string;
    created_at: Date; 
  };
  const [dataSource, setDataSource]= useState<dataType[]>([]);
  
  const columns = [
    {
      title: 'Sr. No.',
      dataIndex: 'srNo',
      key: 'srNo',
    },
    {
      title: 'FileName',
      dataIndex: 'title',
      key: 'title',  
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  // const dataA = []


  const handleFailedFiles = async () => {

    try{
      const response = await axios.get('/api/getFailedFiles/');
      const data = response.data;

      let dataSet:any[] = []
      data.files.forEach((file:any,index:number)=>{
        // console.log(file)
        let data = {
          srNo: index+1,
          title: file.title,
          created_at: formatDate(file.created_at)
        }
        // console.log(data)
        dataSet.push(data);
        
      })
      setDataSource(dataSet)
      console.log(dataSource)
// console.log(result);
      // // reponse.data.map((x)=>failedFiles.created_at=x.created_at)
      // console.log(failedFiles);
    } catch (error){
      message.error("Failed to fetch failed files");
    }
  }


  // useEffect(() => {
  //   handleFailedFiles();
  // }, []);


  // const handleUpload = async (files: File[]) => {
  
  //   const formData = new FormData();
  //   files.forEach(file => formData.append('files', file)); // Add files to formData
  
  //   try {
  //     setUploading(true);
  
  //     const uploadResponse = await axios.post('https://huge-godiva-arsalan-3b36a0a1.koyeb.app/uploadfile', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  
  //     const fileDataArray = uploadResponse.data.recipes;
  
  //     const successNames: string[] = [];
  //     const failedNames: string[] = [];
  
  //     // Handle saving of each file
  //     await Promise.all(fileDataArray.map(async (fileData: FileData, index: number) => {
  //       try {
  //         await axios.post('/api/saveBulkRecipes/', fileData, {
  //           headers: { 'Content-Type': 'application/json' },
  //         });
  //         successNames.push(files[index].name);
  //       } catch (error) {
  //         failedNames.push(files[index].name);
  //       }
  //     }));
  
  //     // Update success and failure states
  //     setSuccessUploads(prev => [...prev, ...successNames]);
  //     setFailedUploads(prev => [...prev, ...failedNames]);
  
  //     message.success(`Recipes were saved successfully: ${successNames.join(', ')}`);
  //     setIsModalOpen(false);
  //     fetchRecipes();
  //   } catch (error) {
  //     console.error('Error uploading or saving files:', error);
  //     message.error('Error uploading or saving files');
  //   } finally {
  //     setUploading(false);
  //   }

  let saveBulkRecipes = async (fileDataArray:any, BatchSize:number, successNames:string[][], duplicates:string[][]) => {

    
      
      // Step 2: Batch save recipes 
        try {

         
          const reponse = await axios.post('/api/saveBulkRecipes/', {fileDataArray,BatchSize},  {
            headers: { 'Content-Type': 'application/json' },
          });
          // console.log(reponse)
          setIsModalOpen(false);
          // Collect successful file names for this batch
          reponse.data.message.duplicates?reponse.data.message.duplicates.forEach((duplicate:any) => duplicates.push(duplicate)):null;
          reponse.data.message.successful?reponse.data.message.successful.forEach((success:any) => successNames.push(success)):null;
          
        return reponse;
        } catch (error) {
          console.error('Error uploading or saving files:', error);

        }finally {
          // Show page elements after processing is done
          setShowPageElements(true);
          
        }

  }

  let saveFailedUploads = async (fileDataArray:any) => {

    try {
      const reponse = await axios.post('/api/saveFailedUploads/', fileDataArray, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.error(reponse.data.message);
    } catch (error) {
      console.error('Error uploading or saving files:', error);
    }
  }




 const handleUpload = async (files: UploadFile[]) => {
  let successNames: string[][] = [];
  let duplicates: string[][] = [];
    const BATCH_SIZE = 35;
    let postRecipeCounter = 0;
  
    const failedNames: string[] = [];
  
    // Helper function to process a batch of files
    const processBatch = async (batch: UploadFile[]) => {
      const formData = new FormData();
      
      batch.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });
  
      setUploading(true);
      setShowPageElements(false); // Hide elements while uploading
  
      try {
        // Step 1: Upload files
        const uploadResponse = await axios.post('https://huge-godiva-arsalan-3b36a0a1.koyeb.app/uploadfile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        console.log("Upload Response", uploadResponse.data);
  
        // Handle failed files
        if (uploadResponse.data.failed_files?.length > 0) {
          failedNames.push(...uploadResponse.data.failed_files);
          saveFailedUploads(failedNames); // Save failed uploads
          
        }
  
        // Handle successful recipes
        if (uploadResponse.data.recipes) {
          await saveBulkRecipes(uploadResponse.data.recipes,BATCH_SIZE,successNames,duplicates);
        }
        postRecipeCounter++;
      } catch (error) {
        console.error("Error uploading batch:", error);
      } finally {
        setUploading(false);
        setShowPageElements(true); // Show elements after uploading
      }
    };
  
    // Process files in batches of 40
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE); // Get a batch of 40 files
      await processBatch(batch); // Wait for batch to process
      console.log(`Processed batch: ${Math.ceil((i + 1) / BATCH_SIZE)}`);
    }
    // console.log(duplicates);
          duplicates.length>0?message.error(`${duplicates.length} files are duplicate`):null
          successNames.length>0?message.success(`${successNames.length} files are successfully uploaded`):null
          // successNames = [];
          // duplicates = [];  
          // console.log(duplicates);
  fetchRecipes();
    // After all batches are processed
    setFileList([]);
  };
  

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false)
    setFileList([]);};

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecipes = filteredRecipes.slice(startIndex, startIndex + pageSize);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin indicator={pageLoadingSpinner} /></div>;
  if (error) return <Title level={4} style={{ textAlign: 'center', padding: '2rem' }}>Error: {error}</Title>;

  const groupedRecipes: { [key: string]: Recipe[] } = paginatedRecipes.reduce((acc, recipe) => {
    const date = new Date(recipe.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(recipe);
    return acc;
  }, {} as { [key: string]: Recipe[] });
  const handleDeleteAll = async () => {
    try {
      await axios.delete('/api/deleteAllRecipes');
      message.success('All recipes deleted successfully');
      fetchRecipes();
    } catch (error) {
      console.error('Failed to delete all recipes:', error);
      message.error('Failed to delete all recipes');
    }
  };
  
  return (

    <>
      {!showPageElements && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin indicator={pageLoadingSpinner} /></div>} {/* Optional loading spinner */}
      {showPageElements && (
        <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Title level={1} style={{ margin: 0}}>Recipes</Title>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Radio.Group value={position} onChange={(e) => setPosition(e.target.value)}>
            <div style={{display: 'flex'}}>
          <Radio.Button value="success" >success</Radio.Button>
          <Radio.Button onClick={handleFailedFiles} value="failed" >failed</Radio.Button>
          </div>
        </Radio.Group>
        {/* <>{console.log(position)}</> */}
            <Input
              placeholder="Search by recipe name"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className= "flex gap-2 md:absolute md:left-[70.5%] md:top-[10%] md:mb-4 lg:absolute lg:left-[76.5%] lg:top-[10.5%] xl:static xl:mb-0" >
              <label style={{color: '#797FE7'}}>From: </label>
            <input style={{textAlign: 'center'}} type="date" onChange={(e) => setStartDate(e.target.value)} />
            <label style={{color: '#797FE7'}}>To: </label>
            <input style={{textAlign: 'center'}} type="date" onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button type="primary" onClick={handleExport} disabled={uploading} style={{ backgroundColor: '#797FE7', borderColor: '#797FE7' }}>
              {isExporting ? <Spin indicator={exportSpinner} /> : 'Export'}
            </Button>
            <Button type="default" onClick={showModal} disabled={uploading} style={{ borderColor: '#797FE7' }}>
              <UploadOutlined /> Upload
            </Button>
            <Popconfirm
              title="Are you sure you want to delete all recipes?"
              onConfirm={handleDeleteAll}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" danger>
                Delete All
              </Button>
            </Popconfirm>
            
          </div>
        </div>
        <Modal title="Upload File" visible={isModalOpen} onCancel={handleCancel} footer={null}>
            <>
            <Button type="primary" className='mr-3' onClick={()=>{handleUpload(fileList)}} disabled={isLoading} >{isLoading ? 'Uploading...' : 'Start Upload'}</Button>
            <Upload  defaultFileList={fileList}  onChange={handleFile} onRemove={handleRemove}  accept=".xlsx, .xls" multiple>
              <Button className='mr-3' icon={<UploadOutlined />} >Click to Upload</Button>
              <>{fileList.length} files selected</>
            </Upload>
            </>
         </Modal>
       <> {position === 'success' ?(<>
        {Object.keys(groupedRecipes).length === 0 ? (
          <Empty description="No recipes found" />
        ) : (
          <div>
            {Object.keys(groupedRecipes).map(date => (
              <div key={date}>
                <Text style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{date}</Text>
                <Row gutter={16}>
                  {groupedRecipes[date].map((recipe: Recipe) => (
                    <Col span={8} key={recipe.id}>
                      <Card hoverable style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Link href={`/recipesDetails/${recipe.id}`}>
                            <div style={{ display: 'flex', alignItems: 'center', color:'black', fontWeight:'500' }}>
                              <img src="/img/excel.png" alt="Excel Logo" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                              {recipe.name}
                            </div>
                          </Link>
                          <Popconfirm
                            title="Are you sure to delete this recipe?"
                            onConfirm={() => handleDelete(recipe.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <DeleteOutlined style={{ color: '#797FE7', cursor: 'pointer' }} />
                          </Popconfirm>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}

            {/* Pagination Component */}
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredRecipes.length}
              onChange={handlePaginationChange}
              showSizeChanger
              pageSizeOptions={['15', '25', '35']}
              style={{ marginTop: '2rem', textAlign: 'center' }}
            />

            

          </div>

        )}
       </>):position === 'failed'?(
        
        <>
        {/* {console.log(dataSource)} */}
        <Table columns={columns} dataSource={dataSource} />
       </>
      ):null}</>
        
        </div>
      )}
    </>
    
  );
};

export default Recipes;
