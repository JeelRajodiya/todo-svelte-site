import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
// import etag from 'etag';
import jwt from 'jsonwebtoken';
import MongoDB from '$lib/database';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import sendOTP from '$lib/mail';
// import { DateTime } from 'luxon';
import {
	genOTP,
	genSession,
	genOTPToken,
	checkForDuplicateEmail,
	sendOTPViaToken
} from '$lib/functions';

import type {
	UserDoc,
	SignupRequest,
	DecodedJWT,
	OTPData,
	OTPDoc,
	OtpAuthRequest
} from '$lib/functions';

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
	const db = new MongoDB();
	const mailSentTo = await sendOTP(otp, email);
	const otpDoc: OTPDoc = {
		email,
		passwordHash: passwordHash,
		otpToken: otpToken,
		otp,
		createdAt: new Date()
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
	// validate OTP
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
	const db = new MongoDB();

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

	const otps = await db.getExactData('otps', 'otpToken', otpToken);
	const otpData: OTPData = otps;

	let isVerified = false;

	// console.log(enteredOtp,otpData,decodedData)
	if (
		otpData.otp == enteredOtp &&
		otpData.otpToken == otpToken &&
		otpData.email == decodedData.email &&
		otpData.passwordHash == decodedData.passwordHash
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

	const session = genSession(otpData.email, otpData.passwordHash);
	const userDoc: UserDoc = {
		email: otpData.email,
		passwordHash: otpData.passwordHash,
		sessions: [session],
		id: uuidv4(),
		createdAt: new Date()
	};
	db.deleteDoc('otps', { otpToken: otpToken });
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

export async function PATCH(event: RequestEvent) {
	// resend otp
	const otpToken: string = event.request.headers.get('Authorization') as string;
	if (otpToken == undefined) {
		return {
			status: 400,
			body: {
				message: 'Otp token is not provided in authorization header'
			}
		};
	}
	const mailSentTo = await sendOTPViaToken(otpToken);
	return {
		status: 200,
		body: {
			clientMail: mailSentTo // this will be show to the client so he can confirm that the sent email is his
		}
	};
}
