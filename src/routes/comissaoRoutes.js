import express from "express"
import { listarComissoes, listarComissoesSubafiliado, criarComissoes, editarComissoes, resumoComissoes } from "../controllers/comissaoController.js"
import autenticar from "../middlewares/autenticar.js"

const router = express.Router()

router.get('/comissoes', autenticar, listarComissoes)
router.get('/comissoes-subafiliado',autenticar, listarComissoesSubafiliado)
router.post('/comissoes',autenticar, criarComissoes)
router.patch('/comissoes/:id',autenticar, editarComissoes)
router.get('/comissao/:id',autenticar, resumoComissoes)

export default router 