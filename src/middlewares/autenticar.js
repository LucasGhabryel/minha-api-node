import jwt from "jsonwebtoken"
import 'dotenv/config'

const autenticar = (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token) {
            return res.status(401).json({
                error: "error",
                message: "Token não fornecido"
            })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.usuario = decoded
            next()
        } catch (error) {
            return res.status(403).json({
                status: "error",
                message: "Token inválido ou expirado"
            })
        }
    }
    
    export default autenticar