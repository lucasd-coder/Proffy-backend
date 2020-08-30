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

        // const testeId = classes[0].user_id;
        // //console.log(testeId);
        // const teste = await db('fotos').where('fotos.user_id', '=', testeId)
        //     .join('users', 'fotos.user_id', '=', 'users.id').orderBy('id', 'desc')
        //     .select(['fotos.*', 'users.*']);
        // console.log({ Fotos: teste });
        //return res.json(classes);

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
}