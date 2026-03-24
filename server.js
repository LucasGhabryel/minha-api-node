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

// ROTAS DE CADASTROS //

// ROTAS DE PAGAMENTOS //

// ROTAS DE SUBAFILIADO //
app.get('/subafiliados', async (req, res) => {
    try {
        let sub_affiliates = []
        const isValidStatus = req.query.status && Object.values(Status).includes(req.query.status)

        if(req.query){
            sub_affiliates = await prisma.user.findMany({
                where: {
                    name: req.query.name,
                    email: req.query.email,
                    status: isValidStatus ? req.query.status : undefined
                }
            })
        } else {
        sub_affiliates = await prisma.subAffiliates.findMany()
        }

        res.status(200).json({
        status: "success",
        message: "Sub-Afiliados listados com sucesso",
        data: sub_affiliates
        })
    } catch {
        res.status(500).json({
            status: "error",
            message: "Erro ao puxar os sub-afiliados"
        })
    }
})
// ROTAS DE COMISSÕES //



// SERVIDOR //

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})

//
 

