import multer from 'multer';
import { Request, Response } from 'express';

import multerConfig from '../config/multerConfig';
import db from '../database/connection';
import { deleteFile } from '../utils/deleteFile';

const upload = multer(multerConfig).single('foto');

class FotoController {
    store(req: Request, res: Response) {
        return upload(req, res, async (error: any) => {
            if (error) {
                return res.status(400).json({
                    errors: [error.code],
                });
            }                 
            
            const { originalname, filename } = req.file;
            const { foto_id } = req.params;                     
            
            try {                
                
                const file = await db('fotos')
                                    .where('fotos.foto_id', foto_id)
                                    .first('*');                                                                                                         
                                                        
                    if (!file) { 
                        await deleteFile(file.filename);                                             
                        return res.status(400).json({
                                 error: ['not found'] 
                        });
                    }

                    if(file.filename) {
                        await deleteFile(file.filename);
                    }                                     
                                        
                    await db('fotos')
                    .where('fotos.foto_id', '=', file.foto_id)                             
                    .update({
                        foto_id: foto_id,
                        originalname: originalname,
                        filename: filename,
                        url: `${process.env.APP_URL}/images/${filename}`
                    }).returning(['originalname', 'filename', 'url'])
                      .then((data) => {
                        if(Object.entries(data).length === 0 || !data) {
                            return res.status(400).json({ error: ['User does not exist'] });                                           
                        }

                        return res.json(data);

                    }).catch((e) => { return res.status(400).json(e); });
                    
            } catch (e) {
                    await deleteFile(filename);                                                      
                    return res.status(400).json({ error: ['User does not exist'] });
            }                           
        });
    }
}

export default FotoController;