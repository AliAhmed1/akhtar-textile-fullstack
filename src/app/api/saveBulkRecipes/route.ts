// import { NextRequest, NextResponse } from 'next/server';
// import { Client } from 'pg';

// // Initialize the PostgreSQL client
// const client = new Client({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
// });

// client.connect();

// // Handler for POST requests
// export async function POST(request: NextRequest) {
//   try {
//     // Parse the JSON body
//     const fullData = await request.json();
//     console.log(fullData);

//     // Check if fullData is an array (multiple recipes) or a single object (one recipe)
//     const recipes = Array.isArray(fullData) ? fullData : [fullData];

//     // Iterate through each recipe (even if it's just one)
//     for (const recipe of recipes) {
//       // Save recipe details to the 'recipes' table
//       const result = await client.query(
//         `INSERT INTO recipes (Load_Size, Machine_Type, Finish, Fabric, Recipe, Fno, name)
//          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
//         [
//           recipe.load_size,
//           recipe.machine_type,
//           recipe.finish,
//           recipe.fabric,
//           recipe.recipe_no,
//           recipe.Fno,
//           recipe.file_name,

//         ]
//       );

//       const recipeId = result.rows[0].id;

//       // Loop through the steps within each recipe
//       for (const step of recipe.step) {
//         // Save each step to the 'steps' table
//         const stepResult = await client.query(
//           `INSERT INTO steps (step_no, action, minutes, liters, RPM, centigrade, PH, TDS, TSS, recipesid)
//            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
//           [
//             step.step_no,
//             step.action,
//             step.minutes,
//             step.litres,
//             step.rpm,
//             step.temperature,
//             step.PH,
//             step.TDS,
//             step.TSS,
//             recipeId,
//           ]
//         );

//         const stepId = stepResult.rows[0].id;

//         // If the step contains chemicals, save them to 'chemicals' and 'chemical_association'
//         if (step.chemicals && step.chemicals.length > 0) {
//           for (const chemical of step.chemicals) {
//             // Insert chemical details to 'chemicals' table and get the chemical ID
//             const chemicalResult = await client.query(
//               `INSERT INTO chemicals (name)
//                VALUES ($1) RETURNING id`,
//               [chemical.recipe_name]
//             );

//             const chemicalId = chemicalResult.rows[0].id;

//             // Associate the chemical with the step in 'chemical_association' table
//             await client.query(
//               `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage)
//                VALUES ($1, $2, $3, $4)`,
//               [stepId, chemicalId, chemical.percentage, chemical.dosage]
//             );
//           }
//         }
//       }
//     }

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error('Error saving recipe data:', error);
//     return NextResponse.json({ success: false, message: 'Failed to save recipe data' }, { status: 500 });
//   }
// }


import { message } from 'antd';
import { fail } from 'assert';
import { ro } from 'date-fns/locale';
import { result } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { Client, types } from 'pg';

// Initialize the PostgreSQL client



// Handler for POST requests
export async function POST(request: NextRequest) {
//   types.setTypeParser(20, val => Number(val)); // BIGINT
// types.setTypeParser(1700, val => Number(val)); // NUMERIC
// const {fil}
const client = new Client({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
});
  
  let failed: any[] = [];
  let duplicates: any[] = [];
  let successful: any[] = []; 
  console.log('request',request);
  try {
    client.connect();
    // Parse the JSON body
    const {fileDataArray, BatchSize} = await request.json();
    console.log('batchSize',BatchSize);
    console.log('fileDataArray',fileDataArray);
    // Check if fileDataArray is an array (multiple recipes) or a single object (one recipe)
    const recipes = Array.isArray(fileDataArray) ? fileDataArray : [fileDataArray];
    console.log('recipes',recipes.length);
    // Split recipes into batches for processing
    // const BATCH_SIZE = 40;
  
    // Start transaction for all uploads
    await client.query('BEGIN');
  
    for (let i = 0; i < recipes.length; i += BatchSize) {
      let count = 0;
      const batch = recipes.slice(i, i + BatchSize);
  const successfulBatch: any[] = [];
  // console.log("check",successfulBatch);
      const recipeValues: any[] = [];

      // Prepare values for recipe batch insert
      // console.log("check1",batch);
       const recipeQueryPart =
      batch.map((recipe,index) => {
        recipeValues.push(
          recipe.load_size,
          recipe.machine_type,
          recipe.finish,
          recipe.fabric,
          recipe.recipe_no,
          String(recipe.Fno),
          recipe.file_name
        );
        return  `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`;
      });

      const recipeQuery = `
        INSERT INTO recipes (Load_Size, Machine_Type, Finish, Fabric, Recipe, Fno, name)
        VALUES ${recipeQueryPart.join(', ')}
        ON CONFLICT (Recipe) DO NOTHING
        RETURNING id::text AS id, name, Recipe as recipe_no;
      `;

  const recipeIds:BigInt[] = [];
      // Insert recipes and collect the IDs

       const recipeResult= await client.query(recipeQuery, recipeValues);
      //  const {id, name, recipe_no}:IRecipeResult = recipeResult.rows[0];
      // console.log('check1',recipeResult.rows);

      recipeResult.rows.map((row) => {
        recipeIds.push(BigInt(row.id)),
        successful.push(row.name)
      });

      console.log('recipe',recipeIds.length);
      recipeResult.rows.forEach((row) =>{
    batch.forEach((recipe) => {
              if (row.name  === recipe.file_name) {
          successfulBatch.push(recipe);
        }
        //  else {
        //   duplicates.push(recipe.name);
        // }
      });
    });

    console.log('check2',successfulBatch.length);

      // Prepare to insert steps for all recipes
      const stepValues: any[] = [];
      const stepExpression: any[] = [];

      // Fill step values
      let placeholderIndex = 1

if (successfulBatch.length > 0) {
  successfulBatch?.forEach((recipe, recipeIndex) => {
    recipe.step.forEach((step: any ) => {
      // Push step values into the array
      stepValues.push(
        String(step.step_no),            // Keep step_no as a string
        step.action,                     // Action remains a string
        String(step.minutes),            // Keep minutes as a string
        step.litres,                     // Keep litres as is
        step.rpm,                        // Keep rpm as is
        step.temperature,                // Keep temperature as is
        String(step.PH),                 // Keep PH as a string
        String(step.LR),                 // Keep LR as a string
        String(step.TDS),                // Keep TDS as a string
        String(step.TSS),                // Keep TSS as a string
        recipeIds[recipeIndex],          // Corresponding recipe ID
        step.step_id
      );
  
      // Create the expression with correct indexed placeholders
      const rowPlaceholders = `($${placeholderIndex}, $${placeholderIndex + 1}, $${placeholderIndex + 2}, $${placeholderIndex + 3}, $${placeholderIndex + 4}, $${placeholderIndex + 5}, $${placeholderIndex + 6}, $${placeholderIndex + 7}, $${placeholderIndex + 8}, $${placeholderIndex + 9}, $${placeholderIndex + 10}, $${placeholderIndex + 11})`;
    stepExpression.push(rowPlaceholders);

    // Increment the placeholder index by 10 for the next row
    placeholderIndex += 12;
    });
  });
  
  // Construct the SQL query
const stepQuery = `INSERT INTO steps (step_no, action, minutes, liters, rpm, centigrade, ph, lr, tds, tss, recipesid, step_id)
                   VALUES ${stepExpression.join(', ')} RETURNING id::text As id, step_no, recipesid:: text As recipesid, step_id;`;
  

  // console.log('Step Values:', stepValues);
  // console.log('Step Query:', stepExpression);

  

    // Insert steps
    const stepResult = await client.query(stepQuery, stepValues);
    // console.log('Inserted Step Result:', stepResult.rows);


    
  console.log('check4.5')
// console.log(stepResult.rows.filter((step) => step.recipesid === null));
      // Collect all chemicals to insert concurrently
      const chemicalPromises = successfulBatch?.map((recipe, recipeIndex) => {
        // console.log(step.recipesid)
        const recipesSteps = stepResult.rows.filter((step) => BigInt(step.recipesid) === recipeIds[recipeIndex]);
        console.log('filename',recipe.file_name);
        return insertChemicalsInBatch(recipe.step, recipesSteps, client, recipe);
      });
      
      // Wait for all chemical insertions to complete
      await Promise.all(chemicalPromises);
    }
    // suc
    const seenFiles: Set<string> = new Set();

    batch.forEach((recipe: { file_name: string }) => {
      if (successful.length === 0) {
        if (!seenFiles.has(recipe.file_name)) {
          duplicates.push(recipe.file_name);
          seenFiles.add(recipe.file_name);
        }
      } else {
        const isDuplicate = successful.every((successfulFile: string) => recipe.file_name !== successfulFile);
        
        if (isDuplicate && !seenFiles.has(recipe.file_name)) {
          duplicates.push(recipe.file_name);
          seenFiles.add(recipe.file_name);
        }
      }
    });
    }
    console.log(duplicates.length);
    console.log('success',successful);
    // Commit transaction after all batches processed successfully
    await client.query('COMMIT');
  
// console.log(successful);

    return NextResponse.json({sucess: false, message: {duplicates,successful} },{ status: 200 })
  } catch (error) {
    console.error('Error saving recipe data:', error);
    // Rollback transaction if error occurs
    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, message: failed }, { status: 500 });
  } finally {
    await client.end();
  }

}
  // Helper function to batch insert chemicals for steps
  const insertChemicalsInBatch = async (steps: any[],stepResult: any, client: any, recipe:any) => {
    const chemicalInsertData: any[] = [];
    const chemicalAssocInsertData: any[] = [];
    const placeholders:any[] = [];
    const placeholderWithBrackets:any[] = [];
    let placeholderIndex = 0;
  console.log('check5')
    steps.forEach((step) => {
      // console.log(step.chemicals)
      if (step.chemicals && step.chemicals.length > 0) {
        step.chemicals.forEach((chemical: any) => {
          // Prepare chemical for insert
          chemicalInsertData.push(chemical.recipe_name);
          placeholders.push(`$${placeholderIndex + 1}`);
          placeholderWithBrackets.push(`($${placeholderIndex + 1})`);
          placeholderIndex++;
        });
      }
    });
  console.log('check5.5')
    // Insert chemicals if they exist
    if (chemicalInsertData.length > 0) {


      const chemicalQuery = `
        WITH inserted AS (
          INSERT INTO chemicals (name)
          VALUES ${placeholderWithBrackets.join(', ')}
          ON CONFLICT (name) DO NOTHING
          RETURNING id:: text as id, name
        )
          SELECT id:: text as id, name FROM inserted
          UNION ALL
          SELECT id:: text as id, name FROM chemicals WHERE name IN (${placeholders.join(', ')});
        `;

      console.log('check6')
      // console.log(placeholders);
      // console.log(chemicalInsertData);
      // console.log('chemicalQuery',chemicalQuery)
      const chemicalIdsResult = await client.query(chemicalQuery, chemicalInsertData);
      // console.log('chemical result',chemicalIdsResult.rows)
      const stepExpression: any[] = [];

      // Fill step values
      let placeholderIndex = 1
      // console.log('steps',steps);
      steps.forEach((step) => {
        console.log('step check')
        stepResult.forEach((stepResult:any) =>{
          // console.log('step result check',stepResult)
        if(step.step_id ===  Number(stepResult.step_id)) {   /// work needs to be done not populating
          step.chemicals?.forEach((chemical: any, index: number) => {
            console.log('check');
            chemicalIdsResult.rows.forEach((chemicalResult:any, index:number) => {
              // console.log('check6.5',chemicalResult.name)
              // console.log('check6.6',chemical.recipe_name)
              if(chemical.recipe_name === chemicalResult.name) {
                console.log(chemical.dosage === "None"?chemical.dosage:null)
                chemicalAssocInsertData.push(
                  BigInt(stepResult.id), // Use the recipe ID for association
                  BigInt(chemicalResult.id), // Assuming name is the chemical ID, else map properly
                  chemical.percentage,
                  chemical.dosage
                );
                const rowPlaceholders = `($${placeholderIndex  }, $${placeholderIndex + 1}, $${placeholderIndex + 2}, $${placeholderIndex + 3})`;
                stepExpression.push(rowPlaceholders);

                // Increment the placeholder index by 10 for the next row
                placeholderIndex += 4;
              }
            })
          });
        }
      })
      })

      

  console.log('check7',chemicalAssocInsertData);
  console.log('filename', recipe.file_name);
      // Prepare chemical association query
      if (chemicalAssocInsertData.length > 0) {
        const chemicalAssocQuery = `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage) 
                                     VALUES ${stepExpression.join(', ')};`;
        console.log(chemicalAssocQuery);
        await client.query(chemicalAssocQuery, chemicalAssocInsertData);
        console.log('check8');
      }

    }
  };

//   } catch (error) {
//     console.error('Error saving recipe data:', error);
//     return NextResponse.json({ success: false, message: failed }, { status: 500 });
//   } finally {
//     await client.end(); // Close the client connection
//   }
// }
