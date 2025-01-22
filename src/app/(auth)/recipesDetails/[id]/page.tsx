import RecipeForm from "@/components/RecipeForm/RecipeForm";
import { prisma } from "@/lib/prisma";
import { log } from "console";
import { GetServerSideProps } from "next";
import { headers } from "next/headers";
import recipe from "../../recipe/page";
import { use } from "react";

// interface Props {
//   userId: string;
//   logData: any;
// }
interface HomePageProps {
  params: { id: string };
}

const HomePage: React.FC<HomePageProps> = async({params}) => {
  const {id} = params;
  const getRecipeDataById = async (id: string) => {
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
      return formattedRecipe;
  }
  }
  const recipeData = await getRecipeDataById(id);
  // console.log("recipeData",recipeData);
  console.log("id:>>>>>>>>>",id);
  const userId = headers().get('x-user-id');
const date = new Date();
const startDate = new Date(date.setUTCHours(0, 0, 0, 0));
const endDate = new Date(date.setUTCHours(23, 59, 59, 999));
console.log(">>>>",date);
const recipe = await prisma.recipes.findUnique({where:{id:BigInt(id)}});
const data = await prisma.recipe_log.findMany({where:{recipeFno:Number(recipe?.fno),created_at:{gte:startDate,lte:endDate}}});
const actionData = await prisma.steps.findMany({select:{action:true},distinct:["action"]});
const action = actionData.map((action) => {
  return {value: action.action, label: action.action}
});
const logData = data[data.length-1];


  return (
    <div>
      <RecipeForm userId={userId?userId:""} logData={logData} action={action} recipeData={recipeData}/>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
// const id = context.params?.id;
// console.log("id:>>",id);
//   const userId = context.req.headers['x-user-id'];
// console.log(">>>>>>",userId);  
// const date = new Date();
//   const logData = await prisma.recipe_log.findMany({where:{created_at:{equals:date}}});
//   return{
//     props:{
//       userId,
//       logData,
//     },
//   };
// };
export default HomePage;
