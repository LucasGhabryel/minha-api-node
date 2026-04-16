import express from "express"
import { listarLinkAfiliadosGeral, listarLinkAfiliadosId, criarLinkAfiliados } from '../controllers/linkController.js'
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/links', autenticar, listarLinkAfiliadosGeral)
router.get('/links/:id', autenticar, listarLinkAfiliadosId)
router.post('/links', autenticar, criarLinkAfiliados)
export default router