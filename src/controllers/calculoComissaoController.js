import pool from '../../db.js'

export const calcularComissaoAfiliado = async ( req, res ) => {
    
    const comissao_afiliado = `
        SELECT
            SUM(Vendas.valor) AS total_vendas,
            comissoes.percentual AS comissao_percentual,
            SUM(Vendas.valor) * (comissoes.percentual / 100) AS comissao_calculada
        FROM Vendas
        JOIN comissoes
            ON Vendas.afiliado_id = comissoes.usuario_id
        WHERE Vendas.afiliado_id = ?
        GROUP BY 
            Vendas.afiliado_id,
            comissoes.percentual;
    `;

    const comissaoSubAfiliados =`
        SELECT
            Vendas.afiliado_id AS sub_afiliado_id,
            SubAfiliado.referencia_id AS afiliado_id,
            SUM(Vendas.valor) AS total_vendas_sub,
            ComissaoSubAfiliado.percentual AS comissao_sub,
            ComissaoAfiliado.percentual AS comissao_afiliado,
            (SUM(Vendas.valor) * (ComissaoAfiliado.percentual - ComissaoSubAfiliado.percentual) / 100) AS comissao_afiliado_calculada
        FROM Vendas
        JOIN usuarios SubAfiliado ON Vendas.afiliado_id = SubAfiliado.id 
        JOIN comissoes ComissaoSubAfiliado ON Vendas.afiliado_id = ComissaoSubAfiliado.usuario_id 
        JOIN usuarios Afiliado ON SubAfiliado.referencia_id = Afiliado.id 
        JOIN comissoes ComissaoAfiliado ON Afiliado.id = ComissaoAfiliado.usuario_id 
        WHERE SubAfiliado.referencia_id = ?
        GROUP BY Vendas.afiliado_id, SubAfiliado.referencia_id, ComissaoSubAfiliado.percentual, ComissaoAfiliado.percentual;
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

        const propria = parseFloat(comissao_propria?.comissao_calculada || 0);
        const sub = total_comissao_sub;

        return res.status(200).json({
            comissao_propria: {
                detalhes: comissao_propria,
                total: parseFloat(propria.toFixed(2))
            },
            comissao_sub_afiliados: {
                detalhes: detalhes_sub_afiliados,
                total: parseFloat(total_comissao_sub.toFixed(2))
            },
            total_geral: parseFloat((propria + sub).toFixed(2))
        });
    } catch(error){
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Error ao Calcular Comissões"
        })
    }          
}