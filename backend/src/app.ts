import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import rateLimit from 'express-rate-limit';

const { PORT = 3000 } = process.env
const app = express()

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 20, // максимум 20 запросов с одного IP
  standardHeaders: true, // добавляет заголовки RateLimit
  legacyHeaders: false,  // отключает `X-RateLimit-*`
  message: 'Слишком много запросов, попробуйте позже.',
});

app.use(apiLimiter);

app.use(cookieParser())

//app.use(cors())
app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }))
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
