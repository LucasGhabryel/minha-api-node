import pool from '../../db.js'

export const listarPagamentosPendentes = async (req, res) => {
    const parametroStatus = [];
    let campo = "";
    
    if (req.query.status){
        parametroStatus.push(req.query.status);
        campo = "WHERE status = ?";
    }
    
    try {
        const [rows] = await pool.query(
            `SELECT id, usuario_id, valor, status, data_pagamento FROM pagamentos ${campo}`,
            [parametroStatus]
        )
            
        res.status(200).json ({
            status:"success",
            data: rows
        })            
    } catch (error) {
        console.log(error)
        res.status(500).json({
        status: "error",
        message: "Error ao listar pagamentos pendentes"
        })
    }
}
        
export const criarPagamento = async (req, res) => {

    if (!req.body.usuario_id || !req.body.valor) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }

    try{
        const [result] = await pool.execute('INSERT INTO pagamentos (usuario_id, valor, status) VALUES (?, ?, ?)', [req.body.usuario_id, req.body.valor, 'pendente']);

        res.status(201).json({
            status: "success",
            message: "Usuário criado com sucesso",
            data: {
                id: result.insertId,
                usuario_id: req.body.usario_id,
                valor: req.body.valor,
                status: 'pendente'
            }
        })
    } catch(error){
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao criar solicitação de Saque"
        })
    }
}

export const atualizarPagamento = async (req, res) => {
    const { status } = req.body

    if (!status) {
        return res.status(400).json({
            status: "error",
            message: "Status é obrigatório"
        })
    }   

    let novoStatus

    if (status === "aprovado") {
        novoStatus = "pago"
    } else if (status === "rejeitado") {
        novoStatus = "rejeitado"
    } else if (["pendente", "pago", "rejeitado"].includes(status)) {
        novoStatus = status
    } else {
        return res.status(400).json({
            status: "error",
            message: "Status inválido"
        })
    }

    try {
    const [result] = await pool.execute(
        'UPDATE pagamentos SET status = ? WHERE id = ?',
        [novoStatus, req.params.id]
    )
        
    if (result.affectedRows === 0) {
        return res.status(404).json({
            status: "error",
            message: "Pagamento não encontrado"
        })
    }
        
    const [rows] = await pool.execute(
        'SELECT id, valor, status, data_pagamento FROM pagamentos WHERE id = ?',
        [req.params.id]
    )

        res.status(200).json({
            status: "success",
            data: {
                id: rows[0].id,
                valor: Number(rows[0].valor),
                status:rows[0].status,
                data_pagamento: rows[0].data_pagamento
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao atualizar pagamento"
        })
    }
}