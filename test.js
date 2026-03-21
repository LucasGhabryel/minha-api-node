app.get('/teste', async (req, res) => {
  console.log("entrou na rota")

  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "erro" })
  }
})