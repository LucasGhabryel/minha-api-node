import express from 'express'
import { listarLinkAfiliados } from '../controllers/linkController.js'
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/links', autenticar, listarLinkAfiliados)

export default router