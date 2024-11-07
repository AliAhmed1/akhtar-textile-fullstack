import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  let failed: any[] = [];
  let duplicates: any[] = [];
  let successful: any[] = [];

  try {
    // Parse the JSON body
    const { fileDataArray, BatchSize } = await request.json();
    const recipes = Array.isArray(fileDataArray) ? fileDataArray : [fileDataArray];

    // Begin transaction for all uploads
    await prisma.$transaction(async (prisma) => {
      for (let i = 0; i < recipes.length; i += BatchSize) {
        const batch = recipes.slice(i, i + BatchSize);
        const recipeData = batch.map(recipe => ({
          load_size: recipe.load_size,
          machine_type: recipe.machine_type,
          finish: recipe.finish,
          fabric: recipe.fabric,
          recipe: recipe.recipe_no,
          fno: String(recipe.Fno),
          name: recipe.file_name
        }));

        // Insert or skip duplicates based on `recipe_no`
        const insertedRecipes = await prisma.recipes.createMany({
          data: recipeData,
          skipDuplicates: true,
        });

        const recipeIds = await prisma.recipes.findMany({
          where: { recipe: { in: batch.map(r => r.recipe_no) } },
          select: { id: true, name: true, recipe: true },
        });

        const successfulBatch = recipeIds.map((row) => {
          successful.push(row.name);
          return batch.find((recipe) => recipe.file_name === row.name);
        }).filter(Boolean);
// console.log('successfulBatch',successfulBatch);
        if (successfulBatch.length > 0) {
          for (const recipe of successfulBatch) {
            // console.log('recipe', recipeIds);
            const stepsData = recipe.step.map((step: any) => ({
              step_no: String(step.step_no),
              action: step.action,
              minutes: String(step.minutes),
              liters: step.litres,
              rpm: step.rpm,
              centigrade: step.temperature,
              ph: String(step.PH),
              lr: String(step.LR),
              tds: String(step.TDS),
              tss: String(step.TSS),
              recipesid: recipeIds.find((r) => Number(r.recipe) === recipe.recipe_no)?.id,
              step_id: step.step_id,
            }));

            const insertedSteps = await prisma.steps.createMany({
              data: stepsData,
            });

            const steps = await prisma.steps.findMany({
              where: { recipesid: recipeIds.find((r) => Number(r.recipe) === recipe.recipe_no)?.id },
            });
console.log('steps',steps)
            await insertChemicalsInBatch(recipe.step, steps, recipe);
          }
        }

        // Track duplicates based on `recipe_no`
        const seenFiles = new Set();
        batch.forEach((recipe) => {
          if (successful.length === 0 || successful.every(successfulFile => recipe.file_name !== successfulFile)) {
            if (!seenFiles.has(recipe.file_name)) {
              duplicates.push(recipe.file_name);
              seenFiles.add(recipe.file_name);
            }
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: { duplicates, successful } }, { status: 200 });
  } catch (error) {
    console.error('Error saving recipe data:', error);
    return NextResponse.json({ success: false, message: failed }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to batch insert chemicals for steps
async function insertChemicalsInBatch(steps: any[], stepResult: any, recipe: any) {
  const chemicalInsertData: any[] = [];
  const chemicalAssocInsertData: any[] = [];

  // Filter and add only steps that contain chemicals
  const stepsWithChemicals = steps.filter((step) => step.chemicals && step.chemicals.length > 0);

  stepsWithChemicals.forEach((step) => {
    step.chemicals.forEach((chemical: any) => {
      chemicalInsertData.push({
        name: chemical.recipe_name,
      });
    });
  });

  // Insert chemicals and get their IDs, skipping duplicates
  if (chemicalInsertData.length > 0) {
    await prisma.chemicals.createMany({
      data: chemicalInsertData,
      skipDuplicates: true,
    });
  }

  // Fetch IDs for the inserted chemicals
  const chemicalIds = await prisma.chemicals.findMany({
    where: { name: { in: chemicalInsertData.map(c => c.name) } },
  });
  console.log('chemical id', chemicalIds);

  // Process steps with chemicals only
  for (const step of stepsWithChemicals) {
    const matchedStep = stepResult.find((s: any) => Number(s.step_id) === step.step_id);
    if (matchedStep) {
      step.chemicals.forEach((chemical: any) => {
        const chemicalId = chemicalIds.find((c) => c.name === chemical.recipe_name)?.id;
        if (chemicalId) {
          chemicalAssocInsertData.push({
            chemicalid: chemicalId,
            percentage: chemical.percentage,
            dosage: chemical.dosage === "None" ? null : chemical.dosage,
            stepid: matchedStep.id,
          });
        }
      });
    }
  }

  // Insert into chemical_association table only if there's data
  if (chemicalAssocInsertData.length > 0) {
    await prisma.chemical_association.createMany({
      data: chemicalAssocInsertData,
    });
  }
}
