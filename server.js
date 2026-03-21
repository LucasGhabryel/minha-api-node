import express from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const app = express()
app.use(express.json())

app.post('/usuarios', async (req, res) => {

  const user = await prisma.user.create({
    data: {
        email: req.body.email,
        name: req.body.name,
        age: Number(req.body.age)
    }
  }) 
  
  res.status(201).json(user)

})

app.get('/usuarios', async (req, res) => {

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

})


app.put('/usuarios/:id', async (req, res) => {

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
})

app.delete('/usuarios/:id', async (req, res) => {

    await prisma.user.delete({
        where: {
            id: req.params.id
        }

        })

        res.status(200).json( {message: "Usuário deletado com Sucesso"})

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

    Usuario:Lucas
    Senha:AwVtmLj7uIQDTGuW
*/