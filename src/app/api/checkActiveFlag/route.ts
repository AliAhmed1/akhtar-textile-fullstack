
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { data } = await request.json();
    console.log("Check A ",data);
    console.log("Check A.1 ",data.successfulBatch.length);
    if(data.successfulBatch.length > 0) {
     data.successfulBatch.forEach(async (file: any) => {
        const exist = await prisma.recipes.findMany({ where: { fno: String(file.Fno) } });
        exist.pop();
    console.log("Check B ",exist);
    if(exist.length > 0) {
console.log("Check B.1: ",exist);
          const result = await prisma.recipes.updateMany({
            where: {
              id: {
                in: exist.map((recipe: any) => recipe.id) // Use map to extract an array of IDs
              }
            },
            data: {
              active_flag: "N"
            }
          });
          
        //   const result = await client.query('UPDATE recipes SET active_flag = $1 WHERE id = $2', ["N", String(exist.[i].id)]);
          console.log("Check C ",result)
    //     }
    // }
  }
  console.log("Check D");
    });
    }
    return NextResponse.json({success: true},{
        status: 200});
}
// const flagCheck = async (client: any, recipe:any) => {
//     console.log("Check A",recipe.Fno);
//     const exist = await client.query('SELECT * FROM recipes WHERE fno = $1', [String(recipe.Fno)]);
//     console.log("Check B",exist.rows);
//     if(exist.rows.length > 0) {
//       for(let i = 0; i < exist.rows.length-1; i++) {
//         if(exist.rows[i].active_flag === "Y") {
//           // exist.rows[i].active_flag = "N";
//           const result = await client.query('UPDATE recipes SET active_flag = $1 WHERE id = $2', ["N", String(exist.rows[i].id)]);
//           console.log("Check C",result)
//         }
//     }
//   }
//   console.log("Check D");
//     // r.forEach(async (recipe: any) => {
//     //   console.log('check9')
//     //   const data = await client.query('SELECT * FROM recipes WHERE fno = $1', [String(recipe.Fno)]);
//     //   console.log('check10', data.rows)
//     //   if (data.rows.length > 0) {
//     //     data.rows.forEach((row: any) => {
//     //       console.log('check11',row.active_flag)
//     //       if(row.active_flag === "Y") {
//     //         row.active_flag = "N";
//     //     }});
//     //   // }
//     //     console.log('check11',data.rows[0].flag)
//     //     // recipe.flag = 1;
//     //   }
//     // });
//   };