import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
// import etag from 'etag';
import jwt from 'jsonwebtoken';
import MongoDB from '$lib/database';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import sendOTP from '$lib/mail';
// import { DateTime } from 'luxon';
import { genOTP, genSession, genOTPToken, checkForDuplicateEmail } from '$lib/util/functions';

import type {
	UserDoc,
	SignupRequest,
	DecodedJWT,
	OTPData,
	OTPDoc,
	OtpAuthRequest
} from '$lib/util/types';

export async function POST(event: RequestEvent) {
	const req: SignupRequest = await event.request.json();
	const { email, password } = req;
	if (email === undefined || password === undefined) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'email and password are not provided in body as json'
			}
		};
	}

	const isDuplicate = await checkForDuplicateEmail(email);
	if (isDuplicate) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'Email already exists'
			}
		};
	}

	const otp = genOTP();
	const passwordHash = md5(password);
	const otpToken = genOTPToken(req);
	const db = MongoDB;
	const mailSentTo = await sendOTP(otp, email);
	const otpDoc: OTPDoc = {
		email,
		passwordHash: passwordHash,
		otpToken: otpToken,
		otp,
		createdAt: new Date()
	};

	db.otps.insertOne(otpDoc);

	return {
		status: 200,

		headers: {
			'Access-Control-Allow-Credentials': true,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},
		body: {
			Authorization: otpToken, // jwt
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
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'Otp token is not provided in authorization header'
			}
		};
	}
	const body: OtpAuthRequest = await event.request.json();
	const enteredOtp = body.otp;
	const db = MongoDB;

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
			status: 401,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'OTP Expired',
				data: decodedData
			}
		};
	}

	const otpData: OTPData = (await db.otps.findOne({ otpToken: otpToken })) as OTPData;

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
			status: 401,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

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
	db.otps.deleteOne({ otpToken: otpToken });
	db.users.insertOne(userDoc);

	return {
		status: 200,

		headers: {
			'Access-Control-Allow-Credentials': true,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},
		body: {
			Authorization: session,
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
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'Otp token is not provided in authorization header'
			}
		};
	}
	const db = MongoDB;
	const otpData: OTPData | null = (await db.otps.findOne({ otpToken: otpToken })) as OTPData | null;
	if (otpData === null) {
		return {
			status: 403,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'Given OTP Token is Invalid'
			}
		};
	}
	const mailSentTo = await sendOTP(otpData.otp, otpData.email);

	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: {
			clientMail: mailSentTo // this will be show to the client so he can confirm that the sent email is his
		}
	};
}

export async function DELETE(event: RequestEvent) {
	// delete account
	const body = await event.request.json();
	const { password } = body;

	const session: string = event.request.headers.get('Authorization') as string;

	if (password === undefined) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'password is not provided in body as json'
			}
		};
	} else if (session === undefined) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'session is not provided in authorization header'
			}
		};
	}
	const db = MongoDB;
	const userData: UserDoc = (await db.users.findOne({ sessions: session })) as UserDoc;
	if (userData === null) {
		return {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'Invalid session'
			}
		};
	}

	if (userData.passwordHash !== md5(password)) {
		return {
			status: 401,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},

			body: {
				message: 'Invalid Password'
			}
		};
	}
	db.users.deleteOne({ sessions: session });
	db.tasklists.deleteMany({ userID: userData.id });
	db.tasks.deleteMany({ userID: userData.id });

	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},

		body: {
			message: 'Account Deleted'
		}
	};
}
export function OPTIONS(event: RequestEvent) {
	return {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	};
}
