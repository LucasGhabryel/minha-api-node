import express from "express"
import { listarComissoes, listarComissoesSubafiliado, criarComissoes, editarComissoes } from "../controllers/comissaoController.js"
import autenticar from "../middlewares/autenticar.js"

const router = express.Router()

router.get('/comissoes', listarComissoes)
router.get('/comissoes-subafiliado', listarComissoesSubafiliado)
router.post('/comissoes', criarComissoes)
router.patch('/comissoes/:id', editarComissoes)

export default router 