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
        status: "error",
        message: "Erro ao listar vendas"
       })
    }
    
}

export const criarVenda = async (req, res) => {
    
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

        const [VendaCriada] = await pool.execute(
            'SELECT id, afiliado_id, id_compra, id_produto, valor, data_venda FROM Vendas WHERE id = ?',
            [result.insertId]
        )

        return res.status(201).json({
            status:"success",
            message:"Sucesso ao criar venda",
            data: VendaCriada
        });
    } catch(error) {
        console.log(error)
        return res.status(500).json({
            status:"error",
            message:"erro ao criar venda"
        })
    }
}

    export const editarVenda = async (req, res) => {

        if(!req.body.valor) {
            return res.status(400).json({
                status:"error",
                message: "Valor indefinido"
            })
        };

        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Venda não encontrada"
            });
        }
          
        try {
            const [result] = await pool.execute ('UPDATE Vendas SET valor = ? WHERE id = ?',
            [req.body.valor, req.params.id]
        )

        const [vendaEditada] = await pool.execute ('SELECT id, afiliado_id, id_compra, id_produto, valor, data_venda FROM Vendas WHERE id = ?',
            [req.params.id]
        )

         return res.status(200).json({
            status: "success",
            message: "venda atualizada",
            data: vendaEditada[0]
          });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: "error",
                message: "Erro ao atualizar venda"
            });
        }

      
    }