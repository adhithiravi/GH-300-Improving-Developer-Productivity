import express, { Request, Response } from 'express'
import cors from 'cors'
import lunchesRouter from './routes/lunches.js'
import pantryRouter from './routes/pantry.js'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 5050

app.use(cors())
app.use(express.json())
app.use('/api/lunches', lunchesRouter)
app.use('/api/pantry', pantryRouter)

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Express backend is running' })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
