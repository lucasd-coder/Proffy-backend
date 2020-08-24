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



        const classes = await db('classes')
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
            .select(['classes.*', 'users.*']);

        //.join('users', 'fotos.user_id', '=', 'users.id')


        return res.json(classes);

    }

    async create(req: Request, res: Response) {
        const {
            name,
            whatsapp,
            bio,
            subject,
            avatar,
            cost,
            schedule
        } = req.body;

        const tsx = await db.transaction();

        try {

            const insertedUsersIds = await tsx('users').insert({
                name,
                whatsapp,
                bio,
                avatar
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