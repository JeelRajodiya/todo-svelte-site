import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_USER, SMTP_PASS } from '$env/static/private';
// async..await is not allowed in global scope, must use a wrapper

export default async function SendOTP(OTP: number, email: string): Promise<string> {
	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,

		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: SMTP_USER, // generated ethereal user
			pass: SMTP_PASS // generated ethereal password
		}
	});

	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: '"Svelte TODO" <jeel@todo-svelte-site.vercel.app>', // sender address
		to: email, // list of receivers
		subject: 'TODO app OTP', // Subject line
		text: `Your svelte-todo app OTP is${OTP} `, // plain text body
		html: `Your svelte-todo app OTP is <h1>${OTP} </h1> ` // html body
	});
	const mailSentTo = info.accepted[0] as string;
	return mailSentTo;
}
