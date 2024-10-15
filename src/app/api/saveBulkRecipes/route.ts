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
import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Initialize the PostgreSQL client



// Handler for POST requests
export async function POST(request: NextRequest) {
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
  const successfulBatch: any[] = [];
  console.log("check",successfulBatch);
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
      const recipeNos = batch.map(recipe => `'${recipe.recipe_no.replace(/'/g, "''")}'`).join(', ');

      // Construct the SQL query
      const recipeQuery = `
        WITH inserted_recipes AS (
          INSERT INTO recipes (Load_Size, Machine_Type, Finish, Fabric, Recipe, Fno, name)
          VALUES ${recipeQueryPart.join(', ')}
          ON CONFLICT (Recipe) DO NOTHING
          RETURNING id, name, Recipe
        )
        SELECT 
          COALESCE(inserted_recipes.id, recipes.id) AS id,  
          COALESCE(inserted_recipes.name, recipes.name) AS name,  
          recipes.Recipe AS recipe_no
        FROM 
          recipes
        LEFT JOIN 
          inserted_recipes ON recipes.Recipe = inserted_recipes.Recipe
        WHERE 
          recipes.Recipe IN (${recipeNos});  -- Properly formatted and quoted
      `;
      
      // Log the query for debugging (optional)
      console.log('recipeQuery:', recipeQuery);
  
      // Fill recipe values
      
      // console.log('check1',recipeValues);
  // console.log('check2');
  const recipeIds:any = [];
      // Insert recipes and collect the IDs
      const recipeResult = await client.query(recipeQuery, recipeValues);
      console.log('check1',recipeResult.rows);
    batch.forEach((recipe) => {
      // console.log(recipe);
      recipeResult.rows.forEach((row) => {
        console.log('id',Number(row.id));
        if ( Number(row.id) > 0) {
          // console.log('check1',row.name);
          successfulBatch.push(recipe);
          recipeIds.push(row.id);
          successful.push(row.name);
          
        } else {
          duplicates.push(row.name);
        }
      })
    })
    console.log('check2',successfulBatch.length);
      //  = .map(row => row.id);
  // console.log('check3',recipeIds);
      // Prepare to insert steps for all recipes
      const stepValues: any[] = [];
      const stepExpression: any[] = [];

      // Fill step values
let stepIndex = 0
// let successCounter = 0;
if (successfulBatch.length > 0) {
  

      successfulBatch?.forEach((recipe, recipeIndex) => {
        recipe.step.forEach((step: any) => {
          // Push step values into the array
          stepValues.push(
            step.step_no,
            step.action,
            step.minutes,
            step.litres,
            step.rpm,
            step.temperature,
            step.PH,
            step.LR,
            step.TDS,
            step.TSS,
            recipeIds[recipeIndex] // Corresponding recipe ID
          );
      
          // Push the expression with correct indexed placeholders
          stepExpression.push(
            `($${stepIndex * 10 + 1}, $${stepIndex * 10 + 2}, $${stepIndex * 10 + 3}, $${stepIndex * 10 + 4}, $${stepIndex * 10 + 5}, $${stepIndex * 10 + 6}, $${stepIndex * 10 + 7}, $${stepIndex * 10 + 8}, $${stepIndex * 10 + 9}, $${stepIndex * 10 + 10}, $${stepIndex * 10 + 11})`
          );
      
          stepIndex++;
       

        // successCounter++;
        });
      });
    
       console.log(stepValues);
      // console.log(stepQueryPart);
      const stepQuery = `INSERT INTO steps (step_no, action, minutes, liters, RPM, centigrade, PH, LR, TDS, TSS, recipesid) 
                         VALUES ${stepExpression.join(', ')} RETURNING id, step_no;`;
// console.log(stepIndex);
//   console.log(stepValues);
//   console.log(stepExpression.length);
  console.log('check4')
      // Insert steps
     const stepResult = await client.query(stepQuery, stepValues);

    
  console.log('check4.5')

      // Collect all chemicals to insert concurrently
      const chemicalPromises = successfulBatch?.map((recipe, recipeIndex) => {
        return insertChemicalsInBatch(recipe.step, stepResult, recipeIds[recipeIndex],client);
      });
      
  console.log('check5')
      // Wait for all chemical insertions to complete
      await Promise.all(chemicalPromises);
    }
      // Track successful uploads
      successful.push(successfulBatch?.map(recipe => recipe.name));
    }
  
    // Commit transaction after all batches processed successfully
    await client.query('COMMIT');
  
console.log(successful);

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
  const insertChemicalsInBatch = async (steps: any[],stepResult: any, recipeId: number, client: any) => {
    const chemicalInsertData: any[] = [];
    const chemicalAssocInsertData: any[] = [];
  console.log('check5')
    steps.forEach((step) => {
      if (step.chemicals && step.chemicals.length > 0) {
        step.chemicals.forEach((chemical: any) => {
          // Prepare chemical for insert
          chemicalInsertData.push([chemical.recipe_name]);
        });
      }
    });
  console.log('check5.5')
    // Insert chemicals if they exist
    if (chemicalInsertData.length > 0) {
      const chemicalQuery = `INSERT INTO chemicals (name) 
                             VALUES ${chemicalInsertData.map((_, index) => `($${index + 1})`).join(', ')} 
                             ON CONFLICT (name) DO NOTHING RETURNING id , name;`;
      console.log('check6')
      const chemicalIdsResult = await client.query(chemicalQuery, chemicalInsertData);
      
      steps.forEach((step, index) => {
        if(step.step_no === stepResult.rows[index].step_no) {
          step.chemicals?.forEach((chemical: any, index: number) => {
            chemicalIdsResult.rows.forEach((chemicalResult:any, index:number) => {
              console.log('check6.5',chemicalIdsResult.rows[index])
              if(chemical.recipe_name === chemicalResult.name) {
                chemicalAssocInsertData.push([
                  stepResult.rows[index].id, // Use the recipe ID for association
                  chemicalResult.id, // Assuming name is the chemical ID, else map properly
                  chemical.percentage,
                  chemical.dosage
                ]);
              }
            })
            
          })
        }
        
      })

  // console.log('check7',chemicalIdsResult)
      // Prepare chemical association query
      if (chemicalAssocInsertData.length > 0) {
        const chemicalAssocQuery = `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage) 
                                     VALUES ${chemicalAssocInsertData.map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')}`;
        
        await client.query(chemicalAssocQuery, chemicalAssocInsertData);
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
