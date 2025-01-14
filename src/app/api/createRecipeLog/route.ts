import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    
    try {
        const body:{data:any,recipeChemicals:any} = await req.json();
    const chemicals = await prisma.chemicals.findMany({where:{id:{in:body.recipeChemicals.map((step:any) => step.chemicalId)}}});
    const update = body.recipeChemicals.map(async(step: any) => {
        let dosage = step.dosage/1000;
        let chemical = chemicals.find((chemical: any) => chemical.id === BigInt(step.chemicalId));
        let req = chemical?.requirement ? chemical.requirement : 0;
        let requirement = chemical?.requirement ? Number(chemical.requirement) + Number(dosage) : dosage; 
        if(chemical){
            const convertedRequirement: Decimal = new Decimal(requirement);
        chemical.requirement = convertedRequirement;
        let order = Number(chemical.requirement) - Number(chemical.total);
        const convertedOrder: Decimal = new Decimal(order);
        chemical.order = convertedOrder;
        }
    });

        await Promise.all(update);

        chemicals.map(async (chemical: any) => {await prisma.chemicals.update({where:{id:chemical.id}, data: chemical})});
        const result = await prisma.recipe_log.create({ data: body.data });

        return NextResponse.json({ message: 'Recipe log created successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 
