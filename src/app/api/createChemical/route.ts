import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server'
import { Pool } from 'pg'


export async function POST(request: Request) {
  
  try {
    // const body = await request.json();
    // Parse the request body
    const {
      id,
      name,
      full_name,    
      costPerKg,   
      kgPerCan,     
      costPerUnit,  
      costUom,      
      typeAndUse,   
      unitUsed,     
      unitConversion 
    } = await request.json()
let newChemical: {
  id: BigInt | null,
  name: string | null,
  full_name: string | null,
  cost_per_kg: Decimal | null, 
  kg_per_can: BigInt | null,
  cost_per_unit: Decimal | null,
  cost_uom: string | null,
  type_and_use: string | null,
  unit_used: string | null,
  unit_conversion: Decimal | null,
} = {
  id: null,
  name: '',
  full_name: null,
  cost_per_kg: null,
  kg_per_can: null,
  cost_per_unit: null,
  cost_uom: null,
  type_and_use: null,
  unit_used: null,
  unit_conversion: null
}

    // await prisma.$transaction(async (prisma) => {

      
     const existingChemicalResult = await prisma.chemicals.findUnique({where:{id:BigInt(id)}});
console.log('existingChemicalResult',existingChemicalResult);
    if (existingChemicalResult) {
      await prisma.chemicals.update({
        where: { id: existingChemicalResult.id },
        data: {
          name: name,
          full_name: full_name,
          cost_per_kg: parseFloat(costPerKg),
          kg_per_can: BigInt(kgPerCan),
          cost_per_unit: parseFloat(costPerUnit),
          cost_uom: costUom,
          type_and_use: typeAndUse,
          unit_used: unitUsed,
          unit_conversion: parseFloat(unitConversion)
        }
      })
      return NextResponse.json({success: true, message: 'chemical updated successfully' }, { status: 200 })
    }

    const values = {
      name:name,    
      full_name:full_name,
      cost_per_kg:parseFloat(costPerKg),   
      kg_per_can:BigInt(kgPerCan),     
      cost_per_unit:parseFloat(costPerUnit),  
      cost_uom:costUom,      
      type_and_use:typeAndUse,   
      unit_used:unitUsed,     
      unit_conversion:parseFloat(unitConversion)
    }
    console.log('existingChemicalResult',existingChemicalResult);
    const newChemnicalResult = await prisma.chemicals.create({
      data: values
    })
    newChemical = newChemnicalResult
  // });
  console.log('newChemical',newChemical);
    return NextResponse.json({
      success: true,
      message:'chemical created successfully'
    }, { status: 201 });
    

  } catch (error) {
    console.error('Error creating chemical:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  } finally {
    await prisma.$disconnect(); 
  }
}
