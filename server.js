import express from "express"
import bodyParser from "body-parser" 
import { PrismaClient } from "@prisma/client"

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
        const user = await prisma.usuarios.findUnique({
            where: { email: req.body.email}
        })

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
  const user = await prisma.usuarios.create({
    data: {
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        tipo_usuario: req.body.tipo_usuario
    }
  })
  res.status(201).json({
    status: "success",
    message: "Usuário criado com sucesso",
    data: user
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
    
    const filters = {}

    if (req.query.nome) {
        filters.nome = req.query.nome
    }

    if (req.query.email) {
        filters.email = req.query.email
    }

    if (req.query.tipo_usuario){
        filters.tipo_usuario = req.query.tipo_usuario
    }

       const users = await prisma.usuarios.findMany({
            where: filters,
            select: {
                id:true,
                nome: true,
                email: true,
                tipo_usuario: true,
                status: true,
                data_cadastro: true,
            }
        })
        res.status(200).json({
            status: "success",
            message: "Usuários listados com sucesso",
            data: users
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
  const user = await prisma.usuarios.update({
    where: { id: Number(req.params.id) },
    data: {
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        tipo_usuario: req.body.tipo_usuario
        }
    })
   res.status(200).json({
    status: "success",
    message: "Usuário editado com sucesso",
    data: user
     })
} catch (erro) {
    res.status(500).json({
        status: "error",
        message: "Erros ao editar usuário"
        })
    }
})

app.delete('/usuarios/:id', async (req, res) => {
try {
    await prisma.usuarios.delete({
        where: {
            id: Number(req.params.id)
        }

        })

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
        
        const userId = req.query.usuario ? Number(req.query.usuario) : undefined
        const comissao = await prisma.comissoes.findMany({
            where: {
                usuario_id: req.query.user ? Number(req.query.user) : undefined,
                data: {
                    gte: req.query.data_inicio ? new Date (req.query.data_inicio) : undefined,
                    lte: req.query.data_fim ? new Date (req.query.data_fim) : undefined
                }
            }
        })

        if(userId) {
            await gerarPagamento(userId)
        }


        const total_comissoes = comissao.reduce((acc, c) => acc + Number(c.valor), 0)

        res.status(200).json({
            status: "success",
            message: "Comissões listadas com sucesso",
            data: {
                total_comissoes,
                ultimas_comissoes: comissao
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

// ROTAS DE CADASTROS //

app.get('/cadastros-a-aprovar', async (req, res) => {
    try {
        const cadastro = await prisma.usuarios.findMany({
            where: {
                status: "pendente"
            },
            select: {
                id: true,
                nome: true,
                email:true,
                status: true
            }
        })
        res.status(200).json({
            status: "success",
            message: "Cadastros pendentes listados com sucesso",
            data: cadastro
        })
    } catch (error) {
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
        const usuario = await prisma.usuarios.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status: novoStatus
            }
        })
    
    res.status(200).json({
        status: "success",
        data: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            status: status,
            data_cadastro: usuario.data_cadastro
        }
    })
    
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Erro ao atualizar cadastro"
        })
    }
})

// ROTAS DE PAGAMENTOS //

app.get('/pagamentos-a-aprovar', async (req, res) => {
    try {
        const pagamentos = await prisma.pagamentos.findMany({
            where: {
                status:"pendente"
            }, 
            select: {
                id: true,
                usuario_id: true,
                valor: true,
                status: true,
                data_pagamento: true
            } 
        })
            
        res.status(200).json ({
            status:"success",
            data: pagamentos
        })          
        
        } catch (error) {
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
            const pagamento = await prisma.pagamentos.update({
                where: {
                    id: Number(req.params.id)
                },
                data: {
                    status: novoStatus
                }
            })

            res.status(200).json({
                status: "success",
                data: {
                    id: pagamento.id,
                    valor: Number(pagamento.valor),
                    status: status,
                    data_pagamento: pagamento.data_pagamento
                }
            })

        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Erro ao atualizar pagamento"
            })
        }
     })

    
        
    




// SERVIDOR //

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})