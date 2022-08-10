import jwt from 'jsonwebtoken';
import MongoDB from '$lib/database';
import md5 from 'md5';

import { JWT_SECRET } from '$env/static/private';
import type { SignupRequest } from '$lib/util/types';

export function genOTPToken(req: SignupRequest): string {
	const token = jwt.sign(
		{
			email: req.email,
			passwordHash: md5(req.password)
		},
		JWT_SECRET,
		{
			expiresIn: 5 * 60
		}
	);
	return token;
}

export function genSession(email: string, passwordHash: string): string {
	const session = jwt.sign(
		{
			email: email,
			passwordHash: passwordHash
		},
		JWT_SECRET,
		{
			expiresIn: '30d'
		}
	);
	return session;
}

export function genOTP(): number {
	const OTP = Math.floor(100000 + Math.random() * 900000);
	return OTP;
}

export async function checkForDuplicateEmail(email: string): Promise<boolean> {
	const db = MongoDB;
	const activeAccount = await db.users.count({ email: { $eq: email } });
	if (activeAccount > 0) {
		return true;
	} else {
		return false;
	}
}

export function stringToBool(s: string | null, defaultBool: boolean): boolean {
	if (s === 'true') {
		return true;
	} else if (s === 'false') {
		return false;
	}

	return defaultBool;
}
