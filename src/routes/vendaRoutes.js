import express from "express"
import { listarVendas, criarVendas} from "../controllers/vendaController.js"
import autenticar from "../middlewares/autenticar.js"


const router = express.Router()

router.get('/vendas', autenticar, listarVendas)
router.post('/vendas', autenticar, criarVendas)

export default router
