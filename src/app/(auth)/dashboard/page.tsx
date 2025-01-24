import Dashboard from "@/components/dashboard/dashboard";
import { prisma } from "@/lib/prisma";
import { trimText } from "@/utils/trimText";


const dashboard = async () => {
  const recentRecipes = await prisma.recipes.findMany({select:{fno: true, finish: true, created_at: true}, orderBy: { created_at: 'desc' },take: 3});
  const nexusSuccess = await prisma.nxs_success_records.findMany({select:{invoice_number: true, booking_number: true, timestamp: true}, orderBy: { timestamp: 'desc' },take: 3});
  const damcoExecuteSuccess = await prisma.dmc_success_records.findMany({select:{country: true, po_number: true, timestamp: true}, orderBy: { timestamp: 'desc' },take: 3});
  const chemicals = await prisma.chemicals.findMany({select:{name:true, created_at: true, unit_used: true, on_order: true, total: true, boxes: true}, orderBy: { created_at: 'desc' }});
  // chemicals.forEach((chemical: any, index: number) => {
  //   chemicals[index].on_order = String(chemicals[index].on_order)
  // })
  const chemicalsList = chemicals.map((chemical: any) => {
    return {
       name: chemical.name,
       on_order: String(chemical.on_order),
       unit_used: String(chemical.unit_used),
       total: String(chemical.total),
       boxes: String(chemical.boxes)
    }
  })
  console.log('chemicalsList',chemicalsList);
  // console.log('nexusSuccess',nexusSuccess);
  // console.log('damcoExecuteSuccess',damcoExecuteSuccess);
  recentRecipes.map((recipe: any) => {
    recipe.title = `${recipe.finish} ${recipe.fno}`;
    const text = trimText(recipe.title, 26);
    recipe.title = text
  })
  console.log('recipeRecipes',recentRecipes);
  return (
    <div>
      <Dashboard recentRecipes={recentRecipes} damcoExecuteSuccess={damcoExecuteSuccess} nexusSuccess={nexusSuccess} chemicals={chemicalsList}/>
    </div>
  );
};

export default dashboard;
