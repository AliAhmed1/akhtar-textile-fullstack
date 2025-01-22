// import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { steps } from '@prisma/client';
// import { message } from 'antd';


export async function POST(request: Request) {
    try {
        let message = "";
        const res = await request.json();
        
        let steps = res.steps;
        // console.log("steps====>>>>", steps);
        let chemicals = steps.filter((step: any) => step.chemicalId)
        .map((step: any) => {
                return{
                chemicalid: BigInt(step.chemicalId),
                dosage: step.dosage,
                percentage: step.percentage,
                step_id: step.step_id
            // }
            }

        });
        // console.log("chemicals====>>>>", chemicals);
        steps = steps.map((step: any) => {
            return{
                // id: step.id,
                step_no: step.step_no,
                action: step.action,
                minutes: step.minutes,
                liters: step.liters,
                rpm: step.rpm,
                centigrade: step.centigrade,
                step_id: step.step_id
            }
        })
        delete res.steps;
//         if(res?.id){
//         await prisma.recipes.upsert({
//             where:{ id: BigInt(res.id) },
//             update: res,
//             create: res
//         });
// console.log("check1",steps);
//         if (steps) {
//             console.log("check2");
//             const stepPromises = steps.map((step: any) => //seperate chemicals for fix
//                 // console.log("check3");
//                   prisma.steps.upsert({
//                     where: { id: BigInt(step.id) },
//                     update: step,
//                     create: step
//                 })

//                 // if (stepResult.id){
//                 // console.log("stepResult", stepResult)
//                 // }
//                 // return stepResult;
//             )
//                 await Promise.all(stepPromises);
//                 const chemicalPromise = chemicals.map( (chemicals: any,index: number) => 
//                     chemicals[index] = {
//                         chemicalid: chemicals.chemicalid,
//                         stepid: BigInt(chemicals.stepid),
//                         dosage: chemicals.dosage,
//                         percentage: chemicals.percentage,
//                         id:BigInt(chemicals.id)
//                         // id: chemicals.id
//                     }
//                 )
//                 await Promise.all(chemicalPromise);
//                 console.log("check5.3",chemicalPromise);
//                 chemicals = null;
//                 chemicals = chemicalPromise;
//                 console.log("check 6")
//                 const deletedChemicals = await prisma.chemical_association.deleteMany({where: {id: {in: chemicals.map((chemical:any) => chemical.id)}}});
//                 console.log("check 7",deletedChemicals)
//                 if(deletedChemicals.count>0){
//                     console.log("check 7.1")
//                     const newAssociation = await prisma.chemical_association.createMany({data: chemicals})
//                     console.log("check 8",newAssociation);
//                 }
//             }
//             message = "Recipe updated successfully";
//         }
//         else{
// console.log("check4");
      message = await SaveUploadedRecipe(steps, chemicals, res);
    //   console.log("message",message);
    // }
    return NextResponse.json( { success: true, message: message });
    } catch (error) {
        console.error('Error saving recipe data:', error);
        return NextResponse.json({ success: false, message: 'Failed to save recipe data' });
    }
}


const SaveUploadedRecipe = async (steps: any, chemicals: any, res: any) => {
    let result:any = undefined;
    const check = await prisma.recipes.findFirst({ where: { recipe: res.recipe }, select: { id: true } });

    if (!check) {
    result = await prisma.recipes.create({
        data: res
    });
}

    if (steps) {

        if(check){
            const stepResults = await prisma.steps.findMany({where:{recipesid:check.id}, select:{id: true}});
            const result = await prisma.steps.deleteMany({where:{recipesid:check.id}});

        }
        
        const stepPromises = steps.map((step: any) => 
             prisma.steps.create({
                data: {...step, recipesid: result !== undefined ? result.id : check?.id}
            })
        )
            await Promise.all(stepPromises);
            const stepResults = await prisma.steps.findMany({where:{recipesid:result !== undefined ? result.id : check?.id}});

            for (const stepResult of stepResults) {
                chemicals.forEach((chemical: any, index: number) => {

                if (Number(stepResult.step_id) === Number(chemical.step_id)) {

                    chemicals[index].stepid = stepResult.id
                }

            })
        }

        const chemicalPromise = chemicals.map( (chemicals: any,index: number) => 
            chemicals[index] = {
                chemicalid: chemicals.chemicalid,
                stepid: chemicals.stepid,
                dosage: chemicals.dosage,
                percentage: chemicals.percentage,

            }
        )
        await Promise.all(chemicalPromise);
        chemicals = null;
        chemicals = chemicalPromise;

            const chemicalsResult = await prisma.chemical_association.createMany({
                data: chemicals
            })

    }


    return "Recipe updated saved successfully"
    
}



