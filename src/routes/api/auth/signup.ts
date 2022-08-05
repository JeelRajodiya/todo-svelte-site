import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET} from '$env/static/private';
// import etag from 'etag';
import jwt from 'jsonwebtoken';
import DB from '$lib/database';
import md5 from 'md5'
import cookie from 'cookie'
import sendOTP from '$lib/mail'



interface SignupRequest {
	email: string;
	password: string;
}
function genToken(req:SignupRequest): string {
    const token = jwt.sign({
        email: req.email,
        password: req.password,
    }, JWT_SECRET, {
        expiresIn: 5 * 60,
    });
    return token;
}

function genPasswordHash(password:string):string{
    const hash = md5(password)
    return hash
}

export async function POST(event: RequestEvent) {
	const req: SignupRequest = await event.request.json();
    const otpToken = genToken(req);
	const { email, password } = req;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const passwordHash = genPasswordHash(password)
    const db = new DB();
    const mailSentTo = await sendOTP(otp,email)[0]
    

    // db.insertData('otps', {
    //     email,
    //     password_hash:passwordHash,
    //     otp_otken:otpToken,
    //     otp
    
    // });
    
	return {
        headers:{
          "set-cookie":[cookie.serialize("otp_token",otpToken)]
        },
		statusCode: 200,
        body:{
            "clientMail":mailSentTo    // this will be show to the client so he can confirm that the sent email is his
        }
	};
}


