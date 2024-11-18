import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {

  try {
    // Parse the request body
    const body = await request.json();
    const {id, username, password, name, account, bank, cnic, code, department, designation, manager, phone, accesslevels } = body;
  const access_levels = accesslevels;
    delete body.accesslevels;
    
    console.log('body',body);

    const hashedPassword = await bcrypt.hash(password, 10);
    // Check if the user already exists
    if(id !== undefined){
      await prisma.users.update({where:{id:id},data:{username:username,password:hashedPassword,name:name,account:account,bank:bank,cnic:cnic,code:code,department:department,designation:designation,manager:manager,phone:phone}})
      const existingAccessLevels = await prisma.access_levels.findMany({where:{usersid:id},select:{accesslevels:true}});
      const notCommonAccessLevels = access_levels.filter((level: any) => existingAccessLevels.some((existingLevel) => existingLevel.accesslevels !== level));
      // const commonAccessLevels = access_levels.filter((level: any) => existingAccessLevels.some((existingLevel) => existingLevel.accesslevels === level));

      if (notCommonAccessLevels.length > 0) {
        notCommonAccessLevels.map(async (level: any) => {
          await prisma.access_levels.deleteMany({where:{usersid:id,accesslevels:level}});
        })
      } 

      access_levels.map(async (level: any) => {
        await prisma.access_levels.create({data:{usersid:id,accesslevels:level}});
      })
      return NextResponse.json({ message: 'User updated successfully' }, { status: 201 });
  }
    delete body.id;

    const newUserResult = await prisma.users.create({
      data: body
    });
    const newUser = newUserResult;
    const userId = newUser.id;
   
    const accessLevelInsertPromises = access_levels.map(async (level:any) => {
      return await prisma.access_levels.create({ data: { usersid: userId, accesslevels: level } });
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } 
}
