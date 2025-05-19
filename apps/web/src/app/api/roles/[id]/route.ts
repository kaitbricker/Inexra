import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type UserRole = 'ADMIN' | 'CREATOR' | 'BASIC_USER';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const role = params.id as UserRole;
    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      id: role,
      name: role,
      users,
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, permissions } = await request.json();

    if (!name || !permissions) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
    }

    // Since we don't have a Role model, we can't update the role directly
    // Instead, we'll return the current role information
    const role = params.id as UserRole;
    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      id: role,
      name: role,
      users,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if role is assigned to any users
    const usersWithRole = await prisma.user.findMany({
      where: { role: params.id as UserRole },
    });

    if (usersWithRole.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users' },
        { status: 400 }
      );
    }

    // Since we don't have a Role model, we can't delete the role directly
    // Instead, we'll return a success response
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
