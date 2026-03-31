import express from "express"
import bodyParser from "body-parser" 
import { PrismaClient } from "@prisma/client"
import pool from './db.js'

const prisma = new PrismaClient()


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.get('/favicon.ico', (req, res) => res.status(204))


// ROTA PRINCIPAL //

app.get('/', (req, res) => {
    res.status(200).json({
       status: "success",
       message: "API funcionando"
    })
})

// ROTAS DE AUTENTICAÇÃO //

app.post('/login', async (req, res) =>{

    if (!req.body.email || !req.body.senha) {
        return res.status(400).json({
            status: "error",
            message: "Email e senha são obrigatórios"
        })
    }
    try {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [req.body.email]
        )

        const user = rows[0]

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado"
            })
        }

        if (req.body.senha !== user.senha) {
            return res.status(401).json({
                status: "error",
                message: "Senha incorreta"
            })
        }
        res.status(200).json({
            status: "success",
            message: "Login bem-sucedido",
            data: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo_usuario
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao realizar login"
        })
    }
})

// ROTAS DE USUARIOS //

app.post('/usuarios', async (req, res) => {
if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.tipo_usuario) {
    return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios não preenchidos"
    })
}
    try {
  const [result] = await pool.query (
    'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
[req.body.nome, req.body.email, req.body.senha, req.body.tipo_usuario]
  )
  
  res.status(201).json({
    status: "success",
    message: "Usuário criado com sucesso",
    data: {
        id: result.insertId,
        nome: req.body.nome,
        email: req.body.email,
        tipo_usuario: req.body.tipo_usuario
    }
  }) 
} catch (error) {
    res.status(500).json({
        status: "error",
        message: "Erro ao criar usuário"
    })
}
})

app.get('/usuarios', async (req, res) => {
try {
    
    let query = 'SELECT id, nome, email, tipo_usuario, status, data_cadastro FROM usuarios WHERE 1=1'
    const params = []

    if (req.query.nome) {
        query += ' AND nome = ?'
        params.push(req.query.nome)
    }

    if (req.query.email) {
        query += ' AND email = ?'
        params.push(req.query.email)
    }

    if (req.query.tipo_usuario){
        query += ' AND tipo_usuario = ?'
        params.push(req.query.tipo_usuario)
    }

      const [rows] = await pool.query(query, params)
        
        res.status(200).json({
            status: "success",
            message: "Usuários listados com sucesso",
            data: rows
        })

    } catch (error) {
        console.log(error)
    res.status(500).json({
        status: "error",
        message: "Error ao listar usuários"
    })
 }
})

app.patch('/usuarios/:id', async (req, res) => {
if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.tipo_usuario) {
    return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios não preenchidos"
    })
}
     try{
        const [result] = await pool.query(
            'UPDATE usuarios SET nome = ?, email = ?, senha = ?, tipo_usuario = ? WHERE id = ?',
            [req.body.nome, req.body.email, req.body.senha, req.body.tipo_usuario, req.params.id]
        )
     
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado"
            })
        }
        
   res.status(200).json({
    status: "success",
    message: "Usuário editado com sucesso",
    data: {
        id: req.params.id,
        nome: req.body.nome,
        email: req.body.email,
        tipo_usuario: req.body.tipo_usuario
    }
     })
} catch (error) {
    console.log(error)
    res.status(500).json({
        status: "error",
        message: "Erros ao editar usuário"
        })
    }
})

app.delete('/usuarios/:id', async (req, res) => {
try {
   const [result] = await pool.query(
    'DELETE FROM usuarios WHERE id = ?',
    [req.params.id]
   )

   if (result.affectedRows === 0) {
    return res.status(404).json({
        status: "error",
        message: "Usuário não encontrado"
    })
   }
        res.status(200).json({
            status: "success",
            message: "Usuário deletado com sucesso"
        })
    } catch (error){
        res.status(500).json({
            status: "error",
            message: "Erro ao deletar usuário"
        })
    }
})

// ROTAS DE COMISSÕES //

app.get('/comissoes', async (req, res) =>{
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

      if (req.query.usuario) {
        await gerarPagamento(Number(req.query.usuario))
      }


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
})

app.get('/comissoes-subafiliado/:id', async (req, res) => {
    const subafiliadoId = parseInt(req.params.id);  

    try{      

        const [result] = await pool.execute(
            'SELECT SUM(valor) as total FROM comissoes_subafiliados WHERE subafiliado_id = ?', [subafiliadoId]
        );
        const totalComissoes = result[0].total;

        const [comissoesSubafiliados] = await pool.execute(
            'SELECT id, valor, data FROM comissoes_subafiliados WHERE subafiliado_id = ?', [subafiliadoId]
        );

        res.status(200).json({
            status: "success",
            message: "comissões dos Sub-Afiliados listados com sucesso",
            data:  {
                Comissoes: result[0].total || 0,
                data: comissoesSubafiliados
            }
        })
    } catch(error) {
        res.status(500).json({
            status: "error",
            message: "Error ao listar comissões dos Sub-Afiliados"
        })
    }
})

// ROTAS DE CADASTROS //

app.get('/cadastros-a-aprovar', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nome, email, status FROM usuarios WHERE status = ?',
            ['pendente']
        )

        res.status(200).json({
            status:"success",
            message: "Cadastros pendentes listados com sucesso",
            data: rows
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao listar cadastros pendentes"
        })
    }
})

app.patch('/cadastros-a-aprovar/:id', async (req, res) => {
    const { status } = req.body

    if(!status) {
        return res.status(400).json({
            status: "error",
            message: "Status é obrigatorio"
        })
    }

    let novoStatus

    if (status === "aprovado") {
        novoStatus = "ativo"
    } else if (status === "rejeitado") {
        novoStatus = "desativado"
    } else if (["ativo", "pendente", "desativado"].includes(status)) {
        novoStatus = status
    } else {
        return res.status(400).json({
            status: "error",
            message: "Status inválido"
        })
    }

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET status = ? WHERE id = ?',
            [novoStatus, req.params.id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado"
            })
        }

        const [rows] = await pool.query(
            'SELECT id, nome, email, status, data_cadastro FROM usuarios WHERE id = ?',
            [req.params.id]
        )
        
    
    res.status(200).json({
        status: "success",
        data: rows[0]
        })
    
    
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Erro ao atualizar cadastro"
        })
    }
})

// ROTAS DE PAGAMENTOS //

app.get('/pagamentos-a-aprovar', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, usuario_id, valor, status, data_pagamento FROM pagamentos WHERE status = ?',
            ['pendente']
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
     })
    
     app.patch('/pagamentos/:id', async (req, res) => {
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
           const [result] = await pool.query(
            'UPDATE pagamentos SET status = ? WHERE id = ?',
            [novoStatus, req.params.id]
           )
            
           if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "Pagamento não encontrado"
            })
           }
            
           const [rows] = await pool.query(
            'SELECT id, valor, status, data_pagamento FROM pagamentos WHERE id = ?',
            [req.params.id]
           )

            res.status(200).json({
                status: "success",
                data: {
                    id: rows[0].id,
                    valor: Number(rows[0].valor),
                    status:rows.status,
                    data_pagamento: rows.data_pagamento
                }
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: "error",
                message: "Erro ao atualizar pagamento"
            })
        }
     })



// Rotas Sub-Afiliados // 

app.get('/subafiliados', async (req, res) => {
    try {
        const { afiliado_id } = req.query;

        let query = 'SELECT * FROM subafiliados';
        let values = [];

        if (afiliado_id) {
            query += ' WHERE afiliado_id = ?';
            values.push(parseInt(afiliado_id));
        }

        const [subAfiliados] = await pool.execute(query, values);

        res.status(200).json({
            status: "success",
            message: "Sub-Afiliados listados com sucesso",
            data: subAfiliados
        });
    } catch(error) {
        res.status(500).json({
            status: "error",
            message: "Erro ao puxar os sub-afiliados"
        })
    }
})

app.post('/subafiliados', async (req, res) => {

    const {afiliado_id, nome, email} = req.body

    if (!afiliado_id || !nome || !email) {
        return res.status(400).json({
            status: "error",
            message: "Campos obrigatórios não preenchidos"
        })
    }
    try{
        const [resultado] = await pool.execute(
            'INSERT INTO subafiliados (afiliado_id, nome, email) VALUES (?, ?, ?)',
            [afiliado_id, nome, email]
        );
        res.status(201).json({
            status: "success",
            message: "Sub-Afiliado criado com sucesso",
            data: {id: resultado.insertId, afiliado_id, nome, email}
        }) 
    } catch(error){
        res.status(500).json({
                status: "error",
                message: "Erro ao criar Sub-Afiliado"
            })
        }
    })

app.patch('/subafiliados/:id', async (req, res) => {
    
    const {nome, email, status} = req.body;

    if (nome === undefined && email === undefined && status === undefined) {
        return res.status(400).json({
        status: "error",
        message: "Nenhum campo válido para atualização foi fornecido. Os campos permitidos são: nome, email, status."
        });
    }
    
    const updates = [];
    const valores = [];

    if (nome !== undefined) {
        updates.push('nome = ?');
        valores.push(nome);
    }
    if (email !== undefined) {
        updates.push('email = ?');
        valores.push(email);
    }
    if (status !== undefined) {
        updates.push('status = ?');
        valores.push(status);
    }

    valores.push(parseInt(req.params.id));

    try{
        const [subAfiliados] = await pool.execute(
            `UPDATE subafiliados SET ${updates.join(', ')} WHERE id = ?`, valores
        ); 

    
    const [subAfiliadoAtualizado] = await pool.execute(
        'SELECT id, nome, email, status, data_cadastro FROM subafiliados WHERE id = ?',
        [parseInt(req.params.id)]
    );

        res.status(200).json({
            status: "success",
            message: "Sub-Afiliado editado com sucesso",
            data: subAfiliadoAtualizado[0]
        });
    } catch(erro) {
        console.error(erro)
        res.status(500).json({
            status: "error",
            message: "Erros ao editar Sub-Afiliados"
        })
    }
})

// ROTAS DE Links //
app.get('/links-afiliado/:id', async (req, res) => {

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
})


// SERVIDOR //

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})