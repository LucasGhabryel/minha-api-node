import pool from '../../db.js'

export const listarVendas = async (req, res) => {
    try{
        const usuario_id = req.usuario.id;
        
        const query = 'SELECT id, afiliado_id, id_compra, id_produto, valor, data_venda FROM Vendas WHERE afiliado_id = ?';
        const values = [usuario_id]

        const [Vendas] = await pool.execute(query, values);
    
        return res.status(200).json({
            status: "success",
            message: "Vendas listadas com sucesso",
            data: Vendas
        });
        
    } catch(error) {
        console.log(error)
        res.status(500).json({
        status: "Error",
        message: "Erro ao listar vendas"
       })
    }
    
}

export const criarVendas = async (req, res) => {
    
    if(!req.body.valor){
            return res.status(400).json({
                status: "Erro",
                message: "Valor indefinido"
            })
        }
    
    try {
        const afiliado_id = req.usuario.id

        const [result] = await pool.execute (
            'INSERT INTO Vendas (afiliado_id, valor) VALUES(?, ?)',
            [afiliado_id, req.body.valor]
        )

        res.status(201).json({
            status:"success",
            message:"Sucesso ao criar venda"
        })
    } catch(error) {
        console.log(error)
        res.status(500).json({
            status:"Error",
            message:"erro ao criar venda"
        })
    }
}