import { Request, Response } from 'express';

import db from "../database/connection";
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number,
    from: string,
    to: string,
}

export default class ClassesController {
    async index(req: Request, res: Response) {
        const filters = req.query;
        const { page = 1 } = req.query;

        const [count] = await db('users').count();        
        
        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if (!filters.week_day || !filters.subject || !filters.time) {
            return res.status(400).json({
                error: 'Missing filters to search classes'
            })
        }

        const timeInMinutes = convertHourToMinutes(time);

        await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('class_schedule.class_id = classes.id')
                    .whereRaw('class_schedule.week_day = ??', [Number(week_day)])
                    .whereRaw('class_schedule.from <= ??', [timeInMinutes])
                    .whereRaw('class_schedule.to > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .innerJoin('users', 'classes.user_id', '=', 'users.id')
            .innerJoin('fotos', 'fotos.foto_id', '=',  'users.id')
            .limit(5).offset((<any>page - 1) * 5)
            .select(['classes.*', 'users.*', 'fotos.*'])
            .then((data) => {

                res.header('X-Total-Count', count["count"] );

                return res.json(data)
            }).catch((e) => { res.status(400).json({ error: ['not found']}) });            
    }
    
    async create(req: Request, res: Response) {
        const {
            name,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;                

        const tsx = await db.transaction();

        try {

            const insertedUsersIds = await tsx('users').insert({
                name,
                whatsapp,
                bio,
            }).returning('id');                                  
            
            const user_id = insertedUsersIds[0];
                        
            const insertedClassesIds = await tsx('classes').insert({
                subject,
                cost,
                user_id
            }).returning('id');           
            
            const class_id = insertedClassesIds[0];

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to),
                };
            });
                                
            await tsx('fotos').insert({ foto_id: user_id});

            await tsx('class_schedule').insert(classSchedule);

            await tsx.commit();

            return res.status(200).json({id: user_id});

        } catch (e) {
            await tsx.rollback();
            console.log(e);
            
            return res.status(400).json({
                error: 'Unexpected error white creating new class'
            })
        }
    }

    async update(req: Request, res: Response) {

        const { id } = req.params;

        const {
            name,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;        
        
        const tsx = await db.transaction();

        try {
            if (!id) {
                return res.status(400).json({
                    errors: ['Missing ID'],
                });
            }

            const users = await tsx('users')
                .where('users.id', id)
                .first('users.id');

            if (!users) {
                return res.status(400).json({
                    errors: ['there is no'],
                });
            }

            const _id = users.id;

            const insertedUsersIds = await tsx('users')
                .where('users.id', _id)
                .update({
                    name,
                    whatsapp,
                    bio,
                })
                .returning('id');

            const user_id = insertedUsersIds[0];

            const insertedClassesIds = await tsx('classes')
                .where('classes.user_id', user_id)
                .update({
                    subject,
                    cost,
                }).returning('id');

            const class_id = insertedClassesIds[0];

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to),
                };
            });

            const _week_day = classSchedule[0].week_day;
            const _from = classSchedule[0].from;
            const _to = classSchedule[0].to;

            await tsx('class_schedule')
                .where('class_schedule.class_id', class_id)
                .update({
                    week_day: _week_day,
                    from: _from,
                    to: _to
                });

            await tsx.commit();

            return res.status(201).send();

        } catch (e) {
            await tsx.rollback();
            console.log(e);
            return res.status(400).json({
                error: 'Unexpected white class update error'
            });
        }
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                errors: ['Missing ID'],
            });
        }

        try {

            const users = await db('users')
                .where('users.id', id)
                .first('users.id');                
                
            if (!users) {
                return res.status(400).json({
                    errors: ['there is no'],
                });
            }

            const _id = users.id;                                          

            await db('users')
                .where('users.id', _id) 
                .select(['users.*', 'classes.*', 'class_schedule.*'])                            
                .innerJoin('classes', 'classes.user_id', 'users.id')
                .innerJoin('class_schedule', 'class_schedule.class_id', 'classes.id')                
                .then((data) => {
                    const data_fotos = data[0].user_id;                                        
                                                                                            
                    db('fotos').where('fotos.foto_id', data_fotos)
                        .select('fotos.url', 'fotos.filename', 'fotos.originalname')
                        .orderBy('id', 'desc')
                        .then((foto) => {
                            const data_fotos = Object.assign( { foto } ,...data );
                            return res.json([data_fotos]);
                        }).catch((e) => { res.status(400).json(e) });                    
                })
                .catch((e) => {
                    console.log(e);
                    return res.status(400).json(e);
                });

        } catch (e) {
            res.status(400).json({ error: ['User does not exist'] });
        }
    }
}