import type { RequestEvent } from "@sveltejs/kit";

export function setSessionTokenCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date,
): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		expires: expiresAt,
		path: "/",
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export interface Session {
	id: string;
	userId: number;
	expiresAt: Date;
}

export interface User {
	id: number;
}

// export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
// 	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
// 	const row = await db.queryOne(
// 		"SELECT user_session.id, user_session.user_id, user_session.expires_at, app_user.id FROM user_session INNER JOIN user ON app_user.id = user_session.user_id WHERE id = ?",
// 		sessionId
// 	);
// 	if (row === null) {
// 		return { session: null, user: null };
// 	}
// 	const session: Session = {
// 		id: row[0],
// 		userId: row[1],
// 		expiresAt: row[2]
// 	};
// 	const user: User = {
// 		id: row[3]
// 	};
// 	if (Date.now() >= session.expiresAt.getTime()) {
// 		await db.execute("DELETE FROM user_session WHERE id = ?", session.id);
// 		return { session: null, user: null };
// 	}
// 	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
// 		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
// 		await db.execute(
// 			"UPDATE user_session SET expires_at = ? WHERE id = ?",
// 			session.expiresAt,
// 			session.id
// 		);
// 	}
// 	return { session, user };
// }
