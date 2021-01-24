import { Request, Response } from 'express';
import isEmail from 'validator/lib/isEmail';
import crypto from 'crypto';
import mailer from '../modules/mailer'
import db from '../database/connection';



export default class ForgotPassController {

    //forgot_password
    async store(req: Request, res: Response) {
        const { email } = req.body;

        if (!isEmail(email)) {
            return res.status(400).json({ error: ["Invalid email"] })
        }

        try {

            const token = crypto.randomBytes(20).toString('hex');

            const now = new Date();
            console.log(now);
            
            const user = await db('login').where('login.email', '=', email).update({
                passwordResetToken: token,
                passwordResetExpires: now
            })

            if (!user) {
                return res.status(400).json({ error: "E-mail already exists" });
            }


            mailer.sendMail({
                to: email,
                from: 'rochasilva524@gmail.com',
                template: '/auth/forgot_password',
                context: { token },
            }, (err) => {
                if (err)
                    return res.status(400).send({ error: 'Cannot send forgot password email' });

                return res.send("ok");
            });


        } catch (error) {
            res.status(400).send({ error: 'Erro on forgot password, try again' });
        }




    }

}