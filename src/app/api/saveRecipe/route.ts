import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.NEXT_PUBLIC_PGADMIN_DB_URL });

export async function POST(request: Request) {
    const client = await pool.connect();
    try {
        const res = await request.json();
        
        console.log("res====>>>>", res)
        let recipe1 = {
            fileName: res.fileName,
            loadSize: res.loadSize,
            machineType: res.machineType,
            finish: res.finish,
            fabric: res.fabric,
            fno: res.fno,
            recipe: res.recipe
        };


        let steps = res.steps;
        
        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO recipes (load_size, machine_type, finish, fabric, recipe, fno, name)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [recipe1.loadSize, recipe1.machineType, recipe1.finish, recipe1.fabric, recipe1.recipe, recipe1.fno, recipe1.fileName]
        );
        const recipeId = result.rows[0].id;
        
        for (const step of steps) {
            console.log("", step)
            const stepResult = await client.query(
                `INSERT INTO steps (action, liters, rpm, centigrade, ph, tds, tss, recipesid, step_no, minutes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                [step.action, step.litres, step.rpm, step.temperature, step.ph, step.tds, step.tss, recipeId, step.step_no, step.minutes]
            );
            const stepId = stepResult.rows[0].id;

            for (const chemical of step.chemicals) {
                
                const chemicalResult = await client.query(
                    `INSERT INTO chemicals (name)
                     VALUES ($1) RETURNING id`, 
                    [chemical.recipe_name]
                );
                const chemicalId = chemicalResult.rows[0].id;
                await client.query(
                    `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage)
                     VALUES ($1, $2, $3, $4)`,
                    [stepId, chemicalId, chemical.percentage, chemical.dosage]
                ); 
            }
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving recipe data:', error);
        return NextResponse.json({ success: false, message: 'Failed to save recipe data' });
    } finally {
        client.release();
    }
}





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
//     console.log(fullData)
//     const recipe = fullData; // No need for .map if not modifying

//       // Save recipe
//     const result = await client.query(
//     `INSERT INTO recipes (Load_Size, Machine_Type, Finish, Fabric, Recipe, FNO, name)
//         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
//     [recipe.load_size, recipe.machine_type, recipe.finish, recipe.fabric, recipe.recipe_no, recipe.fno, recipe.file_name]
//     );
//     const recipeId = result.rows[0].id;

//       // Loop through the steps within each recipe
//     for (const step of recipe.step) {
//     const stepResult = await client.query(
//         `INSERT INTO steps (action, liters, RPM, centigrade, PH, TDS, TSS, recipesid)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//         [step.action, step.litres, step.rpm, step.temperature, step.PH, step.TDS, step.TSS, recipeId]
//     );
//     const stepId = stepResult.rows[0].id;
//     console.log("step.chemicals", step.chemicals)

//     for (const chemical of step.chemicals) {
                
//         const chemicalResult = await client.query(
//             `INSERT INTO chemicals (name)
//              VALUES ($1) RETURNING id`, 
//             [chemical.recipe_name]
//         );
//     // Check if chemicals exist in the step before attempting to save them
    
//         const chemicalId = chemicalResult.rows[0].id;
//         await client.query(
//             `INSERT INTO chemical_association (stepid, chemicalid, percentage, dosage)
//             VALUES ($1, $2, $3, $4)`,
//             [stepId, chemicalId, chemical.percentage, chemical.dosage]
//         ); 
    
//     // if (step.chemicals && step.chemicals.length > 0) {
//     //     for (const chemical of step.chemicals) {
//     //     await client.query(
//     //         `INSERT INTO chemical_association (chemicalid, stepid, percentage, dosage)
//     //         VALUES ($1, $2, $3, $4)`,
//     //         [chemical.id, stepId, chemical.percentage, chemical.dosage]
//     //     );
//     //     }
//     }
//     }
    
    
//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error('Error saving recipe data:', error);
//     return NextResponse.json({ success: false, message: 'Failed to save recipe data' }, { status: 500 });
//   }
// }


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
//         `INSERT INTO recipes (Load_Size, Machine_Type, Finish, Fabric, Recipe, FNO, name)
//          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
//         [recipe.load_size, recipe.machine_type, recipe.finish, recipe.fabric, recipe.recipe_no, recipe.fno, recipe.file_name]
//       );
      
//       const recipeId = result.rows[0].id;

//       // Loop through the steps within each recipe
//       for (const step of recipe.step) {
//         // Save each step to the 'steps' table
//         const stepResult = await client.query(
//           `INSERT INTO steps (action, liters, RPM, centigrade, PH, TDS, TSS, recipesid)
//            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//           [step.action, step.litres, step.rpm, step.temperature, step.PH, step.TDS, step.TSS, recipeId]
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
