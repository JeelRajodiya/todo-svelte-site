import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET} from '$env/static/private';
// import etag from 'etag';
import jwt from 'jsonwebtoken';
import DB from '$lib/database';
import md5 from 'md5'




interface SignupRequest {
	email: string;
	password: string;
}
function generateToken(req:SignupRequest): string {
    const token = jwt.sign({
        email: req.email,
        password: req.password,
    }, JWT_SECRET, {
        expiresIn: 5 * 60,
    });
    return token;
}

function generatePassHash(password:string):string{
    const hash = 
}

export async function POST(event: RequestEvent) {
	const req: SignupRequest = await event.request.json();
    const otpToken = generateToken(req);
	const { email, password } = req;
    const otp = Math.floor(100000 + Math.random() * 900000);

    const db = new DB();
    db.insertData('otps', {
        email,
        password,
        otpToken,
        otp
    
    });
    
	return {
		statusCode: 200,
        body: otpToken
	};
}
