import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from "@/lib/mongoosedb"; // Deine Mongoose-Verbindung
import User from "@/models/User"; // Dein Mongoose User Modell

export async function POST(request) {
    try {
        const { email, password, name } = await request.json();

        // Überprüfe, ob alle Felder vorhanden sind
        if (!email || !password || !name) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Stelle die Datenbankverbindung her
        await connectToDatabase();

        // Überprüfe, ob der Benutzer bereits existiert
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        // Passwort hashen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Erstelle den neuen Benutzer
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role: 'user' // Standardrolle "user", kann je nach Bedarf geändert werden
        });

        // Speichere den Benutzer in der Datenbank
        await newUser.save();

        // Erfolgreiche Registrierung
        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: "Error registering user" }, { status: 500 });
    }
}
