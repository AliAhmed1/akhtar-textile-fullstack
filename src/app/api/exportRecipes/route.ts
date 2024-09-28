// import { NextResponse } from 'next/server';
// import { Pool } from 'pg';
// import ExcelJS from 'exceljs';

// const pool = new Pool({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// export async function GET() {
//   try {
//     const client = await pool.connect();
    
//     const recipesResult = await client.query('SELECT * FROM recipes');
//     const stepsResult = await client.query('SELECT * FROM steps');
//     const chemicalsResult = await client.query('SELECT * FROM chemicals');
//     const chemicalsAssocResult = await client.query('SELECT * FROM chemical_association');
    
//     client.release();

//     const recipes = recipesResult.rows;
//     const steps = stepsResult.rows;
//     const chemicals = chemicalsResult.rows;
//     const chemicalsAssociation = chemicalsAssocResult.rows;

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Recipes');

//     worksheet.columns = [
//       { header: 'Recipe Number', key: 'recipe_number' },
//       { header: 'FNO', key: 'fno' },
//       { header: 'Fabric', key: 'fabric' },
//       { header: 'Wash', key: 'wash' },
//       { header: 'Active Flag', key: 'active_flag' },
//       { header: 'Load Size', key: 'load_size' },
//       { header: 'Action', key: 'action' },
//       { header: 'Liters', key: 'liters' },
//       { header: 'RPM', key: 'rpm' },
//       { header: 'Centigrade', key: 'centigrade' },
//       { header: 'PH', key: 'ph' },
//       { header: 'TDS', key: 'tds' },
//       { header: 'TSS', key: 'tss' },
//       { header: 'Minutes', key: 'minutes' },
//       { header: 'Step No', key: 'step_no' },
//       { header: 'Chemical Name', key: 'chemical_name' },
//       { header: 'Dosage %', key: 'dosage_percent' },
//       { header: 'Dosage', key: 'dosage' },
//       { header: 'Total Weight', key: 'total_weight' },
//       { header: 'Concatenate', key: 'concatenate' },
//     ];

//     // Set the header row
//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true };
//     headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
//     headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
//       if (colNumber <= 6) {
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: '7030a0' },
//         };
//       } else if (colNumber <= 13) {
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'ffff00' },
//         };
//       } else if (colNumber <= 17) {
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'e26b0a' },
//         };
//       } else {
//         cell.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: '4f81bd' },
//         };
//       }
//     });

//     // Set to track existing rows to avoid duplicates
//     const rowSet = new Set();

//     recipes.forEach((recipe, recipeIndex) => {
//       const recipeSteps = steps.filter(step => step.recipesid === recipe.id);
    
//       let firstStepRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
    
//       recipeSteps.forEach((step, stepIndex) => {
//         const stepChemicals = chemicalsAssociation
//           .filter(assoc => assoc.stepid === step.id)
//           .map(assoc => {
//             const chemical = chemicals.find(c => c.id === assoc.chemicalid);
//             return {
//               chemical_name: chemical ? chemical.name : 'Unknown',
//               dosage_percent: assoc.percentage !== null ? assoc.percentage : 'Unknown',
//               dosage: assoc.dosage !== null ? assoc.dosage : 'Unknown',
//             };
//           });
    
//         stepChemicals.forEach((chemical, chemicalIndex) => {
//           const rowKey = `${recipeIndex}-${stepIndex}-${chemicalIndex}-${recipe.recipe || recipe.id}-${step.step_no}-${chemical.chemical_name}`;
    
//           if (!rowSet.has(rowKey)) {
//             worksheet.addRow({
//               recipe_number: recipe.recipe,
//               fno: recipe.fno,
//               fabric: recipe.fabric,
//               wash: recipe.finish,  // Correctly using 'finish' for wash
//               active_flag: 'Y',     // Default value
//               load_size: recipe.load_size,
//               action: step.action,
//               liters: step.liters,
//               rpm: step.rpm,
//               centigrade: step.centigrade,
//               ph: step.ph,
//               tds: step.tds,
//               tss: step.tss,
//               minutes: step.minutes,
//               step_no: step.step_no,
//               chemical_name: chemical.chemical_name,
//               dosage_percent: chemical.dosage_percent,
//               dosage: chemical.dosage,
//             });
//             rowSet.add(rowKey);
//           }
//         });
    
//         if (stepChemicals.length === 0) {
//           const rowKey = `${recipeIndex}-${stepIndex}-${recipe.recipe || recipe.id}-${step.step_no}`;
//           if (!rowSet.has(rowKey)) {
//             worksheet.addRow({
//               recipe_number: recipe.recipe,
//               fno: recipe.fno,
//               fabric: recipe.fabric,
//               wash: recipe.finish,  // Correctly using 'finish' for wash
//               active_flag: 'Y',     // Default value
//               load_size: recipe.load_size,
//               action: step.action,
//               liters: step.liters,
//               rpm: step.rpm,
//               centigrade: step.centigrade,
//               ph: step.ph,
//               tds: step.tds,
//               tss: step.tss,
//               minutes: step.minutes,
//               step_no: step.step_no,
//             });
//             rowSet.add(rowKey);
//           }
//         }
//       });
    
//       const lastRow = worksheet.lastRow;
//       if (lastRow) {
//         for (let col = 1; col <= 20; col++) { 
//           const cell = lastRow.getCell(col);
//           cell.border = {
//             bottom: { style: 'thick', color: { argb: '000000' } }, 
//           };
//         }
    
//         const sectionEndColumns = [6, 13, 17, 20]; 
    
//         sectionEndColumns.forEach(colNum => {
//           for (let rowNum = firstStepRow; rowNum <= lastRow.number; rowNum++) {
//             const row = worksheet.getRow(rowNum);
//             const cell = row.getCell(colNum);
//             cell.border = {
//               right: { style: 'thick', color: { argb: '000000' } }, 
//             };
//           }
//         });
//       }
//     });
    
    

//     worksheet.columns.forEach(column => {
//       if (column && typeof column.eachCell === 'function') {
//         let maxLength = 0;
//         column.eachCell({ includeEmpty: true }, (cell) => {
//           const columnLength = cell.value ? cell.value.toString().length : 10;
//           if (columnLength > maxLength) {
//             maxLength = columnLength;
//           }
//         });
//         column.width = maxLength < 10 ? 10 : maxLength;
//         column.alignment = { horizontal: 'center', vertical: 'middle' };
//       }
//     });

//     const buffer = await workbook.xlsx.writeBuffer();

//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         'Content-Disposition': 'attachment; filename=recipes.xlsx',
//       },
//     });
//   } catch (error) {
//     console.error('Failed to export recipes:', error);
//     return new NextResponse('Error exporting recipes', { status: 500 });
//   }
// }

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import ExcelJS from 'exceljs';

const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(request:any) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    console.log(startDate)
    console.log(endDate)
    const client = await pool.connect();

    if (!startDate || !endDate) {
      return new NextResponse('Start date and end date are required', { status: 400 });
    }    
    const recipesResult = await client.query(
      `SELECT * FROM recipes 
       WHERE created_at >= $1 AND created_at < $2`, 
       [startDate, new Date(new Date(endDate).setHours(23, 59, 59)).toISOString()]
    );
    
    const stepsResult = await client.query('SELECT * FROM steps');
    const chemicalsResult = await client.query('SELECT * FROM chemicals');
    const chemicalsAssocResult = await client.query('SELECT * FROM chemical_association');
    
    client.release();

    const recipes = recipesResult.rows;
    const steps = stepsResult.rows;
    const chemicals = chemicalsResult.rows;
    const chemicalsAssociation = chemicalsAssocResult.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Recipes');

    worksheet.columns = [
      { header: 'Recipe Number', key: 'recipe_number' },
      { header: 'FNO', key: 'fno' },
      { header: 'Fabric', key: 'fabric' },
      { header: 'Wash', key: 'wash' },
      { header: 'Active Flag', key: 'active_flag' },
      { header: 'Load Size', key: 'load_size' },
      { header: 'Action', key: 'action' },
      { header: 'Liters', key: 'liters' },
      { header: 'RPM', key: 'rpm' },
      { header: 'Centigrade', key: 'centigrade' },
      { header: 'PH', key: 'ph' },
      { header: 'TDS', key: 'tds' },
      { header: 'TSS', key: 'tss' },
      { header: 'Minutes', key: 'minutes' },
      { header: 'Step No', key: 'step_no' },
      { header: 'Chemical Name', key: 'chemical_name' },
      { header: 'Dosage %', key: 'dosage_percent' },
      { header: 'Dosage', key: 'dosage' },
      { header: 'Total Weight', key: 'total_weight' },
      { header: 'Concatenate', key: 'concatenate' },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 6) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7030a0' } };
      } else if (colNumber <= 13) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffff00' } };
      } else if (colNumber <= 17) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e26b0a' } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4f81bd' } };
      }
    });

    const rowSet = new Set();

    recipes.forEach((recipe, recipeIndex) => {
      const recipeSteps = steps.filter(step => step.recipesid === recipe.id);
      let firstStepRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;

      recipeSteps.forEach((step, stepIndex) => {
        const stepChemicals = chemicalsAssociation
          .filter(assoc => assoc.stepid === step.id)
          .map(assoc => {
            const chemical = chemicals.find(c => c.id === assoc.chemicalid);
            return {
              chemical_name: chemical ? chemical.name : 'Unknown',
              dosage_percent: assoc.percentage !== null ? assoc.percentage : 'Unknown',
              dosage: assoc.dosage !== null ? assoc.dosage : 'Unknown',
            };
          });

        stepChemicals.forEach((chemical, chemicalIndex) => {
          const rowKey = `${recipeIndex}-${stepIndex}-${chemicalIndex}-${recipe.recipe || recipe.id}-${step.step_no}-${chemical.chemical_name}`;

          if (!rowSet.has(rowKey)) {
            worksheet.addRow({
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
              tds: step.tds,
              tss: step.tss,
              minutes: step.minutes,
              step_no: step.step_no,
              chemical_name: chemical.chemical_name,
              dosage_percent: chemical.dosage_percent,
              dosage: chemical.dosage,
            });
            rowSet.add(rowKey);
          }
        });

        if (stepChemicals.length === 0) {
          const rowKey = `${recipeIndex}-${stepIndex}-${recipe.recipe || recipe.id}-${step.step_no}`;
          if (!rowSet.has(rowKey)) {
            worksheet.addRow({
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
              tds: step.tds,
              tss: step.tss,
              minutes: step.minutes,
              step_no: step.step_no,
            });
            rowSet.add(rowKey);
          }
        }
      });

      const lastRow = worksheet.lastRow;
      if (lastRow) {
        for (let col = 1; col <= 20; col++) { 
          const cell = lastRow.getCell(col);
          cell.border = { bottom: { style: 'thick', color: { argb: '000000' } } }; 
        }

        const sectionEndColumns = [6, 13, 17, 20]; 

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
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength;
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
