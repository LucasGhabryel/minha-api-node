import pool from '../../db.js'

   export const listarComissoes = async (req, res) =>{
        try {
        
        let query = 'SELECT * FROM comissoes WHERE 1=1'
        const params = []

        if (req.query.usuario) {
            query += ' AND usuario_id = ?'
            params.push(Number(req.query.usuario))
        }
        if (req.query.data_inicio) {
            query += ' AND data >= ?'
            params.push(new Date(req.query.data_inicio))
        }
        if (req.query.data_fim) {   
            query += ' AND data <= ?'
            params.push(new Date(req.query.data_fim))
        }

        const [rows] = await pool.query(query, params)


            const total_comissoes = rows.reduce((acc, c) => acc + Number(c.valor), 0)

            res.status(200).json({
                status: "success",
                message: "Comissões listadas com sucesso",
                data: {
                    total_comissoes,
                    ultimas_comissoes: rows
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: "error",
                message: "Error ao listar comissões"
            })
        }
    }

    export const listarComissoesSubafiliado = async (req, res) => {
        const subafiliadoId = parseInt(req.params.id);  

        try{      

            const [result] = await pool.execute(
                'SELECT SUM(valor) as total FROM comissoes_subafiliados WHERE subafiliado_id = ?', [subafiliadoId]
            );
            const totalComissoes = result[0]?.total || 0;

            const [comissoesSubafiliados] = await pool.execute(
                'SELECT id, valor, data FROM comissoes_subafiliados WHERE subafiliado_id = ?', [subafiliadoId]
            );

            res.status(200).json({
                status: "success",
                message: "comissões dos Sub-Afiliados listados com sucesso",
                data:  {
                    Comissoes: totalComissoes,
                    data: comissoesSubafiliados
                }
            })
        } catch(error) {
            res.status(500).json({
                status: "error",
                message: "Error ao listar comissões dos Sub-Afiliados"
            })
        }
    }