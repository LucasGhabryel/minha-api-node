import pool from '../../db.js'

export const listarEmpresasGeral = async (req, res) => {
    try{
        const [empresasGeral] = await pool.execute('SELECT usuario_id, razao_social, cnpj, banco, agencia, conta, chave_pix FROM Contas')

        res.status(200).json({
            status: "success",
            message: "Dados Empresariais listados com sucesso",
            data: empresasGeral
        });
    } catch(error){
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Error ao listar Dados Empresariais"
        })
    }
}

export const listarEmpresasId = async (req, res) => {
    const usuario_id = req.params.id

    try{
        const [empresasId] = await pool.execute('SELECT usuario_id, razao_social, cnpj, banco, agencia, conta, chave_pix FROM Contas WHERE usuario_id = ?', [usuario_id])

        res.status(200).json({
            status: "success",
            message: "Dados Empresariais listados com sucesso",
            data: empresasId
        });
    } catch(error){
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Error ao listar Dados Empresariais"
        })
    }
}

export const criarEmpresa = async (req, res) => {
    if (!req.body.usuario_id || !req.body.razao_social || !req.body.banco || !req.body.agencia || !req.body.conta || !req.body.chave_pix || !req.body.cnpj) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }

    try {
        const [result] = await pool.execute (
            'INSERT INTO Contas (usuario_id, razao_social, cnpj, banco, agencia, conta, chave_pix) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.body.usuario_id, req.body.razao_social, req.body.cnpj, req.body.banco, req.body.agencia, req.body.conta, req.body.chave_pix]
        )
        
        res.status(201).json({
            status: "success",
            message: "Dados Empresariais cadastrada com sucesso",
            data: {
                usuario_id: req.body.usuario_id,
                razao_social: req.body.razao_social,
                cnpj: req.body.cnpj,
                banco: req.body.banco,
                agencia: req.body.agencia,
                conta: req.body.conta,
                chave_pix: req.body.chave_pix
            }
        }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao cadastrar Dados Empresariais"
        })
    }
}


export const editarEmpresa = async (req, res) => {
    const campos = [];
    const valores = [];
    
    if (req.body.razao_social) {
        campos.push("razao_social = ?");
        valores.push(req.body.razao_social);
    }
    
    if (req.body.cnpj) {
        campos.push("cnpj = ?");
        valores.push(req.body.cnpj);
    }

    if (req.body.banco) {
        campos.push("banco = ?");
        valores.push(req.body.banco);
    }
    
    if (req.body.agencia) {
        campos.push("agencia = ?");
        valores.push(req.body.agencia);
    }

    if (req.body.conta) {
        campos.push("conta = ?");
        valores.push(req.body.conta);
    }

    if (req.body.chave_pix) {
        campos.push("chave_pix = ?");
        valores.push(req.body.chave_pix);
    }
    
    if(campos.length === 0){
        return res.status(400).json({
            status: "error",
            message: "Nenhum campo a atualizar"
        });
    }

    try {
        const query = ` UPDATE Contas SET ${campos.join(", ")} WHERE usuario_id = ?`;
        
        valores.push(req.params.id);

        const[result] = await pool.execute(query, valores);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status:"error",
                message:"Empresa não encontrada"
            });
        }
        res.status(200).json({
            status: "sucess",
            message: "Dados Empresariais atualizado com sucesso"
        }); 

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:"error",
            message:"Error ao atualizar Dados Empresariais"
        })
    }
}

export const deletarEmpresa = async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM Contas WHERE usuario_id = ?',
            [req.params.id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Empresa não encontrada"
            })
        }

        res.status(200).json({
            status: "success",
            message: "Dados Empresariais deletados com sucesso"
        })
    } catch (error){
        res.status(500).json({
            status: "error",
            message: "Erro ao deletar Dados Empresariais"
        })
    }
}