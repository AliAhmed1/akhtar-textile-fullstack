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
      <RecipeForm userId={userId?userId:""} logData={logData} action={action}/>
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
