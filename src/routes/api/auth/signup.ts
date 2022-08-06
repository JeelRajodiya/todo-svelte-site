import type { RequestEvent } from '@sveltejs/kit';
import { JWT_SECRET} from '$env/static/private';
// import etag from 'etag';
import jwt from 'jsonwebtoken';
import DB from '$lib/database';
import md5 from 'md5'
import {v4 as uuidv4} from 'uuid'
import sendOTP from '$lib/mail'
import {DateTime} from 'luxon'



interface SignupRequest {
	email: string;
	password: string;
}
function genOTPToken(req:SignupRequest): string {
    const token = jwt.sign({
        email: req.email,
        passwordHash: md5(req.password),
    }, JWT_SECRET, {
        expiresIn: 5 * 60,
    });
    return token;
}

function genSession(email:string,passwordHash:string):string{
    const session = jwt.sign({
        email: email,
        passwordHash:passwordHash,
    }, JWT_SECRET, {
        expiresIn: "30d",
    }
     )
    return session
}

function genPasswordHash(password:string):string{
    const hash = md5(password)
    return hash
}

function genOTP():number{
    const OTP = Math.floor(100000 + Math.random() * 900000)
    return OTP
}

export async function POST(event: RequestEvent) {
	const req: SignupRequest = await event.request.json();
	const { email, password } = req;
    const otp = genOTP();
    const passwordHash = genPasswordHash(password)
    const otpToken = genOTPToken(req);
    const db = new DB();
    const mailSentTo = await sendOTP(otp,email)


    

    db.insertData('otps', {
        email,
        password_hash:passwordHash,
        otp_token:otpToken,
        otp,
        
    
    });
    
	return {
        statusCode: 200,
        headers:{
            "Authorization":otpToken, // jwt
          "Access-Control-Allow-Credentials":true,
            "Access-Control-Allow-Origin":"*",
           
           
        },
        body:{
            "clientMail":mailSentTo    // this will be show to the client so he can confirm that the sent email is his
        }
	};
}
interface OtpAuthRequest {
    otp:number;
}

interface DecodedJWT{
    email:string;
    passwordHash:string;
    
}
interface OTPData{
    email:string;
    password_hash:string;
    otp_token:string;
    otp:number;
    

}

export async function PUT(event: RequestEvent) {
    const otpToken:string = event.request.headers.get('Authorization') as string
    const body:OtpAuthRequest  = await event.request.json()
    const enteredOtp = body.otp
    const db = new DB()
    
    const decodedData:DecodedJWT =  jwt.verify(otpToken,JWT_SECRET,function(err,decoded){
        if(err){
            return {
                email:'',
                passwordHash:''

            }
        }
        return decoded
    })

    
    if( decodedData.email === ''){
        return {
            statusCode: 401,
            body: {
                message: 'OTP Expired',
            },
        };
    }


 

    
    const otps = await db.getExactData('otps','otp_token',otpToken)
    const otpData:OTPData = otps[0]

    let isVerified = false

    // console.log(enteredOtp,otpData,decodedData)
    if (otpData.otp == enteredOtp &&
       
       otpData.otp_token == otpToken &&
       otpData.email == decodedData.email && 
       otpData.password_hash == decodedData.passwordHash){

        isVerified = true
    }
    if (!isVerified){
        return {
            statusCode: 401,
            body: {
                message: 'Invalid OTP',
            },
        };
    }

       
    const session = genSession(otpData.email,otpData.password_hash)
    const userDoc = {
        email:otpData.email,
        password_hash:otpData.password_hash,
        sessions:[session],
        id:uuidv4(),
        created_at:DateTime.local().toISO(),

    }
    db.deleteDoc('otps',{otp_token:otpToken})
    db.insertData('users',userDoc)
    
    return {
        status:200,
        headers:{
            "Authorization":session,
            "Access-Control-Allow-Credentials":true,
            "Access-Control-Allow-Origin":"*",
        },
        body:{
            "message":"OTP Verified"
        }
    }
}

