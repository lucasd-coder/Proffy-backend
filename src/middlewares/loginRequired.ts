import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import db from '../database/connection';

interface RequestDTO {
    id: string;
    email: string;
}

export default async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            errors: ['Login required'],
        });
    }
    const [, token] = authorization.split(' ');

    try {
        const dados = jwt.verify(token, process.env.TOKEN_SECRET || 'default');
        const { id, email } = dados as RequestDTO;

        const user = await db('login')
            .select('login.*')
            .where('login.email', email)
            .first();

        if (!user) {
            return res.status(401).json({
                errors: ['Invalid user.'],
            });
        }

        req.user ={
            id: id,
            email: email
        }
        return next();

    } catch (e) {
        return res.status(401).json({
            errors: ['Expired or invalid token.'],
        });
    }

}
