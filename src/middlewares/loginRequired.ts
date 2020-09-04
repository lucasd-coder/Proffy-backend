import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import * as config from '../config/privat';
import db from '../database/connection';


export default async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            errors: ['Login required'],
        });
    }
    const [, token] = authorization.split(' ');

    try {
        const dados = jwt.verify(token, config.TOKEN_SECRET);
        const { id, email } = dados;

        const user = await db('login')
            .select('login.*')
            .where('login.email', email)
            .first();

        if (!user) {
            return res.status(401).json({
                errors: ['Invalid user.'],
            });
        }

        req.userId = id;
        req.userEmail = email;
        return next();

    } catch (e) {
        return res.status(401).json({
            errors: ['Expired or invalid token.'],
        });
    }

}
