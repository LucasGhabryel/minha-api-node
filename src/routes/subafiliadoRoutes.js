import express from 'express'
import { listarSubafiliados, criarSubafiliado, editarSubafiliado } from '../controllers/subafiliadoController.js'
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/subafiliados', autenticar, listarSubafiliados)
router.post('/subafiliados', autenticar, criarSubafiliado)
router.patch('/subafiliados/:id', autenticar, editarSubafiliado)

export default router