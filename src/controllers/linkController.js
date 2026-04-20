import pool from '../../db.js'

export const listarLinkAfiliadosGeral = async (req,res) =>{
    
    try{
        const [linksAfiliados] = await pool.execute('SELECT id, afiliado_id, link FROM links_afiliado')

        res.status(200).json({
            status: "success",
            message: "Links do Afiliado listados com sucesso",
            data: linksAfiliados
        });
    } catch(error){
        res.status(500).json({
            status: "error",
            message: "Error ao listar links do Afiliado"
        })
    }
}

export const listarLinkAfiliadosId = async (req, res) => {

        const linksAfiliadoId = req.params.id;


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

export const criarLinkAfiliados = async (req, res) => {

    if (!req.body.afiliado_id || !req.body.link) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }

    const afiliado_id = req.body.afiliado_id;
    const link = req.body.link;

    try{
        const [result] = await pool.execute('INSERT INTO links_afiliado (afiliado_id, link) VALUES (?, ?)', [afiliado_id, link]);

        res.status(201).json({
            status: "success",
            message: "Link criado com sucesso",
        }) 
    } catch(error){
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao criar Link"
        })
    }
}
