import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { GoldHolding } from '@/lib/models/GoldHolding';

export async function GET() {
  try {
    await connectToDatabase();
    const holdings = await GoldHolding.find({}).sort({ purchaseDate: -1, createdAt: -1 });
    return NextResponse.json(holdings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { goldType, quantity, purchasePrice, purchaseDate, currentPrice, note } = body;

    if (!goldType || quantity === undefined || purchasePrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newHolding = await GoldHolding.create({
      goldType,
      quantity: Number(quantity) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      currentPrice: Number(currentPrice) || Number(purchasePrice) || 0,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      note: note || ''
    });

    return NextResponse.json(newHolding, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Gold holding ID is required' }, { status: 400 });
    }

    const updatedHolding = await GoldHolding.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedHolding) {
      return NextResponse.json({ error: 'Gold holding not found' }, { status: 404 });
    }

    return NextResponse.json(updatedHolding);
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
      return NextResponse.json({ error: 'Gold holding ID is required' }, { status: 400 });
    }

    const deletedHolding = await GoldHolding.findByIdAndDelete(id);

    if (!deletedHolding) {
      return NextResponse.json({ error: 'Gold holding not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gold holding deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
