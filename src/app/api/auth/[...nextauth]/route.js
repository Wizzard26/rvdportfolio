import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongoosedb";
import User from "@/models/User";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "example@example.com" },
                password: { label: "Password", type: "password", placeholder: "password" },
            },
            async authorize(credentials) {
                await connectToDatabase();

                // Suche nach dem Benutzer in der Datenbank
                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("Benutzer ist nicht bekannt!");
                }

                // Überprüfe das Passwort
                const isValid = await user.comparePassword(credentials.password);

                if (!isValid) {
                    throw new Error("Ihre Logindaten sind ungültig!");
                }

                // Rückgabe des Benutzerobjekts
                return { id: user._id, name: user.name, email: user.email, role: user.role };
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin',  // Pfad zur Anmeldeseite
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },
    },
});

export { handler as GET, handler as POST };
