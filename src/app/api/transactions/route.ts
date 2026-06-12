import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Transaction } from '@/lib/models/Transaction';
import { Account } from '@/lib/models/Account';

export async function GET() {
  try {
    await connectToDatabase();
    // Populate account names for UI display
    const transactions = await Transaction.find({})
      .populate('accountId', 'name')
      .populate('toAccountId', 'name')
      .sort({ date: -1, createdAt: -1 });

    const formattedTransactions = transactions.map((t: any) => {
      const obj = t.toObject();
      return {
        ...obj,
        accountName: obj.accountId?.name || 'Tài khoản đã xóa',
        toAccountName: obj.toAccountId?.name || undefined
      };
    });

    return NextResponse.json(formattedTransactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { accountId, toAccountId, type, amount, category, date, description } = body;

    if (!accountId || !type || amount === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    // 1. If type is transfer, require toAccountId
    if (type === 'transfer' && !toAccountId) {
      return NextResponse.json({ error: 'Destination account is required for transfers' }, { status: 400 });
    }

    // 2. Adjust account balances
    if (type === 'income') {
      const account = await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: numericAmount } },
        { new: true }
      );
      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    } else if (type === 'expense') {
      const account = await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: -numericAmount } },
        { new: true }
      );
      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    } else if (type === 'transfer') {
      if (accountId === toAccountId) {
        return NextResponse.json({ error: 'Source and destination accounts must be different' }, { status: 400 });
      }
      
      // Deduct from source
      const srcAccount = await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: -numericAmount } },
        { new: true }
      );
      if (!srcAccount) return NextResponse.json({ error: 'Source account not found' }, { status: 404 });

      // Add to destination
      const destAccount = await Account.findByIdAndUpdate(
        toAccountId,
        { $inc: { balance: numericAmount } },
        { new: true }
      );
      if (!destAccount) {
        // Rollback source account deduction
        await Account.findByIdAndUpdate(accountId, { $inc: { balance: numericAmount } });
        return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });
      }
    }

    // 3. Create the transaction
    const newTransaction = await Transaction.create({
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      type,
      amount: numericAmount,
      category,
      date: date ? new Date(date) : new Date(),
      description: description || ''
    });

    return NextResponse.json(newTransaction, { status: 201 });
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
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    // 1. Find the transaction first to know details
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const { accountId, toAccountId, type, amount } = transaction;

    // 2. Revert account balances
    if (type === 'income') {
      await Account.findByIdAndUpdate(accountId, { $inc: { balance: -amount } });
    } else if (type === 'expense') {
      await Account.findByIdAndUpdate(accountId, { $inc: { balance: amount } });
    } else if (type === 'transfer') {
      // Revert source (add back)
      await Account.findByIdAndUpdate(accountId, { $inc: { balance: amount } });
      // Revert destination (subtract)
      if (toAccountId) {
        await Account.findByIdAndUpdate(toAccountId, { $inc: { balance: -amount } });
      }
    }

    // 3. Delete the transaction
    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Transaction deleted and account balance synced successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
