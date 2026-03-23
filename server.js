import express from "express"
import bodyParser from "body-parser" 
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.get('/favicon.ico', (req, res) => res.status(204))

app.get('/', (req, res) => {
    res.status(200).json({
       status: "success",
       message: "API funcionando"
    })
})

app.post('/usuarios', async (req, res) => {
if (!req.body.email || !req.body.name || !req.body.age) {
    return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios não preenchidos"
    })
}

    try {
  const user = await prisma.user.create({
    data: {
        email: req.body.email,
        name: req.body.name,
        age: Number(req.body.age)
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
   let users = []
    if(req.query){
        users = await prisma.user.findMany({
            where: {
                name: req.query.name,
                email: req.query.email,
                age: req.query.age ? Number(req.query.age) : undefined
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


app.put('/usuarios/:id', async (req, res) => {
if (!req.body.email || !req.body.name || !req.body.age) {
    return res.status(400).json({
        status: "error",
        message: "Campos obrigatórios não preenchidos"
    })
}
     try{
  const user = await prisma.user.update({
    where: {
        id: req.params.id
    },
    data: {
        email: req.body.email,
        name: req.body.name,
        age: Number(req.body.age)
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


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando")
})


 


/* 
    Criar nossa API de Usuários

    -Criar um usuário
    -Listar todos os usuários
    -Editar um usuário
    -Deletar um usuário

    
*/