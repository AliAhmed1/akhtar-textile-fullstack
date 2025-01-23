import Dashboard from "@/components/dashboard/dashboard";
import { prisma } from "@/lib/prisma";
import { trimText } from "@/utils/trimText";


const dashboard = async () => {
  const recentRecipes = await prisma.recipes.findMany({select:{fno: true, finish: true, created_at: true}, orderBy: { created_at: 'desc' },take: 3});
  const nexusSuccess = await prisma.nxs_success_records.findMany({select:{invoice_number: true, booking_number: true, timestamp: true}, orderBy: { timestamp: 'desc' },take: 3});
  const damcoExecuteSuccess = await prisma.dmc_success_records.findMany({select:{country: true, po_number: true, timestamp: true}, orderBy: { timestamp: 'desc' },take: 3});
  console.log('nexusSuccess',nexusSuccess);
  console.log('damcoExecuteSuccess',damcoExecuteSuccess);
  recentRecipes.map((recipe: any) => {
    recipe.title = `${recipe.finish} ${recipe.fno}`;
    const text = trimText(recipe.title, 26);
    recipe.title = text
  })
  console.log('recipeRecipes',recentRecipes);
  return (
    <div>
      <Dashboard recentRecipes={recentRecipes} damcoExecuteSuccess={damcoExecuteSuccess} nexusSuccess={nexusSuccess}/>
    </div>
  );
};

export default dashboard;
