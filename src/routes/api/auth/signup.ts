import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
// import etag from 'etag';
import jwt from 'jsonwebtoken';
import DB from '$lib/database';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import sendOTP from '$lib/mail';
import { DateTime } from 'luxon';
import { genOTP, genSession, genOTPToken, checkForDuplicateEmail } from '$lib/functions/signup';

import type {
	SignupRequest,
	DecodedJWT,
	OTPData,
	OTPDoc,
	OtpAuthRequest
} from '$lib/functions/signup';

export async function POST(event: RequestEvent) {
	const req: SignupRequest = await event.request.json();
	const { email, password } = req;
	if (email === undefined || password === undefined) {
		return {
			status: 400,
			body: {
				message: 'email and password are not provided in body as json'
			}
		};
	}

	const isDuplicate = await checkForDuplicateEmail(email);
	if (isDuplicate) {
		return {
			status: 400,
			body: {
				message: 'Email already exists'
			}
		};
	}

	const otp = genOTP();
	const passwordHash = md5(password);
	const otpToken = genOTPToken(req);
	const db = new DB();
	const mailSentTo = await sendOTP(otp, email);
	const otpDoc: OTPDoc = {
		email,
		password_hash: passwordHash,
		otp_token: otpToken,
		otp,
		created_at: Date.now()
	};

	db.insertData('otps', otpDoc);

	return {
		statusCode: 200,
		headers: {
			Authorization: otpToken, // jwt
			'Access-Control-Allow-Credentials': true,
			'Access-Control-Allow-Origin': '*'
		},
		body: {
			clientMail: mailSentTo // this will be show to the client so he can confirm that the sent email is his
		}
	};
}

export async function PUT(event: RequestEvent) {
	const otpToken: string = event.request.headers.get('Authorization') as string;
	if (otpToken == undefined) {
		return {
			status: 400,
			body: {
				message: 'Otp token is not provided in authorization header'
			}
		};
	}
	const body: OtpAuthRequest = await event.request.json();
	const enteredOtp = body.otp;
	const db = new DB();

	const decodedData: DecodedJWT = jwt.verify(otpToken, JWT_SECRET, function (err, decoded) {
		if (err) {
			return {
				email: '',
				passwordHash: ''
			};
		}
		return decoded;
	});

	if (decodedData.email === '') {
		return {
			statusCode: 401,
			body: {
				message: 'OTP Expired'
			}
		};
	}

	const otps = await db.getExactData('otps', 'otp_token', otpToken);
	const otpData: OTPData = otps[0];

	let isVerified = false;

	// console.log(enteredOtp,otpData,decodedData)
	if (
		otpData.otp == enteredOtp &&
		otpData.otp_token == otpToken &&
		otpData.email == decodedData.email &&
		otpData.password_hash == decodedData.passwordHash
	) {
		isVerified = true;
	}
	if (!isVerified) {
		return {
			statusCode: 401,
			body: {
				message: 'Invalid OTP'
			}
		};
	}

	const session = genSession(otpData.email, otpData.password_hash);
	const userDoc = {
		email: otpData.email,
		password_hash: otpData.password_hash,
		sessions: [session],
		id: uuidv4(),
		created_at: DateTime.local().toISO()
	};
	db.deleteDoc('otps', { otp_token: otpToken });
	db.insertData('users', userDoc);

	return {
		status: 200,
		headers: {
			Authorization: session,
			'Access-Control-Allow-Credentials': true,
			'Access-Control-Allow-Origin': '*'
		},
		body: {
			message: 'OTP Verified'
		}
	};
}
