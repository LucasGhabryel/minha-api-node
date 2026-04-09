import express from "express"
import { listarComissoes, listarComissoesSubafiliado } from "../controllers/comissaoController.js"
import autenticar from "../middlewares/autenticar.js"

const router = express.Router()

router.get('/comissoes', autenticar, listarComissoes)
router.get('/comissoes-subafiliado', autenticar, listarComissoesSubafiliado)

export default router 