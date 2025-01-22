import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log('Received request for ID:', params.id);
// This APi is not being used
  const { id } = params;

  try {
    const numericId = id;

    // Fetch recipe details
    const recipeResult = await prisma.recipes.findUnique({
      where:{id:BigInt(id)},
      select:{id: true, load_size: true, machine_type: true, finish: true, fabric: true, recipe: true, fno: true, name: true}
    });

    // Fetch steps for the recipe
    if (recipeResult) {
    const stepsResult = await prisma.steps.findMany({
      where:{recipesid:BigInt(id)},
      select:{id: true, created_at: true, action: true, liters: true, rpm: true, centigrade: true, ph: true, lr: true, tds: true, tss: true, step_no: true, minutes: true, step_id: true}
    })
    stepsResult.sort((a, b) => Number(a.step_id) - Number(b.step_id));

    // Fetch chemical associations and chemicals
    const chemicalsResult = await prisma.chemical_association.findMany({
      select:{id: true, stepid: true, chemicalid: true, dosage: true, percentage: true,chemicals:{select:{name: true}}},
      where:{stepid: {in: stepsResult.map(step => step.id)}},
    })

      const recipe = recipeResult;
      const steps = stepsResult;
      const chemicals = chemicalsResult;
      // console.log("chemicals prints, ===>>> ", chemicals)
      // console.log("steps<<<<<<======", steps)
      const formattedRecipe = {
        ...recipe,
        id: recipe.id.toString(),
        load_size: recipe.load_size?.toString(),
        recipe: recipe.recipe?.toString(),
        steps: steps.map(step => ({
          ...step,
          id: step.id.toString(),
          step_id: step.step_id.toString(),
          liters: step.liters?.toString(),
          rpm: step.rpm?.toString(),
          centigrade: step.centigrade?.toString(),
          chemicals: chemicals.map(chemical => ({
            id: chemical.id.toString(),
            step_id: chemical.stepid?.toString(),
            chemical_id: chemical.chemicalid?.toString(),
            chemical_name: chemical.chemicals?.name,
            dosage: chemical.dosage,
            percentage: chemical.percentage
          })).filter(chemical => chemical.step_id === String(step.id))
          
        }))
      };
// console.log('formattedRecipe',formattedRecipe)
      return NextResponse.json(formattedRecipe);
    } else {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
