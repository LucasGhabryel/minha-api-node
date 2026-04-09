import express from "express"
import { criarUsuario, editarUsuario, deletarUsuario, listarUsuarios } from "../controllers/usuarioController.js"
import autenticar from "../middlewares/autenticar.js"

const router = express.Router() 

router.post('/usuarios', autenticar, criarUsuario)
router.get('/usuarios', autenticar, listarUsuarios)
router.patch('/usuarios/:id', autenticar, editarUsuario)
router.delete('/usuarios/:id', autenticar, deletarUsuario)

export default router