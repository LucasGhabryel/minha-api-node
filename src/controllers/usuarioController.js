   import pool from '../../db.js'
   
   export const criarUsuario = async (req, res) => {
    if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.tipo_usuario) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }
        try {
    const [result] = await pool.query (
        'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
    [req.body.nome, req.body.email, req.body.senha, req.body.tipo_usuario]
    )
    
    res.status(201).json({
        status: "success",
        message: "Usuário criado com sucesso",
        data: {
            id: result.insertId,
            nome: req.body.nome,
            email: req.body.email,
            tipo_usuario: req.body.tipo_usuario
        }
    }) 
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Erro ao criar usuário"
        })
    }
    }

    export const listarUsuarios = async (req, res) => {
    try {
        
        let query = 'SELECT id, nome, email, tipo_usuario, status, data_cadastro FROM usuarios WHERE 1=1'
        const params = []

        if (req.query.nome) {
            query += ' AND nome = ?'
            params.push(req.query.nome)
        }

        if (req.query.email) {
            query += ' AND email = ?'
            params.push(req.query.email)
        }

        if (req.query.tipo_usuario){
            query += ' AND tipo_usuario = ?'
            params.push(req.query.tipo_usuario)
        }

        const [rows] = await pool.query(query, params)
            
            res.status(200).json({
                status: "success",
                message: "Usuários listados com sucesso",
                data: rows
            })

        } catch (error) {
            console.log(error)
        res.status(500).json({
            status: "error",
            message: "Error ao listar usuários"
        })
    }
    }

     export const editarUsuario = async (req, res) => {
    if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.tipo_usuario) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }
        try{
            const [result] = await pool.query(
                'UPDATE usuarios SET nome = ?, email = ?, senha = ?, tipo_usuario = ? WHERE id = ?',
                [req.body.nome, req.body.email, req.body.senha, req.body.tipo_usuario, req.params.id]
            )
        
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Usuário não encontrado"
                })
            }
            
    res.status(200).json({
        status: "success",
        message: "Usuário editado com sucesso",
        data: {
            id: req.params.id,
            nome: req.body.nome,
            email: req.body.email,
            tipo_usuario: req.body.tipo_usuario
        }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erros ao editar usuário"
            })
        }
    }

    export const deletarUsuario = async (req, res) => {
    try {
    const [result] = await pool.query(
        'DELETE FROM usuarios WHERE id = ?',
        [req.params.id]
    )

    if (result.affectedRows === 0) {
        return res.status(404).json({
            status: "error",
            message: "Usuário não encontrado"
        })
    }
            res.status(200).json({
                status: "success",
                message: "Usuário deletado com sucesso"
            })
        } catch (error){
            res.status(500).json({
                status: "error",
                message: "Erro ao deletar usuário"
            })
        }
    }