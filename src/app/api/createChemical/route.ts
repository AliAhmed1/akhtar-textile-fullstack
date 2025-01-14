import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server'
import { parse } from 'path';

export async function POST(request: Request) {
  
  try {
    const requestBody = await request.json()
    console.log('requestBody',requestBody);

// let newChemical: {
//   id: BigInt | null,
//   name: string | null,
//   full_name: string | null,
//   cost_per_kg: Decimal | null, 
//   kg_per_can: BigInt | null,
//   cost_per_unit: Decimal | null,
//   cost_uom: string | null,
//   type_and_use: string | null,
//   unit_used: string | null,
//   unit_conversion: Decimal | null,
// } = {
//   id: null,
//   name: '',
//   full_name: null,
//   cost_per_kg: null,
//   kg_per_can: null,
//   cost_per_unit: null,
//   cost_uom: null,
//   type_and_use: null,
//   unit_used: null,
//   unit_conversion: null
// }

    for(const body of requestBody[0]){
      // const values = {
      //   name: body.name,    
      //   full_name: body.full_name,
      //   cost_per_kg: parseFloat(body.costPerKg),   
      //   kg_per_can: BigInt(body.kgPerCan),     
      //   cost_per_unit: parseFloat(body.costPerUnit),  
      //   cost_uom: body.costUom.toString(),      
      //   type_and_use: body.typeAndUse,   
      //   unit_used: body.unitUsed,     
      //   unit_conversion:parseFloat(body.unitConversion),
      //   free: parseFloat(body.free),
      //   on_order: parseFloat(body.onOrder),
      //   total: parseFloat(body.total),
      //   requirement: parseFloat(body.requirement),
      //   order: parseFloat(body.order),
      //   boxes: parseFloat(body.boxes),
      //   cost: parseFloat(body.cost),
      // }
      if(body.id){
     const existingChemicalResult = await prisma.chemicals.findUnique({where:{id:BigInt(body.id)}});
console.log('existingChemicalResult',existingChemicalResult);
console.log('body',body);
    if (existingChemicalResult) {
      await prisma.chemicals.update({
        where: { id: existingChemicalResult.id },
        data: body
      })
      return NextResponse.json({success: true, message: 'chemical updated successfully' }, { status: 200 })
    }
  }
    
    // console.log('existingChemicalResult',existingChemicalResult);
    const newChemnicalResult = await prisma.chemicals.upsert({
      where:{ name: body.name},
      update: body,
      create: body
    });

}
    return NextResponse.json({
      message:'chemical created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating chemical:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect(); 
  }
}
