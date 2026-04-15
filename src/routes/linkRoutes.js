import express from 'express'
import { listarLinkAfiliados, criarLinkAfiliados } from '../controllers/linkController.js'
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/links/:id', autenticar, listarLinkAfiliados)
router.post('/links', autenticar, criarLinkAfiliados)
export default router