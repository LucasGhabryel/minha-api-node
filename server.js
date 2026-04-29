    import bodyParser from "body-parser" 
    import cors from 'cors'
    import express from 'express'
    import swaggerUi from "swagger-ui-express";
    import swaggerFile from "./swagger-output.json" with { type: "json" }

    import authRoutes from './src/routes/authRoutes.js'
    import cadastrosRoutes from './src/routes/cadastroRoutes.js'
    import comissaoRoutes from './src/routes/comissaoRoutes.js'
    import linkRoutes from './src/routes/linkRoutes.js'
    import pagamentosRoutes from './src/routes/pagamentoRoutes.js'
    import subafiliadosRoutes from './src/routes/subafiliadoRoutes.js'
    import usuarioRoutes from './src/routes/usuarioRoutes.js'
    import empresasRoutes from './src/routes/empresasRoutes.js'
    import vendaRoutes from './src/routes/vendaRoutes.js'
    
    const app = express()
    app.use(cors())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true}))
    app.get('/favicon.ico', (req, res) => res.status(204))

   app.get('/', (req, res) => {
        res.status(200).json({
        status: "success",
        message: "API funcionando"
        })
    })

    // Rotas //

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

    app.use('/v2',authRoutes)
    app.use('/v2',cadastrosRoutes)
    app.use('/v2',comissaoRoutes)
    app.use('/v2',linkRoutes)
    app.use('/v2',pagamentosRoutes)
    app.use('/v2',subafiliadosRoutes)
    app.use('/v2',usuarioRoutes)
    app.use('/v2', empresasRoutes)
    app.use('/v2', vendaRoutes)



    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Swagger em http://localhost:${PORT}/api-docs`);
    });