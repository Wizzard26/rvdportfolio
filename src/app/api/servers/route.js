import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import ServerMonitor from "@/lib/serverMonitor";

export async function GET() {
    try {
        console.log('Connecting to MongoDB...');

        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        console.log('Fetching data from MongoDB...');
        const servers = await ServerMonitor.find().lean();

        return NextResponse.json(servers);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching server data' }, { status: 500 });
    }
}
