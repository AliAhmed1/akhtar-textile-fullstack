import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { steps } from '@prisma/client';
// import { steps } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.NEXT_PUBLIC_DATABASE_URL });

export async function POST(request: Request) {
    try {
        const res = await request.json();
        
        // console.log("res====>>>>", res)
        let steps = res.steps;
        console.log("steps====>>>>", steps);
        let chemicals = steps.filter((step: any) => step.chemicalId)
        .map((step: any) => {
            // return{
            // if(step.chemicalId){
                return{
                chemicalid: BigInt(step.chemicalId),
                stepid: step.id,
                dosage: step.dosage,
                percentage: step.percentage,
                id: step.chemicalAssociationId,
                step_id: step.step_id
            // }
            }

        });
        console.log("chemicals====>>>>", chemicals);
        steps = steps.map((step: any) => {
            return{
                id: step.id,
                step_no: step.step_no,
                action: step.action,
                minutes: step.minutes,
                liters: step.liters,
                rpm: step.rpm,
                centigrade: step.centigrade,
                step_id: step.step_id
            }
        })
        // console.log("steps====>>>>", steps);
        // console.log("chemicals====>>>>", chemicals);
        delete res.steps;
        if(res?.id){
        await prisma.recipes.upsert({
            where:{ id: BigInt(res.id) },
            update: res,
            create: res
        });
console.log("check1",steps);
        if (steps) {
            console.log("check2");
            const stepPromises = steps.map((step: any) => //seperate chemicals for fix
                // console.log("check3");
                  prisma.steps.upsert({
                    where: { id: BigInt(step.id) },
                    update: step,
                    create: step
                })

                // if (stepResult.id){
                // console.log("stepResult", stepResult)
                // }
                // return stepResult;
            )
                await Promise.all(stepPromises);
                const chemicalPromise = chemicals.map( (chemicals: any,index: number) => 
                    chemicals[index] = {
                        chemicalid: chemicals.chemicalid,
                        stepid: BigInt(chemicals.stepid),
                        dosage: chemicals.dosage,
                        percentage: chemicals.percentage,
                        id:BigInt(chemicals.id)
                        // id: chemicals.id
                    }
                )
                await Promise.all(chemicalPromise);
                console.log("check5.3",chemicalPromise);
                chemicals = null;
                chemicals = chemicalPromise;
                console.log("check 6")
                const deletedChemicals = await prisma.chemical_association.deleteMany({where: {id: {in: chemicals.map((chemical:any) => chemical.id)}}});
                console.log("check 7",deletedChemicals)
                if(deletedChemicals.count>0){
                    console.log("check 7.1")
                    const newAssociation = await prisma.chemical_association.createMany({data: chemicals})
                    console.log("check 8",newAssociation);
                }
            }
        }
        else{
// console.log("check4");
        const result = await prisma.recipes.create({
            data: res
        });
        // console.log("check5");
        if (steps) {
            const stepPromises = steps.map((step: any) => 
                 prisma.steps.create({
                    data: {...step, recipesid: result.id}
                })
            )
                await Promise.all(stepPromises);
                const stepResults = await prisma.steps.findMany({where:{recipesid:BigInt(result.id)}});
                // console.log("stepResults>>>>>>>>>>>>>>>>>>>>", stepResults[0]);
                for (const stepResult of stepResults) {
                    chemicals.forEach((chemical: any, index: number) => {
                    if (Number(stepResult.step_id) === chemical.step_id) {
                        chemicals[index].stepid = stepResult.id
                    }
                })
            }
            // console.log("check5.3",chemicals);
            const chemicalPromise = chemicals.map( (chemicals: any,index: number) => 
                chemicals[index] = {
                    chemicalid: chemicals.chemicalid,
                    stepid: chemicals.stepid,
                    dosage: chemicals.dosage,
                    percentage: chemicals.percentage,
                    // id: chemicals.id
                }
            )
            await Promise.all(chemicalPromise);
            // console.log("check5.3",chemicalPromise);
            chemicals = null;
            chemicals = chemicalPromise;
                const chemicalsResult = await prisma.chemical_association.createMany({
                    data: chemicals
                })

        }
    }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving recipe data:', error);
        return NextResponse.json({ success: false, message: 'Failed to save recipe data' });
    } finally {
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
