"use client";
import { ChangeEvent, use, useCallback, useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, Button, message, Upload, Modal, Input, Pagination, Popconfirm, Tabs, Table, Radio } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import { UploadOutlined, LoadingOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import TabPane from 'antd/es/tabs/TabPane';
import { RcFile } from 'antd/es/upload';
import { response } from 'express';
import { formatDate } from '@/utils/formatDate'
import { UploadFile, UploadProps } from 'antd/lib';
import { headers } from 'next/headers';
import useCheckFetchOnce from '@/utils/useCheckFetchOnce';
import UtilityPanel from '@/components/UtilityPanel/UtilityPanel';
import ExcelJS from 'exceljs';
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
  const [position, setPosition] = useState<'success' | 'failed'>('success');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  let [getRecipeCounter, setGetRecipeCounter] = useState<number>(0);
  let [postRecipeCounter, setPostRecipeCounter] = useState<number>(0);
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
const [NumberOfUploads, setNumberOfUploads] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(18); // Adjust page size here
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pageLoadingSpinner = <LoadingOutlined style={{ fontSize: 48, color: '#800080' }} spin />;
  let uploadedFiles:number = 0;
  const checkFetchOnce = useCheckFetchOnce();

  useEffect(() => {
    if (checkFetchOnce()) {
      fetchRecipes();
    }
  }, []);
  useEffect(() => {

  }, [isLoading]);
  useEffect(() => {
    if (position === 'failed') {
      handleFailedFiles();
    }
  }, [position])
  useEffect(() => {
    
  },[NumberOfUploads])
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
      getRecipeCounter > 0 ? setGetRecipeCounter(0) : null;
      postRecipeCounter > 0 ? setPostRecipeCounter(0) : null;
      setLoading(false);
    }
  };


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
  const [fileList, setFileList] = useState<string[]>([]);

  
  const generateExcel = async (data: any) => {
    const bgcolourCondition = (recipeIndex: number,cell:any) => {
      if(recipeIndex % 2 === 1 ) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' }, bgColor: { argb: 'ffffff'} } 
        cell.border = { bottom: { style: 'thin', color: { argb: 'ffffff' } } ,
         top: { style: 'thin', color: { argb: 'ffffff' } } ,
         left: { style: 'thin', color: { argb: 'ffffff' } }, 
         right: { style: 'thin', color: { argb: 'ffffff' } }};
       } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'd7d7d7' }, bgColor: { argb: 'd7d7d7'} }
        cell.border = { bottom: { style: 'thin', color: { argb: 'd7d7d7' } } ,
        top: { style: 'thin', color: { argb: 'd7d7d7' } } ,
        left: { style: 'thin', color: { argb: 'd7d7d7' } }, 
        right: { style: 'thin', color: { argb: 'd7d7d7' } }};
       }
    }
    try {
      const { recipesResult, stepsResult, chemicalsResult, chemicalsAssocResult } = data;
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Recipes');

      // Define worksheet columns
      worksheet.columns = [
        { header: 'Recipe Number', key: 'recipe_number' },
        { header: 'FNO', key: 'fno' },
        { header: 'Fabric', key: 'fabric' },
        { header: 'Wash', key: 'wash' },
        { header: 'Active Flag', key: 'active_flag' },
        { header: 'Load Size', key: 'load_size' },
        { header: 'Step', key: 'step_no' },
        { header: 'Modified Action', key: 'modified_action' },
        { header: 'Modified Timing', key: 'modified_timing' },
        { header: 'Action', key: 'action' },
        { header: 'MINS', key: 'minutes' },
        { header: 'LTRs', key: 'liters' },
        { header: 'RPM', key: 'rpm' },
        { header: 'Chemical Name', key: 'chemical_name' },
        { header: 'Dosage %', key: 'dosage_percent' },
        { header: 'Dosage', key: 'dosage' },
        { header: 'Centigrade', key: 'centigrade' },
        { header: 'PH', key: 'ph' },
        { header: 'LR', key: 'lr' },
        { header: 'TDS', key: 'tds' },
        { header: 'TSS', key: 'tss' },
        { header: 'Pieces', key: 'pieces' },
        { header: 'Total Weight', key: 'total_weight' },
        { header: 'Lots', key: 'lots' },
        { header: 'Chem Need', key: 'chem_need' },
        { header: 'Chemical Cost', key: 'chemical_cost' },
        { header: 'Water Cost', key: 'water_cost' },
        { header: 'Heat Cost', key: 'heat_cost' },
        { header: 'Sort', key: 'sort' },
        { header: 'Concatenate', key: 'concatenate' },
      ];
  
      // Apply Header Formatting
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.eachCell((cell, colNumber) => {
        if (colNumber <= 6) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7030a0' } };
        } else if (colNumber <= 13) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } };
        } else if (colNumber <= 21) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e26b0a' } };
        } else if (colNumber <= 25) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7030a0' } };
        } else if (colNumber <= 28) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4f81bd' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '00b050' } };
        }
      });
  
      // Process Rows
      recipesResult.forEach((recipe: any, recipeIndex: number) => {
        const recipeSteps = stepsResult.filter((step: any) => step.recipesid === recipe.id);
        let firstStepRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
        recipeSteps.forEach((step: any) => {
          const stepChemicals = chemicalsAssocResult
            .filter((assoc: any) => assoc.stepid === step.id)
            .map((assoc: any) => {
              const chemical = chemicalsResult.find((chem: any) => chem.id === assoc.chemicalid);
              return {
                chemical_name: chemical ? chemical.name : 'Unknown',
                dosage_percent: assoc.percentage || 'Unknown',
                dosage: assoc.dosage || 'Unknown',
              };
            });
            let row :any ;
          stepChemicals.forEach((chemical: any) => {

            row = worksheet.addRow({
              recipe_number: recipe.recipe,
              fno: recipe.fno,
              fabric: recipe.fabric,
              wash: recipe.finish,
              active_flag: recipe.active_flag, 
              load_size: recipe.load_size,
              action: step.action,
              liters: step.liters,
              rpm: step.rpm,
              centigrade: step.centigrade,
              ph: step.ph,
              lr: step.lr,
              tds: step.tds,
              tss: step.tss,
              minutes: step.minutes,
              step_no: step.step_no,
              chemical_name: chemical.chemical_name,
              dosage: chemical.dosage,
              modified_action: step.modified_action
            });
            const dosage_percent = row.getCell(15).address
            const dosage = row.getCell(16).address
            worksheet.getCell(`${dosage_percent}`).value = { formula: `${dosage}/140000*100` };
            bgcolourCondition(recipeIndex,row);
            // Add alternating row background
            // const isEvenRow = row.number % 2 === 0;
            // row.eachCell((cell) => {
            //   cell.fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     fgColor: { argb: isEvenRow ? 'ffffff' : 'd7d7d7' },
            //   };
            // });
          });
          if (stepChemicals.length === 0) {
            row = worksheet.addRow({
             recipe_number: recipe.recipe,
             fno: recipe.fno,
             fabric: recipe.fabric,
             wash: recipe.finish,  
             active_flag: recipe.active_flag,     
             load_size: recipe.load_size,
             action: step.action,
             liters: step.liters,
             rpm: step.rpm,
             centigrade: step.centigrade,
             ph: step.ph,
             lr: step.lr,
             tds: step.tds,
             tss: step.tss,
             minutes: step.minutes,
             step_no: step.step_no,
             modified_action: step.modified_action
           });
           bgcolourCondition(recipeIndex,row);
         }
        });
        const lastRow = worksheet.lastRow;
        if (lastRow) {
          for (let col = 1; col <= worksheet.columns.length; col++) { 
            const cell = lastRow.getCell(col);
            cell.border = { bottom: { style: 'thick', color: { argb: '000000' } } }; 
          }
  
          const sectionEndColumns = [6, 13, 21, 25,28]; 
  
          sectionEndColumns.forEach(colNum => {
            for (let rowNum = firstStepRow; rowNum <= lastRow.number; rowNum++) {
              const row = worksheet.getRow(rowNum);
              const cell = row.getCell(colNum);
              cell.border = { right: { style: 'thick', color: { argb: '000000' } } }; 
            }
          });
        }
      });
  // console.log('LENGHT',worksheet.columns.length);
      // Auto-adjust column widths
      worksheet.columns.forEach((column) => {
        if (column && typeof column.eachCell === 'function') {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            // console.log(cell.value?.toString());
            const columnLength = cell.value ? cell.value.toString().length : 10;
            // console.log(columnLength,cell.value?.toString());
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength <= 10 ? 14 : maxLength+4;
          column.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
  
      // Generate the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
  
      // Create a Blob and trigger download
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'recipes.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      console.log('Excel file generated successfully');
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };

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
      console.log(data.recipesResult);
      await generateExcel(data)
      // const response = await axios.post('/api/exportRecipes', { data },
      //   {
      //     headers: { 'Content-Type': 'application/json' },
      //     responseType: 'blob',
      //   });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', 'recipes.xlsx');
      // document.body.appendChild(link);
      // link.click();
      // message.success('File Downloaded');
      // document.body.removeChild(link);
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
  const [dataSource, setDataSource] = useState<dataType[]>([]);

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
    console.log("handleFailedFiles")
    try {
      const response = await axios.get('/api/getFailedFiles/');
      const data = response.data;

      let dataSet: any[] = []
      data.files.forEach((file: any, index: number) => {
        // console.log(file)
        let data = {
          key: index,
          srNo: index + 1,
          title: file.title,
          created_at: formatDate(file.created_at)
        }
        // console.log(data)
        dataSet.push(data);

      })
      setDataSource(dataSet)
      console.log(dataSource)
    } catch (error) {
      message.error("Failed to fetch failed files");
    }
  }


  let saveBulkRecipes = async (fileDataArray: any, BatchSize: number, successNames: string[][], duplicates: string[][]) => {



    // Step 2: Batch save recipes 
    try {


      const reponse = await axios.post('/api/saveBulkRecipes/', { fileDataArray, BatchSize }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = reponse.data.files;

    //   console.log(data);
    //   if(data.successfulBatch.length > 0) {
    //   const message = await axios.post(`/api/checkActiveFlag/`, { data }, {
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }
      setIsModalOpen(false);
      // Collect successful file names for this batch
      reponse.data.message.duplicates ? reponse.data.message.duplicates.forEach((duplicate: any) => duplicates.push(duplicate)) : null;
      reponse.data.message.successful ? reponse.data.message.successful.forEach((success: any) => successNames.push(success)) : null;

      return reponse;
    } catch (error) {
      console.error('Error uploading or saving files:', error);

    }
  }
let checkActiveFlag = async (data: any) => {
  try {
    const response = await axios.put("/api/checkActiveFlag/", { data }, {
      headers: { "Content-Type": "application/json" },
    });
    
    console.log("Active Flag Check Response:", response.data);
    return response;
  } catch (error) {
    console.error("Error in Active Flag API call:", error);
  }

}
  let saveFailedUploads = async (fileDataArray: any) => {

    try {
      const reponse = await axios.post('/api/saveFailedUploads/', fileDataArray, {
        headers: { 'Content-Type': 'application/json' },
      });
      message.error(reponse.data.message);
    } catch (error) {
      console.error('Error uploading or saving files:', error);
    }
  }

const handleSubmit = (): FileList | null => {
  console.log("handleFiles");

  if (fileInputRef.current && fileInputRef.current.files) {
    handleUpload(fileInputRef.current.files, 25);
    return fileInputRef.current.files;
  }

  console.log("No files selected");
  return null;
};

  const handleUpload = async (files: FileList, BatchSize: number) => {
    let successNames: string[][] = [];
    let duplicates: string[][] = [];
    let postRecipeCounter = 0;
    let filesArray: any[] = [];

    for (let i = 0; i < files.length; i++) {
      filesArray.push(files[i]);
    }
// console.log('files',files)
    const failedNames: string[] = [];

    // Helper function to process a batch of files
    const processBatch = async (batch: any) => {
      const formData = new FormData();
for (let i = 0; i < batch.length; i++) {
  formData.append('files', batch[i]);
}

      setUploading(true);
      setShowPageElements(false); // Hide elements while uploading

      try {
        // Step 1: Upload files
        const uploadResponse = await axios.post('https://curious-fancy-hailtechnologies-e2fde36f.koyeb.app/uploadfile', formData, {
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
          let result = await saveBulkRecipes(uploadResponse.data.recipes, BatchSize, successNames, duplicates);
        
          let data = result && result.data.files;
                // console.log(res);
      console.log(result);
      if(data.successfulBatch.length > 0) {
       const flag =await checkActiveFlag(data);
       console.log("Flag Response", flag);
}

          console.log("Result", result);
          uploadedFiles += batch.length;
          setNumberOfUploads(uploadedFiles);
        }
        postRecipeCounter++;
      } catch (error) {
        console.error("Error uploading batch:", error);
      } finally {
        setUploading(false);
        setShowPageElements(true); // Show elements after uploading
      }
    };

    for (let i = 0; i < filesArray.length; i += BatchSize) {
      const batch = filesArray.slice(i, i + BatchSize); // Get a batch of 40 files
      await processBatch(batch); // Wait for batch to process

      console.log(`Processed batch: ${Math.ceil((i + 1) / BatchSize)}`);
    }
    duplicates.length > 0 ? message.error(`${duplicates.length} files are duplicate`) : null
    successNames.length > 0 ? message.success(`${successNames.length} files are successfully uploaded`) : null
    fetchRecipes();
    setNumberOfUploads(0);
    // After all batches are processed
    setFileList([]);
  };


  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false)
    setFileList([]);
  };

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
      {!showPageElements && (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div style={{ display: 'flex', alignItems: 'center' }}><Spin indicator={pageLoadingSpinner} /><p style={{ marginLeft: '1rem' }}>Files uploading in Progress... {NumberOfUploads} files have been uploaded</p></div></div>)} {/* Optional loading spinner */}
      {showPageElements && (
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
            <div className="md:mr-[10.5rem] lg:mr-116 xl:mr-112">
              <Title level={1} >Recipes</Title>
            </div>
            <div className="flex gap-2 md:absolute md:left-[70%] md:top-[10%] md:mb-4 lg: absolute lg:left-[76%] lg:top-[9%] lg:mb-4 xl:relative xl:left-0 xl:mb-0">
              <label style={{ color: '#797FE7' }}>From: </label>
              <input style={{ textAlign: 'center' }} type="date" onChange={(e) => setStartDate(e.target.value)} />
              <label style={{ color: '#797FE7' }}>To: </label>
              <input style={{ textAlign: 'center' }} type="date" onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <UtilityPanel
              position={position}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleExport={handleExport}
              // handleFailedFiles={handleFailedFiles}
              uploading={uploading}
              isExporting={isExporting} onChange={(e) => setPosition(e.target.value)}  // exportSpinner={exportSpinner}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
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
              <Button type="primary" className='mr-3' onClick={()=>{handleSubmit()}} icon={<UploadOutlined />}>Start Upload</Button>
              <input type="file" id="fileInput" ref={fileInputRef} multiple></input>
            </>
          </Modal>
          <> {position === 'success' ? (<>
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
                                <div style={{ display: 'flex', alignItems: 'center', color: 'black', fontWeight: '500' }}>
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
          </>) : position === 'failed' ? (

            <>
              {/* {console.log(dataSource)} */}
              <Table columns={columns} dataSource={dataSource} />
            </>
          ) : null}</>

        </div>
      )}
    </>

  );
};

export default Recipes;
