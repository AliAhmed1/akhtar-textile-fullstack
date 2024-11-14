import { prisma } from '@/lib/prisma';
import { recipes } from '@prisma/client';
import { message } from 'antd';
import { fail } from 'assert';
import { ro } from 'date-fns/locale';
import { result } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { Client, types } from 'pg';

// Initialize the PostgreSQL client



// Handler for POST requests
export async function POST(request: NextRequest) {

  let failed: any[] = [];
  let duplicates: any[] = [];
  let successful: any[] = []; 

  try {

    const {fileDataArray, BatchSize} = await request.json();
    console.log('batchSize',BatchSize);
    console.log('fileDataArray',fileDataArray);
    // Check if fileDataArray is an array (multiple recipes) or a single object (one recipe)
    const recipes = Array.isArray(fileDataArray) ? fileDataArray : [fileDataArray];
    console.log('recipes',recipes.length);
  
    // Start transaction for all uploads
    // await client.query('BEGIN');
  
    for (let i = 0; i < recipes.length; i += BatchSize) {
      let count = 0;
      const batch = recipes.slice(i, i + BatchSize);
      const successfulBatch: any[] = [];

      // Start transaction
      await prisma.$transaction(async (prisma) => {
        // Insert recipes in batches
        const existingRecords = await prisma.recipes.findMany({
          where: {
            name: { in: batch.map((recipe) => recipe.file_name) },
          },
          select: { id: true, name: true },
        });
        console.log('existingRecords',existingRecords);
        // Extract the IDs of the existing records
        const existingIds = new Set(existingRecords.map((record) => record.id));
        
        // Step 2: Insert the batch with createMany and skipDuplicates enabled
        await prisma.recipes.createMany({
          data: batch.map((recipe) => ({
            load_size: recipe.load_size,
            machine_type: recipe.machine_type,
            finish: recipe.finish,
            fabric: recipe.fabric,
            recipe: recipe.recipe_no,
            fno: String(recipe.Fno),
            name: recipe.file_name,
          })),
          skipDuplicates: true,
        });
        
        // Step 3: Fetch records again and filter out the ones that already existed
        const recipeResult = await prisma.recipes.findMany({
          where: {
            name: { in: batch.map((r) => r.file_name) },
          },
          select: { id: true, name: true, recipe: true },
        });

        console.log('recipeResult',recipeResult);
      // });

      const newlyInsertedRecords = recipeResult.filter(
        (record) => !existingIds.has(record.id)
      );
      console.log('newlyInsertedRecords',newlyInsertedRecords);
      const insertedRecipeIds = newlyInsertedRecords.map((record) => record);

      // Identify successful and duplicate recipes
      insertedRecipeIds.forEach((recipe) => {

        successful.push(recipe.name);
        const originalRecipe = batch.filter((r) => r.file_name === recipe.name);
        originalRecipe.map((r:any) => (r.id = recipe.id));
        originalRecipe && successfulBatch.push(...originalRecipe);
      });
console.log('successfulBatch',successfulBatch);
      const seenRecipes = new Set<string>();
      batch.forEach((recipe) => {
        if (!seenRecipes.has(recipe.file_name) && !successful.includes(recipe.file_name)) {
          duplicates.push(recipe.file_name);
          seenRecipes.add(recipe.file_name);
        }
      });

      //  const recipeResult= await client.query(recipeQuery, recipeValues);
      //  const {id, name, recipe_no}:IRecipeResult = recipeResult.rows[0];
      // console.log('check1',recipeResult.rows);

//       recipeResult.map((row) => {
//         recipeIds.push(BigInt(row.id)),
//         successful.push(row.name)
//       });

//       console.log('recipe',recipeIds.length);
//       recipeResult.rows.forEach((row) =>{
//     batch.forEach((recipe) => {
//               if (row.name  === recipe.file_name) {
//           successfulBatch.push(recipe);
//         }
//         //  else {
//         //   duplicates.push(recipe.name);
//         // }
//       });
//     });

//     console.log('check2',successfulBatch.length);

//       // Prepare to insert steps for all recipes
      // const stepValues: any[] = [];
//       const stepExpression: any[] = [];

//       // Fill step values
//       let placeholderIndex = 1

if (successfulBatch.length > 0) {
  const stepValues = successfulBatch?.flatMap((recipe, recipeIndex) => {
     return recipe.step.map((step: any ) => ({

        step_no: String(step.step_no),            // Keep step_no as a string
        action:step.action,                     // Action remains a string
        minutes:String(step.minutes),            // Keep minutes as a string
        liters:step.litres,                     // Keep litres as is
        rpm:step.rpm,                        // Keep rpm as is
        centigrade:step.temperature,                // Keep temperature as is
        ph:String(step.PH),                 // Keep PH as a string
        lr:String(step.LR),                 // Keep LR as a string
        tds:String(step.TDS),                // Keep TDS as a string
        tss:String(step.TSS),                // Keep TSS as a string
        recipesid:insertedRecipeIds[recipeIndex].id,          // Corresponding recipe ID
        step_id: step.step_id,
      }));
    })
  
  console.log('stepValues',stepValues);

//       // Create the expression with correct indexed placeholders
//       const rowPlaceholders = `($${placeholderIndex}, $${placeholderIndex + 1}, $${placeholderIndex + 2}, $${placeholderIndex + 3}, $${placeholderIndex + 4}, $${placeholderIndex + 5}, $${placeholderIndex + 6}, $${placeholderIndex + 7}, $${placeholderIndex + 8}, $${placeholderIndex + 9}, $${placeholderIndex + 10}, $${placeholderIndex + 11})`;
//     stepExpression.push(rowPlaceholders);

//     // Increment the placeholder index by 10 for the next row
//     placeholderIndex += 12;
//     });
//   });
  
//   // Construct the SQL query
// const stepQuery = `INSERT INTO steps (step_no, action, minutes, liters, rpm, centigrade, ph, lr, tds, tss, recipesid, step_id)
//                    VALUES ${stepExpression.join(', ')} RETURNING id::text As id, step_no, recipesid:: text As recipesid, step_id;`;
  

//   // console.log('Step Values:', stepValues);
//   // console.log('Step Query:', stepExpression);

  

//     // Insert steps
//     const stepResult = await client.query(stepQuery, stepValues);
//     // console.log('Inserted Step Result:', stepResult.rows);


    
//   console.log('check4.5')
// // console.log(stepResult.rows.filter((step) => step.recipesid === null));
//       // Collect all chemicals to insert concurrently
//       const chemicalPromises = successfulBatch?.map((recipe, recipeIndex) => {
//         // console.log(step.recipesid)
//         const recipesSteps = stepResult.rows.filter((step) => BigInt(step.recipesid) === recipeIds[recipeIndex]);
//         console.log('filename',recipe.file_name);
//         return insertChemicalsInBatch(recipe.step, recipesSteps, client, recipe);
//       });
      
//       // Wait for all chemical insertions to complete
//       await Promise.all(chemicalPromises);
//     }
//     // suc
//     const seenFiles: Set<string> = new Set();

//     batch.forEach((recipe: { file_name: string }) => {
//       if (successful.length === 0) {
//         if (!seenFiles.has(recipe.file_name)) {
//           duplicates.push(recipe.file_name);
//           seenFiles.add(recipe.file_name);
//         }
//       } else {
//         const isDuplicate = successful.every((successfulFile: string) => recipe.file_name !== successfulFile);
        
//         if (isDuplicate && !seenFiles.has(recipe.file_name)) {
//           duplicates.push(recipe.file_name);
//           seenFiles.add(recipe.file_name);
//         }
//       }
//     });
//     }
//     console.log(duplicates.length);
//     console.log('success',successful);
//     // Commit transaction after all batches processed successfully
//     await client.query('COMMIT');
    }
  });
// console.log(successful);
  }
    return NextResponse.json({sucess: false, message: {duplicates,successful} },{ status: 200 })
  } catch (error) {
    console.error('Error saving recipe data:', error);
    // Rollback transaction if error occurs
    // await client.query('ROLLBACK');
    return NextResponse.json({ success: false, message: failed }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }

}
  // Helper function to batch insert chemicals for steps
  // const insertChemicalsInBatch = async (steps: any[],stepResult: any, client: any, recipe:any) => {
  //   const chemicalInsertData: any[] = [];
  //   const chemicalAssocInsertData: any[] = [];
  //   const placeholders:any[] = [];
  //   const placeholderWithBrackets:any[] = [];
  //   let placeholderIndex = 0;
  // console.log('check5')
  //   steps.forEach((step) => {
  //     // console.log(step.chemicals)
  //     if (step.chemicals && step.chemicals.length > 0) {
  //       step.chemicals.forEach((chemical: any) => {
  //         // Prepare chemical for insert
  //         chemicalInsertData.push(chemical.recipe_name);
  //         placeholders.push(`$${placeholderIndex + 1}`);
  //         placeholderWithBrackets.push(`($${placeholderIndex + 1})`);
  //         placeholderIndex++;
  //       });
  //     }
  //   });
  // console.log('check5.5')
  //   // Insert chemicals if they exist
  //   if (chemicalInsertData.length > 0) {


  //     const chemicalQuery = `
  //       WITH inserted AS (
  //         INSERT INTO chemicals (name)
  //         VALUES ${placeholderWithBrackets.join(', ')}
  //         ON CONFLICT (name) DO NOTHING
  //         RETURNING id:: text as id, name
  //       )
  //         SELECT id:: text as id, name FROM inserted
  //         UNION ALL
  //         SELECT id:: text as id, name FROM chemicals WHERE name IN (${placeholders.join(', ')});
  //       `;

  //     console.log('check6')
  //     // console.log(placeholders);
  //     // console.log(chemicalInsertData);
  //     // console.log('chemicalQuery',chemicalQuery)
  //     const chemicalIdsResult = await client.query(chemicalQuery, chemicalInsertData);
  //     // console.log('chemical result',chemicalIdsResult.rows)
  //     const stepExpression: any[] = [];

  //     // Fill step values
  //     let placeholderIndex = 1
  //     // console.log('steps',steps);
  //     steps.forEach((step) => {
  //       console.log('step check')
  //       stepResult.forEach((stepResult:any) =>{
  //         // console.log('step result check',stepResult)
  //       if(step.step_id ===  Number(stepResult.step_id)) {   /// work needs to be done not populating
  //         step.chemicals?.forEach((chemical: any, index: number) => {
  //           console.log('check');
  //           chemicalIdsResult.rows.forEach((chemicalResult:any, index:number) => {
  //             // console.log('check6.5',chemicalResult.name)
  //             // console.log('check6.6',chemical.recipe_name)
  //             if(chemical.recipe_name === chemicalResult.name) {
  //               console.log(chemical.dosage === "None"?chemical.dosage:null)
  //               chemicalAssocInsertData.push(
  //                 BigInt(stepResult.id), // Use the recipe ID for association
  //                 BigInt(chemicalResult.id), // Assuming name is the chemical ID, else map properly
  //                 chemical.percentage,
  //                 chemical.dosage
  //               );
  //               const rowPlaceholders = `($${placeholderIndex  }, $${placeholderIndex + 1}, $${placeholderIndex + 2}, $${placeholderIndex + 3})`;
  //               stepExpression.push(rowPlaceholders);

  //               // Increment the placeholder index by 10 for the next row
  //               placeholderIndex += 4;
  //             }
  //           })
  //         });
  //       }
  //     })
  //     })

      

  // console.log('check7',chemicalAssocInsertData);
  // console.log('filename', recipe.file_name);
  //     // Prepare chemical association query
  //     if (chemicalAssocInsertData.length > 0) {
  //       const chemicalAssocQuery = `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage) 
  //                                    VALUES ${stepExpression.join(', ')};`;
  //       console.log(chemicalAssocQuery);
  //       await client.query(chemicalAssocQuery, chemicalAssocInsertData);
  //       console.log('check8');
  //     }

  //   }
  // };