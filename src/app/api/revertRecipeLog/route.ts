import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { message } from "antd";
import { NextResponse } from "next/server";

export async function PUT (req: Request) {
    const body = await req.json();
    console.log("body",body);
    const { searchParams: params } = new URL(req.url); // Parse query parameters
  const id = params.get("id");

    try{
            const chemicals = await prisma.chemicals.findMany({where:{id:{in:body.map((step:any) => step.chemicalId)}}});
            const update = body.map(async(step: any) => {
                let dosage = step.dosage/1000;
                let chemical = chemicals.find((chemical: any) => chemical.id === BigInt(step.chemicalId));
                let req = chemical?.requirement ? chemical.requirement : 0;
                let requirement = chemical?.requirement ? Number(chemical.requirement) - Number(dosage) : dosage;
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
        if(id){
        const result = await prisma.recipe_log.update({where:{id:BigInt(id)},data:{status:"reverted"}});
    }
        return NextResponse.json({ message: 'Recipe Reverted successfully' }, { status: 200 });
    } catch (error) {    
        return NextResponse.json({ message: 'Failed to revert recipe', error}, { status: 500 });
    }
}