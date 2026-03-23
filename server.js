import express from "express"
import bodyParser from "body-parser" 
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.get('/favicon.ico', (req, res) => res.status(204))

app.get('/', (req, res) => {
    res.status(200).json({message: "API funcionando!"})
})

app.post('/usuarios', async (req, res) => {
try {
  const user = await prisma.user.create({
    data: {
        email: req.body.email,
        name: req.body.name,
        age: Number(req.body.age)
    }
  }) 
  res.status(201).json(user)
} catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário"})
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
    res.status(200).json(users)
 } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários"})
 }
})


app.put('/usuarios/:id', async (req, res) => {
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
   res.status(200).json(user)
} catch (erro) {
    res.status(500).json({error: "Erro ao editar usuário"})
    }
})

app.delete('/usuarios/:id', async (req, res) => {
try {
    await prisma.user.delete({
        where: {
            id: req.params.id
        }

        })

        res.status(200).json( {message: "Usuário deletado com Sucesso"})
    } catch (error){
        res.status(500).json({ error: "Erro ao deletar usuário" })
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