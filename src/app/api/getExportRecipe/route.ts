import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
export async function GET(request:any) {
    let stepsResult:any;
    let chemicalsResult:any;
    let chemicalsAssocResult:any;

    try{
        const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return new NextResponse('Start date and end date are required', { status: 400 });
    }    
    let recipesResult = await prisma.recipes.findMany({where: {created_at: {gte: new Date(startDate), lte: new Date(new Date(endDate).setHours(23, 59, 59))}}});


    stepsResult = await prisma.steps.findMany({where: {recipesid: {in: recipesResult.map((recipe: any) => recipe.id)}}});
    chemicalsResult = await prisma.chemicals.findMany();
    chemicalsAssocResult= await prisma.chemical_association.findMany({where: {stepid: {in: stepsResult.map((step: any) => step.id)}}});
  
    recipesResult = recipesResult.map((recipe: any) => ({
      ...recipe,
      id: recipe.id.toString(),
      load_size: recipe.load_size.toString(),
      recipe: recipe.recipe.toString(),
    }));

    stepsResult = stepsResult.map((step: any) => ({
      ...step,
      id: step.id.toString(),
      liters: step.liters.toString(),
      rpm: step.rpm.toString(),
      centigrade: step.centigrade.toString(),
      recipesid: step.recipesid.toString(),
      step_id: step.id.toString(),
    }));
    chemicalsResult = chemicalsResult.map((chemical: any) => ({
      ...chemical,
      id: chemical.id.toString(),
      kg_per_can: chemical.kg_per_can? chemical.kg_per_can.toString(): null,
      cost_per_unit: chemical.cost_per_unit? chemical.cost_per_unit.toString(): null,
      unit_conversion: chemical.unit_conversion? chemical.unit_conversion.toString():null,
      cost_per_kg: chemical.cost_per_kg? chemical.cost_per_kg.toString():null,
    }));

    chemicalsAssocResult = chemicalsAssocResult.map((chemical: any) => ({
      ...chemical,
      id: chemical.id.toString(),
      percentage: chemical.percentage.toString(),
      dosage: chemical.dosage.toString(),
      stepid: chemical.stepid.toString(),
      chemicalid: chemical.chemicalid.toString(),
    }));

    return NextResponse.json({success: true, files: {stepsResult,chemicalsResult,chemicalsAssocResult,recipesResult},status: 200}, {headers: {'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'}});
    } catch (error) {
        console.error('Failed to export recipes:', error);
        return new NextResponse('Error exporting recipes', { status: 500 });
      }
}