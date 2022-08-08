import jwt from 'jsonwebtoken';
import DB from '$lib/database';
import md5 from 'md5';

import { JWT_SECRET } from '$env/static/private';
import MongoDB from '$lib/database';
import sendOTP from '$lib/mail';

export interface OtpAuthRequest {
	otp: number;
}
export interface UserDoc {
	email: string;
	passwordHash: string;
	createdAt: Date;
	id: string;
	sessions: string[];
}
export interface DecodedJWT {
	email: string;
	passwordHash: string;
}
export interface OTPData {
	email: string;
	passwordHash: string;
	otpToken: string;
	otp: number;
}
export interface OTPDoc {
	email: string;
	passwordHash: string;
	createdAt: Date;
	otp: number;
	otpToken: string;
}

export interface SignupRequest {
	email: string;
	password: string;
}

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
	const db = new DB();
	const activeAccount = await db.getData('users', { email: { $eq: email } });
	if (activeAccount.length > 0) {
		return true;
	} else {
		return false;
	}
}

export async function sendOTPViaToken(token: string) {
	const db = new MongoDB();
	const otps = await db.getExactData('otps', 'otpToken', token);
	const otpData: OTPData = otps;

	const mailSentTo = await sendOTP(otpData.otp, otpData.email);
	return mailSentTo;
}
