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

        const [rows] = await pool.execute(query, params)


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

export const criarComissoes = async ( req, res ) => {
    if (!req.body.usuario_id || !req.body.percentual) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }

    const dataHoraAtual = new Date();
    const dataFormatada = dataHoraAtual.toISOString().slice(0, 19).replace('T', ' ');

    try {
        const [result] = await pool.execute (
            'INSERT INTO comissoes (usuario_id, percentual, data) VALUES (?, ?, ?)', [req.body.usuario_id, req.body.percentual, dataFormatada]
        )
        
        res.status(201).json({
            status: "success",
            message: "Comissão criada com sucesso",
            data: {
                id: result.insertId,
                Usuário_id: req.body.usuario_id,
                Percentual: req.body.percentual         
            }
        }) 
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Erro ao criar comissão"
        })
    }
}


export const editarComissoes = async ( req, res ) => {
    const campos = [];
    const valores = [];
    
    if (req.body.usuario_id) {
        campos.push("usuario_id = ?");
        valores.push(req.body.usuario_id);
    }
    
     if (req.body.percentual) {
        campos.push("percentual = ?");
        valores.push(req.body.percentual);
    }

     if (req.body.data) {
        campos.push("data = ?");
        valores.push(req.body.data);
    }

    if (campos.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Nenhum campo a atualizar"
        });
    }

    try {
        const query = ` UPDATE comissoes SET ${campos.join(", ")} WHERE id = ?`;
        
        valores.push(req.params.id);

        const[result] = await pool.execute(query, valores);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status:"error",
                message:"Comissão não encontrado"
            });
        }
        res.status(200).json({
            status: "sucess",
            message: "Comissão atualizado com sucesso"
        }); 

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:"error",
            message:"Error ao atualizar comissoes"
        })
    }
}


export const resumoComissoes = async (req, res) => {
    try {
        const afiliado_id = req.usuario.id

        // 1. Total de comissões — vendas do afiliado + sub-afiliados
        const [totalRows] = await pool.execute(`
    SELECT SUM(v.valor * (c.percentual / 100)) AS total
    FROM Vendas v
    JOIN comissoes c ON c.usuario_id = v.afiliado_id
    WHERE v.afiliado_id = ?
    OR v.afiliado_id IN (
        SELECT id FROM subafiliados WHERE referencia_id = ?
    )
`, [afiliado_id, afiliado_id])

const [pagoRows] = await pool.execute(`
    SELECT SUM(valor) AS total_pago
    FROM pagamentos
    WHERE afiliado_id = ? AND status = 'pago'
`, [afiliado_id])


        // 3. Cálculo do saldo
        const totalComissoes = totalRows[0].total || 0
        const valorPago = pagoRows[0].total_pago || 0
        const saldoDisponivel = totalComissoes - valorPago

        return res.status(200).json({
            status: "success",
            message: "Resumo de comissões",
            data: {
                totalComissoes,
                valorPago,
                saldoDisponivel
            }
        })

    } catch(error) {
        console.log(error)
        return res.status(500).json({
            status: "error",
            message: "Erro ao buscar resumo de comissões"
        })
    }
}