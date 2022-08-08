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
