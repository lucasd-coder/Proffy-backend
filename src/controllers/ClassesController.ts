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
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']).then((data) => {
                const data_fotos = data[0].user_id;
                db('fotos').where('fotos.user_id', data_fotos)
                    .select('fotos.url', 'fotos.filename', 'fotos.originalname')
                    .orderBy('id', 'desc')
                    .then((Fotos) => {
                        const data_fotos = [...data, { Fotos }];
                        return res.json(data_fotos);
                    }).catch((e) => { res.status(400).json(e) });
            }).catch((e) => { res.status(400).json(e) });
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
            });

            const user_id = insertedUsersIds[0];

            const insertedClassesIds = await tsx('classes').insert({
                subject,
                cost,
                user_id
            });

            const class_id = insertedClassesIds[0];

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to),
                };
            });

            await tsx('class_schedule').insert(classSchedule);

            await tsx.commit();

            return res.status(201).send();

        } catch (e) {
            await tsx.rollback();

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
                });


            const user_id = insertedUsersIds;

            const insertedClassesIds = await tsx('classes')
                .where('classes.user_id', user_id)
                .update({
                    subject,
                    cost,
                });

            const class_id = insertedClassesIds;



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


            await db('users').select('US.nome_users as users', 'CL.nome_class as classes', 'SC.nome_cs as class_schedule').from('')

            // await db('classes')
            //     .where('classes.id', '=', _id)
            //     .join('users', 'classes.user_id', '=', 'users.id')
            //     .select(['classes.*', 'users.*'])
            //     .then((data) => {
            //         const data_fotos = data[0].user_id;
            //         db('fotos').where('fotos.user_id', data_fotos)
            //             .select('fotos.url', 'fotos.filename', 'fotos.originalname')
            //             .orderBy('id', 'desc')
            //             .then((Fotos) => {
            //                 const data_fotos = [...data, { Fotos }];
            //                 return res.json(data_fotos);
            //             }).catch((e) => { res.status(400).json(e) });
            //     }).catch((e) => { res.status(400).json(e) });


        } catch (e) {
            res.status(400).json(e)
        }
    }
}