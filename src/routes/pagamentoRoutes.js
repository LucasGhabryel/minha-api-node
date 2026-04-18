import express from "express"
import { listarPagamentosPendentes, criarPagamento, atualizarPagamento } from "../controllers/pagamentoController.js"
import autenticar from '../middlewares/autenticar.js'

const router = express.Router()

router.get('/pagamentos-a-aprovar', autenticar, listarPagamentosPendentes)
router.post('/pagamentos-a-aprovar', autenticar, criarPagamento)
router.patch('/pagamentos-a-aprovar/:id', autenticar, atualizarPagamento)

export default router   