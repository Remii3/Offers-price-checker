import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models/user";
import { connectToDatabase } from "@/lib/mongodb";
 
const handler = NextAuth({
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn ({user}) {
      await connectToDatabase();
      const existingUser = await User.findOne({email: user.email});

      if(!existingUser) {
        await User.create({...user, _id: user.id});
      }
    return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
