 import pool from '../../db.js'

 export const listarCadastrosPendente = async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT id, nome, email, status FROM usuarios WHERE status = ?',
                ['pendente']
            )

            res.status(200).json({
                status:"success",
                message: "Cadastros pendentes listados com sucesso",
                data: rows
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: "error",
                message: "Erro ao listar cadastros pendentes"
            })
        }
    }

    export const atualizarCadastro = async (req, res) => {
        const { status } = req.body

        if(!status) {
            return res.status(400).json({
                status: "error",
                message: "Status é obrigatorio"
            })
        }

        let novoStatus

        if (status === "aprovado") {
            novoStatus = "ativo"
        } else if (status === "rejeitado") {
            novoStatus = "desativado"
        } else if (["ativo", "pendente", "desativado"].includes(status)) {
            novoStatus = status
        } else {
            return res.status(400).json({
                status: "error",
                message: "Status inválido"
            })
        }

        try {
            const [result] = await pool.query(
                'UPDATE usuarios SET status = ? WHERE id = ?',
                [novoStatus, req.params.id]
            )

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Usuário não encontrado"
                })
            }

            const [rows] = await pool.query(
                'SELECT id, nome, email, status, data_cadastro FROM usuarios WHERE id = ?',
                [req.params.id]
            )
            
        
        res.status(200).json({
            status: "success",
            data: rows[0]
            })
        
        
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: "error",
                message: "Erro ao atualizar cadastro"
            })
        }
    }