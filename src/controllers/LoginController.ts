import { Request, Response } from 'express';

import bcryptjs from 'bcrypt';
import jwt from 'jsonwebtoken';
import isEmail from 'validator/lib/isEmail';
import Validator from 'validator';


import db from '../database/connection';


export default class LoginController {
    
    //cadastrar
    async store(req: Request, res: Response) {
        const { name, surname ,password, email } = req.body;

        try {

            if (!isEmail(email)) {
                return res.status(400).json({ error: ["Invalid email"] })
            }

            if (name.length < 4) {
                return res.status(400).json({ error: ['Name must be longer than 4 characters'] })
            }

            if (surname.length < 4) {
                return res.status(400).json({ error: ['Surname must be longer than 4 characters'] })
            }

            if (!Validator.isLength(password, { min: 6, max: 120 })) {
                return res.status(400).json({ error: ['Passeord must be longer than 6 characters'] });

            }

            await db('login').select('*').where('email', email).then(async data => {
                if (data.length === 0) {
                    try {
                        const hash = await bcryptjs.hash(password, 8);
                        await db('login')
                        .returning('id')
                        .insert({
                            name,
                            surname,
                            email,
                            password: hash
                        }).then((data) => {
                            db('login').where('id', data[0])
                                .then((data) => {
                                    const email = data[0].email;
                                    const surname = data[0].surname;
                                    const name = data[0].name;
                                    return res.status(201).json({ name, surname ,email });
                                });
                        });
                    } catch (e) {
                        return res.status(400).json(e);
                    }
                } else {
                    return res.status(400).json({ error: "E-mail already exists" });
                }
            }).catch((e) => { return res.status(400).json(e) });
        } catch (err) {

            return res.status(400).json({ err });


        }

    }
    //authenticar
    async create(req: Request, res: Response) {
        try {
            const { email = '', password = '' } = req.body;

            if (!email || !password) {
                return res.status(401).json({
                    errors: ['Invalid credentials']
                });
            }

            const user = await db('login')
                .select('login.*')
                .where('login.email', email)
                .first();


            if (!user) {
                return res.status(401).json({ errors: 'invalid email' });
            }

            if (!await bcryptjs.compare(password, user.password)) {
                return res.status(400).json({ error: 'invalid password' });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET || 'default', {
                
                expiresIn: process.env.TOKEN_EXPIRATION
            });  
            
             

            
            const { id } = user;                       
                    
            res.json({ token, user: { nome: user.nome, id, email } });


        } catch (e) {
            console.log(e);
            return res.status(400).json(e);

        }

    }



}