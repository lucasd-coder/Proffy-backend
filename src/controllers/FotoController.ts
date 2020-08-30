import multer, { MulterError, ErrorCode } from 'multer';
import { Request, Response } from 'express';

import multerConfig from '../config/multerConfig';
import db from '../database/connection';
import * as config from '../config/privat';


const upload = multer(multerConfig).single('foto');

class FotoController {
    store(req: Request, res: Response) {
        return upload(req, res, async (error) => {
            if (error) {
                return res.status(400).json({
                    errors: [error.code],
                });
            }
            try {
                const { originalname, filename } = req.file;
                const { user_id } = req.body;
                try {
                    await db('fotos').insert({
                        user_id: user_id,
                        originalname: originalname,
                        filename: filename,
                        url: `${config.APP_URL}/images/${filename}`
                    }).then((data) => {
                        db('fotos').where('id', data[0])
                            .then((data) => { return res.json(data) })
                    }).catch((e) => { return res.status(400).json(e); })
                } catch (e) {
                    return res.status(400).json(e);
                }

            } catch (e) {
                console.log(e);
                return res.status(400).json({ error: ['User does not exist'] });
            }

        });
    }
}

export default FotoController;