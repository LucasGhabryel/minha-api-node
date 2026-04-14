import pool from '../../db.js'

export const listarLinkAfiliados = async (req, res) => {

        const linksAfiliadoId = parseInt(req.params.id);

        try{
            
            const [linksAfiliado] = await pool.execute(
                'SELECT id, link FROM links_afiliado WHERE afiliado_id = ?', [linksAfiliadoId]
            );

            res.status(200).json({
                status: "success",
                message: "Links do Afiliado listados com sucesso",
                data: linksAfiliado
            });
        } catch(error) {
            res.status(500).json({
                status: "error",
                message: "Error ao listar links do Afiliado"
            })
        }
    }

