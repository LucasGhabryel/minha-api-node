import express from "express"
import { listarCadastrosPendente, atualizarCadastro,  } from '../controllers/cadastroController.js'
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/cadastro-a-aprovar', autenticar, listarCadastrosPendente)
router.patch('/cadastro-a-aprovar/:id', autenticar, atualizarCadastro)

export default router


