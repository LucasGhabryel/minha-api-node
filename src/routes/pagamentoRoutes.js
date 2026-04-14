import express from "express"
import { listarPagamentosPendentes, atualizarPagamento } from "../controllers/pagamentoController.js"
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/pagamentos-a-aprovar', autenticar, listarPagamentosPendentes)
router.patch('/pagamento-a-aprovar/:id', autenticar, atualizarPagamento)

export default router   