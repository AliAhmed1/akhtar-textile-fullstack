        // Step 1: Identify existing recipes
        import { prisma } from '@/lib/prisma';

        import { NextRequest, NextResponse } from 'next/server';
        
        
        // Initialize the PostgreSQL client
        
        
        
        // Handler for POST requests
        export async function POST(request: NextRequest) {
        
          let failed: any[] = [];
          let duplicates: any[] = [];
          let successful: any[] = []; 
        
          try {
        
            const {fileDataArray, BatchSize} = await request.json();
            // console.log('batchSize',BatchSize);
            // console.log('fileDataArray',fileDataArray);
            // Check if fileDataArray is an array (multiple recipes) or a single object (one recipe)
            const recipes = Array.isArray(fileDataArray) ? fileDataArray : [fileDataArray];
            // console.log('recipes',recipes.length);
          
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
                // console.log('existingRecords',existingRecords);
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
        
                // console.log('recipeResult',recipeResult);
              // });
        
              const newlyInsertedRecords = recipeResult.filter(
                (record) => !existingIds.has(record.id)
              );
              // console.log('newlyInsertedRecords',newlyInsertedRecords);
              const insertedRecipeIds = newlyInsertedRecords.map((record) => record);
        
              // Identify successful and duplicate recipes
              insertedRecipeIds.forEach((recipe) => {
        
                successful.push(recipe.name);
                const originalRecipe = batch.filter((r) => r.file_name === recipe.name);
                originalRecipe.map((r:any) => (r.id = recipe.id));
                originalRecipe && successfulBatch.push(...originalRecipe);
              });
        // console.log('successfulBatch',successfulBatch);
              const seenRecipes = new Set<string>();
              batch.forEach((recipe) => {
                if (!seenRecipes.has(recipe.file_name) && !successful.includes(recipe.file_name)) {
                  duplicates.push(recipe.file_name);
                  seenRecipes.add(recipe.file_name);
                }
              });
        
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
          
          // console.log('stepValues',stepValues);
          // console.log('check3',stepValues.length);
        
        const insertSteps = await prisma.steps.createMany({
          data: stepValues
        })
        
        const stepResult = await prisma.steps.findMany({
          where: {
            recipesid: { in: insertedRecipeIds.map((r) => r.id) },
        }
        });
        
        // console.log('stepResult',stepResult);
        
        
            
          console.log('check4.5')
        // console.log(stepResult.rows.filter((step) => step.recipesid === null));
              // Collect all chemicals to insert concurrently
              const chemicalPromises = successfulBatch?.map(async (recipe, recipeIndex) => {
                // console.log(step.recipesid)
                const recipesSteps = stepResult.filter( async (step) => step.recipesid === insertedRecipeIds[recipeIndex].id);
                console.log('filename',recipe.file_name);
                return await insertChemicalsInBatch(recipe.step, recipesSteps, prisma, recipe);
              });
              
        //       // Wait for all chemical insertions to complete
              await Promise.all(chemicalPromises);
        
            }
          },{timeout: 25000});
        // await prisma.$disconnect();
          }
            return NextResponse.json({sucess: false, message: {duplicates,successful} },{ status: 200 })
          } catch (error) {
            console.error('Error saving recipe data:', error);
            // Rollback transaction if error occurs
            // await client.query('ROLLBACK');
            return NextResponse.json({ success: false, message: failed }, { status: 500 });
          } finally {
            // await prisma.$disconnect();
          }
        
        }
          // Helper function to batch insert chemicals for steps
          const insertChemicalsInBatch = async (steps: any[],stepResult: any, prisma: any, recipe:any) => {
        
            let chemicalInsertData = steps.flatMap((step) => {
              // console.log(step.chemicals)
              if (step.chemicals && step.chemicals.length > 0) {
                return step.chemicals.map((chemical: any) => ({
          //         // Prepare chemical for insert
          name: chemical.recipe_name,
                })
              );
              }
            });
            chemicalInsertData = chemicalInsertData.filter((chemical) => chemical !== undefined); 
            // console.log('chemicalInsertData',chemicalInsertData);
        
          // console.log('check5.5')
          //   // Insert chemicals if they exist
            if (chemicalInsertData.length > 0) {
        
              const InsertChemical = await prisma.chemicals.createMany({
                data: chemicalInsertData,
                skipDuplicates: true
              });
              const uniqueChemicalNames = Array.from(new Set(chemicalInsertData.map((chemical) => chemical.name)))
              // console.log('uniqueChemicalNames',uniqueChemicalNames);
              const chemicalIdsResult = await prisma.chemicals.findMany({
                where: {
                  name: { in: uniqueChemicalNames },
                }
              });
              // console.log('chemicalIdsResult',chemicalIdsResult);
          const chemicalAssocInsertData:any[] = [];
               steps.forEach((step) => {
                // console.log('step check',step)
                stepResult.forEach((stepResult:any) =>{
                  // console.log('step result check',stepResult)
                if(step.step_id ===  Number(stepResult.step_id)) {   /// work needs to be done not populating
                  step.chemicals?.forEach((chemical: any, index: number) => {
                    // console.log('check',chemical);
                    chemicalIdsResult.forEach((chemicalResult:any, index:number) => {
                      // console.log('check6.5',chemicalResult)
                      if(chemical.recipe_name === chemicalResult.name) {
        
                        chemicalAssocInsertData.push( {
                          chemicalid: chemicalResult.id,
                          stepid: stepResult.id,
                          percentage: chemical.percentage,
                          dosage: chemical.dosage
                        }
                        );
                      }
                    })
                  });
                }
              })
              })
        
              
        
          // console.log('check7',chemicalAssocInsertData);
          console.log('filename', recipe.file_name);
          //     // Prepare chemical association query
              if (chemicalAssocInsertData.length > 0) {
        console.log('check8');
                const InsertChemicalAssociation = await prisma.chemical_association.createMany({
                  data: chemicalAssocInsertData
              });
        
                // console.log('check9',InsertChemicalAssociation);
            }
          }
          };