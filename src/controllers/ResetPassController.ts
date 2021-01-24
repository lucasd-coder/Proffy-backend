import { Request, Response } from 'express';
import bcryptjs from 'bcrypt';
import Validator from 'validator';
import {addHours, isAfter, format, parseISO} from 'date-fns';


import db from '../database/connection';


export default class ResetPassController {


    // reset_password
    async store(req: Request, res: Response) {
        const { password, confir_password, token } = req.body;

        try {

            if (Validator.isEmpty(password)) {
                return res.status(400).json({ error: ['Password is required'] });

            }

            if (!Validator.isLength(password, { min: 6, max: 120 })) {
                return res.status(400).json({ error: ['Passeord must be longer than 6 characters'] });

            }

            if (Validator.isEmpty(confir_password)) {
                return res.status(400).json({ error: ["Confirm password is required"] });
            }

            if (!Validator.equals(password, confir_password)) {
                return res.status(400).json({ error: ["Passwords must match"] });
            }


            await db('login')
                .first('passwordResetToken', 'passwordResetExpires', 'id').then(function (row) {

                    if (token !== row.passwordResetToken) {
                        return res.status(400).send({ error: 'Token invalid' });
                    }
                    
                    const tokenCreatedAt = row.passwordResetExpires;    
                    const compareDate = addHours(tokenCreatedAt, 2);
                    
                    if (isAfter(Date.now(), compareDate)) {
                        return res.status(400).send({ error: 'Token expired, generate a new one' });
                    }
                    
                    
                    
                    const salt = bcryptjs.genSaltSync(8)
                    const hash = bcryptjs.hashSync(password, salt);

                    db('login').where("id", row.id)
                        .update({ password: hash, passwordResetToken: null, passwordResetExpires: null })
                        .then(resp => {
                            res.status(201).json(resp);
                        }
                        ).catch(e => console.log(e));
                }).catch((e) => { res.status(400).json(e) });

        } catch (error) {
            res.status(400).send({ error: 'Erro on forgot password, try again' });

        }



    }
}