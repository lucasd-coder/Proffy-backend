import { Request, Response } from 'express';


import db from '../database/connection';

export default class ConnectionsController {
    async index(req: Request, res: Response) {

        const totalConnections = await db('connections').count('* as total');

        const { total } = totalConnections[0];

        return res.json({ total });

    }

    async create(req: Request, res: Response) {
        const { user_id } = req.body;

        await db('connections').select('*').where('user_id', user_id).then(async data => {          
            if (data.length === 0) {
                try {
                    await db('connections')                           
                            .insert({
                                user_id
                            })
                    
                } catch (e) {                                       
                    return res.status(400).json({error: "user not found"});
                }
            } else {
                return res.status(400).json({ error: "connections already exists" });
            }
        }).catch((e) => { return res.status(400).json(e) });

        return res.status(201).send();

    }

}