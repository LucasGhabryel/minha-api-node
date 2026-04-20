import express from "express"
import { listarEmpresasGeral, listarEmpresasId, criarEmpresa, editarEmpresa, deletarEmpresa } from '../controllers/empresasController.js'
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/empresas', autenticar, listarEmpresasGeral)
router.get('/empresas/:id', autenticar, listarEmpresasId)
router.post('/empresas', autenticar, criarEmpresa)
router.patch('/empresas/:id', autenticar, editarEmpresa)
router.delete('/empresas/:id', autenticar, deletarEmpresa)

export default router