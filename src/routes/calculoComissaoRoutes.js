import express from "express"
import { calcularComissaoAfiliado } from "../controllers/calculoComissaoController.js"
import autenticar from "../middlewares/autenticar.js"

const router = express.Router() 


router.get('/calculo-comissao/:id', autenticar, calcularComissaoAfiliado)

export default router