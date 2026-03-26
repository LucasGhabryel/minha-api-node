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

//

// ROTAS DE AUTENTICAÇÃO //

app.post('/login', async (req, res) =>{

    if (!req.body.email || !req.body.senha) {
        return res.status(400).json({
            status: "error",
            message: "Email e senha são obrigatórios"
        })
    }
    try {
        const user = await prisma.user.findUnique({
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
                tipo: user.tipo
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
if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.tipo) {
    return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios não preenchidos"
    })
}
    try {
  const user = await prisma.user.create({
    data: {
        name: req.body.name,
        email: req.body.email,
        senha: req.body.senha,
        tipo: req.body.tipo
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
   let users = []
    if(req.query){
        users = await prisma.user.findMany({
            where: {
                name: req.query.name,
                email: req.query.email,
                tipo: req.query.tipo
            },
            select: {
                id:true,
                nome: true,
                email: true,
                tipo: true,
                status: true,
                data_cadastro: true,
                senha: false
            }
        })
    } else {
    users = await prisma.user.findMany()
    }
    res.status(200).json({
        status: "success",
        message: "Usuários listados com sucesso",
        data: users
})
 } catch (error) {
    res.status(500).json({
        status: "error",
        message: "Error ao listar usuários"
    })
 }
})


app.patch('/usuarios/:id', async (req, res) => {
if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.tipo) {
    return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios não preenchidos"
    })
}
     try{
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
        name: req.body.name,
        email: req.body.email,
        senha: req.body.senha,
        tipo: req.body.tipo
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
    await prisma.user.delete({
        where: {
            id: req.params.id
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
    //

// ROTAS DE COMISSÕES //
app.get('/comissoes-subafiliado/:id', async (req, res) => {
    try{
        const subafiliadoId = parseInt(req.params.id);

        const totalComissoes = await prisma.comissoes_subafiliados.aggregate({
            _sum: {
                valor: true
            },
            where: {
                subafiliado_id: subafiliadoId
            }
        });

        const comissoesSubafiliados = await prisma.comissoes_subafiliados.findMany({
            where: {
                subafiliado_id: subafiliadoId
            },
            select: {
                id: true,
                valor: true,
                data: true
            }
        })
        res.status(200).json({
            status: "success",
            message: "comissões dos Sub-Afiliados listados com sucesso",
            data:  {
                Comissoes: totalComissoes._sum.valor || 0,
                data: comissoesSubafiliados
            }
        })
    } catch(error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            message: "Error ao listar comissões dos Sub-Afiliados"
        })
    }
})
// ROTAS DE CADASTROS //

// ROTAS DE PAGAMENTOS //

// ROTAS DE SUBAFILIADO //

// ROTAS DE Links //

app.get('/links-afiliado/:id', async (req, res) => {

    try{
        const linksAfiliadoId = parseInt(req.params.id);

        const linksAfiliado = await prisma.links_afiliado.findMany({
            where: {
                afiliado_id: linksAfiliadoId
            },
            select: {
                id: true,
                link: true
            }
        })
        res.status(200).json({
            status: "success",
            message: "Links do Afiliado listados com sucesso",
            data: linksAfiliado
        })
    } catch(error) {
        console.log(error)
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

//
 

