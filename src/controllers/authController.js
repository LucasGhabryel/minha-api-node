import pool from '../../db.js'
import jwt from "jsonwebtoken"
import UserStatus from '../utils/statusUsuario.js'

export const login = async (req, res) => {

        if (!req.body.email || !req.body.senha) {
            return res.status(400).json({
                status: "error",
                message: "Email e senha são obrigatórios"
            })
        }
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE email = ?',
                [req.body.email]
            )

            const usuario = rows[0]

            if (!usuario || usuario.senha !== req.body.senha) {
                return res.status(401).json({
                    status: "error",
                    message: "Email ou senha inválidos"
                })
            }

            if(usuario.status !== 1) {
                return res.status(403).json({
                    status: "error",
                    message: "Usuário não aprovado"
                })
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            )

            res.status(200).json({
                status: "success",
                message: "Login bem-sucedido",
                data: {
                    token,
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo_usuario
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: "error",
                message: "Erro ao realizar login"
            })
        }
    }

    