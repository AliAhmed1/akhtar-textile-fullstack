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
    console.log('access_levels',access_levels);
    console.log('body',body);
    let hashedPassword = "";
    if (password) {
     hashedPassword = await bcrypt.hash(password, 10);
     body.password = hashedPassword;
    }
    console.log('hashedPassword',hashedPassword);
    // Check if the user already exists
    if(id){
      await prisma.users.update({data:body,where:{id:BigInt(id)}});

        console.log("check1");
        // notCommonAccessLevels.map(async (level: any) => {
          await prisma.access_levels.deleteMany({where:{usersid:id}});
        // })
      // } 

      access_levels.map(async (level: any) => {
        const result = await prisma.access_levels.create({data:{usersid:id,accesslevels:level}});
        console.log('result',result);
      })
      return NextResponse.json({ message: 'User updated successfully' }, { status: 201 });
  }
  console.log('check2');
    delete body.id;

    body.password = hashedPassword;

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
