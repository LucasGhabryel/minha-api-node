 import pool from '../../db.js'
 
 export const listarSubafiliados = async (req, res) => {
        try {
            const referencia_id = req.usuario.id;

            const query = `SELECT id, referencia_id, nome, email, status, data_cadastro, tipo_usuario FROM usuarios WHERE tipo_usuario = 3 `;
            const values = [referencia_id];

            const [subAfiliados] = await pool.execute(query, values);

            res.status(200).json({
                status: "success",
                message: "Sub-Afiliados listados com sucesso",
                data: subAfiliados
            });
        } catch(error) {
            res.status(500).json({
                status: "error",
                message: "Erro ao puxar os sub-afiliados"
            })
        }
    }

    export const criarSubafiliado = async (req, res) => {

        const {afiliado_id, nome, email, percentual,} = req.body

        const referencia_id = req.usuario.id

        if (!afiliado_id || !nome || !email || percentual == null || !referencia_id) {
            return res.status(400).json({
                status: "error",
                message: "Campos obrigatórios não preenchidos"
            })
        }

        if (percentual < 0 || percentual > 50){
            return res.status(400).json({
                status: "error",
                message: "Percentual deve estar entre 0 e 50"
            });
        }

        try{
            const [resultado] = await pool.execute(
                'INSERT INTO subafiliados (afiliado_id, nome, email, percentual, referencia_id) VALUES (?, ?, ?, ?, ?)',
                [afiliado_id, nome, email, percentual, referencia_id]
            );
            res.status(201).json({
                status: "success",
                message: "Sub-Afiliado criado com sucesso",
                data: {id: resultado.insertId, afiliado_id, nome, email, percentual, referencia_id}
            }) 
        } catch(error){
            console.log(error)
            res.status(500).json({
                    status: "error",
                    message: "Erro ao criar Sub-Afiliado"
                })
            }
        }

    export const editarSubafiliado = async (req, res) => {
        
        const {nome, email, status, percentual} = req.body;

        if (nome === undefined && email === undefined && status === undefined && percentual === undefined) {
            return res.status(400).json({
            status: "error",
            message: "Nenhum campo válido para atualização foi fornecido. Os campos permitidos são: nome, email, status, percentual."
            });
        }
        
        const updates = [];
        const valores = [];

        if (nome !== undefined) {
            updates.push('nome = ?');
            valores.push(nome);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            valores.push(email);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            valores.push(status);
        }
        if (percentual !== undefined) {
            updates.push('percentual = ?');
            valores.push(percentual);
        }

        valores.push(parseInt(req.params.id));

        try{
            await pool.execute(
                `UPDATE subafiliados SET ${updates.join(', ')} WHERE id = ?`, valores
            ); 

        
        const [subAfiliadoAtualizado] = await pool.execute(
            'SELECT id, nome, email, status, percentual, data_cadastro FROM subafiliados WHERE id = ?',
            [parseInt(req.params.id)]
        );

            res.status(200).json({
                status: "success",
                message: "Sub-Afiliado editado com sucesso",
                data: subAfiliadoAtualizado[0]
            });
            
        } catch(erro) {
            const {nome, email, status, percentual} = req.body;
            console.error('body recebido', req.body)
            res.status(500).json({
                status: "error",
                message: "Erros ao editar Sub-Afiliados"
            })
        }
    }