import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";

// During build time, we need to handle the case where db() returns a mock
// This is a runtime-only feature, so we can safely use a conditional adapter
const getAdapter = () => {
	try {
		return DrizzleAdapter(db());
	} catch (error) {
		console.error("Failed to initialize DrizzleAdapter. This is expected during build time.");
		// Return a minimal adapter implementation for build time
		return {};
	}
};

export const {
	handlers: { GET, POST },
	signIn,
	signOut,
	auth,
} = NextAuth({
	trustHost: true,
	adapter: getAdapter(),
	providers: [
		Google
	],
});