import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import path from 'path'
import BadRequestError from '../errors/bad-request-error'


export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (req.file.size < 2 * 1024) {
        return res
            .status(400)
            .json({ message: 'Файл слишком маленький (менее 2KB)' })
    }

    // Проверка, действительно ли это изображение
    try {
        await sharp(req.file.path).metadata() // выбросит ошибку, если не изображение
    } catch {
        return res
            .status(400)
            .json({ message: 'Файл не является валидным изображением' })
    }

    try {
        const ext = path.extname(req.file.originalname);
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${randomUUID()}${ext}`
            : `/${randomUUID()}${ext}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
