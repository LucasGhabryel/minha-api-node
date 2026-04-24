import pool from '../../db.js'

export const calcularComissaoAfiliado = async ( req, res ) => {
    
    const comissao_afiliado = `
        SELECT
            SUM(Vendas.valor) AS total_vendas,
            comissoes.valor AS comissao_percentual,
            SUM(Vendas.valor) * (comissoes.valor / 100) AS comissao_calculada
        FROM Vendas
        JOIN comissoes
            ON Vendas.referencia_id = comissoes.usuario_id
        WHERE Vendas.referencia_id = ?
        GROUP BY 
            Vendas.referencia_id,
            comissoes.valor;
    `;

    const comissaoSubAfiliados =`
        SELECT
            Vendas.referencia_id AS sub_afiliado_id,
            SubAfiliado.referencia_id AS afiliado_id,
            SUM(Vendas.valor) AS total_vendas_sub,
            ComissaoSubAfiliado.valor AS comissao_sub,
            ComissaoAfiliado.valor AS comissao_afiliado,
            (SUM(Vendas.valor) * (ComissaoAfiliado.valor - ComissaoSubAfiliado.valor) / 100) AS comissao_afiliado_calculada
        FROM Vendas
        JOIN usuarios SubAfiliado ON Vendas.referencia_id = SubAfiliado.id 
        JOIN comissoes ComissaoSubAfiliado ON Vendas.referencia_id = ComissaoSubAfiliado.usuario_id 
        JOIN usuarios Afiliado ON SubAfiliado.referencia_id = Afiliado.id 
        JOIN comissoes ComissaoAfiliado ON Afiliado.id = ComissaoAfiliado.usuario_id 
        WHERE SubAfiliado.referencia_id = ?
        GROUP BY Vendas.referencia_id, SubAfiliado.referencia_id, ComissaoSubAfiliado.valor, ComissaoAfiliado.valor;
    `

    try{
        const [rows_comissao_propria] = await pool.execute(comissao_afiliado, [req.params.id])
        const comissao_propria = rows_comissao_propria[0] || null;

        const [subAfiliados] = await pool.execute(`SELECT * FROM usuarios WHERE referencia_id = ?`, [req.params.id])

        let detalhes_sub_afiliados = [];
        let total_comissao_sub = 0;

        if (subAfiliados.length > 0) {
            const [rows_subAfiliados] = await pool.execute(comissaoSubAfiliados, [req.params.id]);
            detalhes_sub_afiliados = rows_subAfiliados;
            total_comissao_sub = rows_subAfiliados.reduce((acc, row) => {
                return acc + parseFloat(row.comissao_afiliado_calculada);
            }, 0);
        }

        return res.status(200).json({
            comissao_propria: {
                detalhes: comissao_propria,
                total: comissao_propria ? comissao_propria.comissao_calculada : 0
            },
            comissao_sub_afiliados: {
                detalhes: detalhes_sub_afiliados,
                total: total_comissao_sub
            },
            total_geral: (comissao_propria ? comissao_propria.comissao_calculada : 0) + total_comissao_sub
        });
    } catch(error){
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Error ao Calcular Comissões"
        })
    }          
}