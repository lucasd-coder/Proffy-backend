import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/multerConfig';

async function deleteFile(file: string): Promise<void> {
    const filePath = path.resolve(uploadConfig.uploadsFolder, file);     
           
    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
}

export { deleteFile };