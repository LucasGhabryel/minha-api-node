   import pool from '../../db.js'
   import UserStatus from '../utils/statusUsuario.js';
   
   export const criarUsuario = async (req, res) => {
    if (!req.body.nome || !req.body.email || !req.body.tipo_usuario) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }

    if (!req.body.senha || req.body.senha === ""){
        req.body.senha = "nexus@123";
    }

    const status = req.body.tipo_usuario === 3 ? UserStatus[2] : null

        try {
    const [result] = await pool.query (
        'INSERT INTO usuarios (nome, email, senha, tipo_usuario, status) VALUES (?, ?, ?, ?, ?)',
    [req.body.nome, req.body.email, req.body.senha, req.body.tipo_usuario, status]
    )
    
    res.status(201).json({
        status: "success",
        message: "Usuário criado com sucesso",
        data: {
            id: result.insertId,
            nome: req.body.nome,
            email: req.body.email,
            tipo_usuario: req.body.tipo_usuario,
            status: status
        }
    }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao criar usuário"
        })
    }
    }

    export const listarUsuarios = async (req, res) => {
    try {
        
        let query = 'SELECT id, nome, email, tipo_usuario, status, data_cadastro, referencia_id FROM usuarios WHERE 1=1'
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
    const campos = [];
    const valores = [];
    
    if (req.body.nome) {
        campos.push("nome = ?");
        valores.push(req.body.nome);
    }
    
     if (req.body.email) {
        campos.push("email = ?");
        valores.push(req.body.email);
    }

     if (req.body.senha) {
        campos.push("senha = ?");
        valores.push(req.body.senha);
    }
    
     if (req.body.tipo_usuario) {
        campos.push("tipo_usuario = ?");
        valores.push(req.body.tipo_usuario);
    }

    if (campos.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Nenhum campo a atualizar"
        });
    }

    try {
        const query = ` UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`;
        
        valores.push(req.params.id);

        const[result] = await pool.query(query, valores);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status:"error",
                message:"Usuário não encontrado"
            });
        }
        res.status(200).json({
            status: "sucess",
            message: "Usuário atualizado com sucesso"
        }); 

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:"error",
            message:"Error ao atualizar usuário"
        })
    }
};





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