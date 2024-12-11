
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';



export async function POST(request:NextRequest) {
  try {
    const {data} = await request.json();
    // console.log(data.recipesResult);
    const { recipesResult, stepsResult, chemicalsResult, chemicalsAssocResult } = data;

    const recipes = recipesResult;
    const steps = stepsResult;
    const chemicals = chemicalsResult;
    const chemicalsAssociation = chemicalsAssocResult;
// console.log(recipes);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Recipes');

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
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 6) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7030a0' } };
      } else if (colNumber <= 13) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } };
      } else if (colNumber <= 21) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e26b0a' } };
      } else if (colNumber <= 25){
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7030a0' } };
      } else if (colNumber <= 28) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4f81bd' } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '00b050' } };
      }
    });

    const rowSet = new Set();
    // const darkbg = 'd7d7d7', lightbg = 'ffffff';
    recipes.forEach((recipe:any, recipeIndex:any) => {
      const recipeSteps = steps.filter((step:any) => step.recipesid === recipe.id);
      let firstStepRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
      let rowObject = {}
      console.log("recipeSteps");
      recipeSteps.forEach((step:any, stepIndex:any) => {
        console.log("step");
        const stepChemicals = chemicalsAssociation
          .filter((assoc:any) => assoc.stepid === step.id)
          .map((assoc:any) => {
            const chemical = chemicals.find((c:any) => c.id === assoc.chemicalid);
            return {
              chemical_name: chemical ? chemical.name : 'Unknown',
              dosage_percent: assoc.percentage !== null ? assoc.percentage : 'Unknown',
              dosage: assoc.dosage !== null ? assoc.dosage : 'Unknown',
            };
          });
        stepChemicals.forEach((chemical:any, chemicalIndex:any) => {
          console.log( "chemical");
          const rowKey = `${recipeIndex}-${stepIndex}-${chemicalIndex}-${recipe.recipe || recipe.id}-${step.step_no}-${chemical.chemical_name}`;

          if (!rowSet.has(rowKey)) {

            const cell = worksheet.addRow({
              recipe_number: recipe.recipe,
              fno: recipe.fno,
              fabric: recipe.fabric,
              wash: recipe.finish,  
              active_flag: 'Y',     
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
              
            });
            const dosage_percent = cell.getCell(15).address
            const dosage = cell.getCell(16).address
            worksheet.getCell(`${dosage_percent}`).value = { formula: `${dosage}/140000*100` };
             rowSet.add(rowKey);
             bgcolourCondition(recipeIndex,cell);
          }
          
        });

        if (stepChemicals.length === 0) {
          const rowKey = `${recipeIndex}-${stepIndex}-${recipe.recipe || recipe.id}-${step.step_no}`;
          if (!rowSet.has(rowKey)) {
            const cell = worksheet.addRow({
              recipe_number: recipe.recipe,
              fno: recipe.fno,
              fabric: recipe.fabric,
              wash: recipe.finish,  
              active_flag: 'Y',     
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
            });
            
             rowSet.add(rowKey);
            bgcolourCondition(recipeIndex,cell);
          }
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

    worksheet.columns.forEach(column => {
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
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=recipes.xlsx',
      },
    });
  } catch (error) {
    console.error('Failed to export recipes:', error);
    return new NextResponse('Error exporting recipes', { status: 500 });
  }
}
