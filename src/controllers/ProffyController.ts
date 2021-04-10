import { Request, Response } from 'express';

import db from '../database/connection';

class ProffyController {
    async index(req: Request, res: Response) {
        const { page = 1 } = req.query;

        try {
            const [count] = await db('users').count();        

            const users = await db('users')
            .select('*')
            .limit(5).offset((<any>page - 1) * 5);

            res.header('X-Total-Count', count["count"] )

            res.json(users)
                        
        } catch (e) {
            res.status(400).json(e)

        }

    }
}

export default ProffyController;