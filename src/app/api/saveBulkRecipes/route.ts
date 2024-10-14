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
import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Initialize the PostgreSQL client
const client = new Client({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
});


// Handler for POST requests
export async function POST(request: NextRequest) {

  
  let failed: any[] = [];
  let duplicates: any[] = [];
  let successful: any[] = []; 
  console.log('request',request);
  try {
    client.connect();
    // Parse the JSON body
    const fullData = await request.json();
    
    // Check if fullData is an array (multiple recipes) or a single object (one recipe)
    const recipes = Array.isArray(fullData) ? fullData : [fullData];
  
    // console.log(recipes);
    
    // Split recipes into batches for processing
    const BATCH_SIZE = 40;
  
    // Start transaction for all uploads
    await client.query('BEGIN');
  
    for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
      const batch = recipes.slice(i, i + BATCH_SIZE);
  
      const recipeValues: any[] = [];
      // Prepare values for recipe batch insert
      console.log("check1",batch.length);
       const recipeQueryPart =
      batch.map((recipe,index) => {
        recipeValues.push(
          recipe.load_size,
          recipe.machine_type,
          recipe.finish,
          recipe.fabric,
          recipe.recipe_no,
          recipe.Fno,
          recipe.file_name
        );
        return  `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`;
      });
      const recipeQuery = `INSERT INTO recipes (Load_Size, Machine_Type, Finish, Fabric, Recipe, Fno, name) 
                          VALUES 
                           ${recipeQueryPart.join(', ')}
                          on CONFLICT (Recipe) DO NOTHING 
                          RETURNING id , name, recipe as recipe_no;`;
  
      // Fill recipe values
      
      // console.log('check1',recipeValues);
  // console.log('check2');
      // Insert recipes and collect the IDs
      const recipeResult = await client.query(recipeQuery, recipeValues);
    recipeResult.rows.forEach((row) => {
      if (row.id> 0) {
        successful.push(row);
      } else {
        duplicates.push(row.name);
      }
    })
    console.log('check2',successful);
      const recipeIds = successful.map(row => row.id);
  // console.log('check3',recipeIds);
      // Prepare to insert steps for all recipes
      const stepValues: any[] = [];
      const stepExpression: any[] = [];

      // Fill step values
let stepIndex = 0
let successCounter = 0;
      batch.forEach((recipe, recipeIndex) => {

        recipe.step.forEach((step: any) => {
          console.log(successful[successCounter].recipe_no);
          // Push step values into the array
          if(recipe.recipe_no === successful[successCounter].recipe_no){
          stepValues.push(
            step.step_no,
            step.action,
            step.minutes,
            step.litres,
            step.rpm,
            step.temperature,
            step.PH,
            step.TDS,
            step.TSS,
            recipeIds[successCounter] // Corresponding recipe ID
          );
      
          // Push the expression with correct indexed placeholders
          stepExpression.push(
            `($${stepIndex * 10 + 1}, $${stepIndex * 10 + 2}, $${stepIndex * 10 + 3}, $${stepIndex * 10 + 4}, $${stepIndex * 10 + 5}, $${stepIndex * 10 + 6}, $${stepIndex * 10 + 7}, $${stepIndex * 10 + 8}, $${stepIndex * 10 + 9}, $${stepIndex * 10 + 10})`
          );
      
          stepIndex++;
        }
        successCounter++;
        });
      });
    
       
      // console.log(stepQueryPart);
      const stepQuery = `INSERT INTO steps (step_no, action, minutes, liters, RPM, centigrade, PH, TDS, TSS, recipesid) 
                         VALUES ${stepExpression.join(', ')}`;
console.log(stepIndex);
  console.log(stepValues)
  console.log(stepExpression.length)
  console.log('check4')
      // Insert steps
      await client.query(stepQuery, stepValues);
  console.log('check4.5')

      // Collect all chemicals to insert concurrently
      const chemicalPromises = batch.map((recipe, recipeIndex) => {
        return insertChemicalsInBatch(recipe.step, recipeIds[recipeIndex]);
      });
  console.log('check5')
      // Wait for all chemical insertions to complete
      await Promise.all(chemicalPromises);
  
      // Track successful uploads
      successful.push(...batch.map(r => r.file_name));
    }
  
    // Commit transaction after all batches processed successfully
    await client.query('COMMIT');
  

  
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
  const insertChemicalsInBatch = async (steps: any[], recipeId: number) => {
    const chemicalInsertData: any[] = [];
    const chemicalAssocInsertData: any[] = [];
  console.log('check5')
    steps.forEach((step) => {
      if (step.chemicals && step.chemicals.length > 0) {
        step.chemicals.forEach((chemical: any) => {
          // Prepare chemical for insert
          chemicalInsertData.push([chemical.recipe_name]);
  
          // Associate chemical with the step
          chemicalAssocInsertData.push([
            recipeId, // Use the recipe ID for association
            chemical.recipe_name, // Assuming name is the chemical ID, else map properly
            chemical.percentage,
            chemical.dosage
          ]);
        });
      }
    });
  console.log('check5.5')
    // Insert chemicals if they exist
    if (chemicalInsertData.length > 0) {
      const chemicalQuery = `INSERT INTO chemicals (name) 
                             VALUES ${chemicalInsertData.map((_, index) => `($${index + 1})`).join(', ')} 
                             ON CONFLICT (name) DO NOTHING RETURNING id`;
      console.log('check6')
      const chemicalIdsResult = await client.query(chemicalQuery, chemicalInsertData.flat());
      const chemicalIds = chemicalIdsResult.rows.map(row => row.id);
  console.log('check7')
      // Prepare chemical association query
      if (chemicalAssocInsertData.length > 0) {
        const chemicalAssocQuery = `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage) 
                                     VALUES ${chemicalAssocInsertData.map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')}`;
        
        await client.query(chemicalAssocQuery, chemicalAssocInsertData.flat());
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
