import express from "express"
import { listarVendas, criarVenda, editarVenda} from "../controllers/vendaController.js"
import autenticar from "../middlewares/autenticar.js"


const router = express.Router()

router.get('/vendas/:id', autenticar, listarVendas)
router.post('/vendas', autenticar, criarVenda)
router.patch('/vendas/:id', autenticar, editarVenda)

export default router
