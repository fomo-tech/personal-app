import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Account } from '@/lib/models/Account';
import { Transaction } from '@/lib/models/Transaction';

export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await Account.find({}).sort({ createdAt: -1 });
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, type, balance } = body;
    
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    const newAccount = await Account.create({
      name,
      type,
      balance: Number(balance) || 0
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // Delete associated transactions first
    await Transaction.deleteMany({ accountId: id });
    await Transaction.deleteMany({ toAccountId: id });
    
    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account and associated transactions deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
