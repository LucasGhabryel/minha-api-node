    import express from "express"
    import bodyParser from "body-parser" 
    import pool from './db.js'
    import jwt from "jsonwebtoken"
    import 'dotenv/config'
    import cors from 'cors'


    const app = express()
    app.use(cors())
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

    // MIDDLEWARE DE AUTENTICAÇÃO //

    const autenticar = (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token) {
            return res.status(401).json({
                error: "error",
                message: "Token não fornecido"
            })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.usuario = decoded
            next()
        } catch (error) {
            return res.status(403).json({
                status: "error",
                message: "Token inválido ou expirado"
            })
        }
    }

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

            const usuario = rows[0]

            if (!usuario || usuario.senha !== req.body.senha) {
                return res.status(401).json({
                    status: "error",
                    message: "Email ou senha inválidos"
                })
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            )

            res.status(200).json({
                status: "success",
                message: "Login bem-sucedido",
                data: {
                    token,
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo_usuario
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

    app.post('/usuarios', autenticar, async (req, res) => {
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

    app.get('/usuarios', autenticar,  async (req, res) => {
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

    app.patch('/usuarios/:id', autenticar,  async (req, res) => {
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

    app.delete('/usuarios/:id', autenticar, async (req, res) => {
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

    app.get('/comissoes', autenticar, async (req, res) =>{
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

    app.get('/comissoes-subafiliado/:id', autenticar, async (req, res) => {
        const subafiliadoId = parseInt(req.params.id);  

        try{      

            const [result] = await pool.execute(
                'SELECT SUM(valor) as total FROM comissoes_subafiliados WHERE subafiliado_id = ?', [subafiliadoId]
            );
            const totalComissoes = result[0]?.total || 0;

            const [comissoesSubafiliados] = await pool.execute(
                'SELECT id, valor, data FROM comissoes_subafiliados WHERE subafiliado_id = ?', [subafiliadoId]
            );

            res.status(200).json({
                status: "success",
                message: "comissões dos Sub-Afiliados listados com sucesso",
                data:  {
                    Comissoes: totalComissoes,
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

    app.get('/cadastros-a-aprovar', autenticar, async (req, res) => {
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

    app.patch('/cadastros-a-aprovar/:id', autenticar, async (req, res) => {
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

    app.get('/pagamentos-a-aprovar', autenticar, async (req, res) => {
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
        
        app.patch('/pagamentos/:id', autenticar, async (req, res) => {
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
                        status:rows[0].status,
                        data_pagamento: rows[0].data_pagamento
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

    app.get('/subafiliados', autenticar, async (req, res) => {
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

    app.post('/subafiliados', autenticar, async (req, res) => {

        const {afiliado_id, nome, email, percentual} = req.body

        if (!afiliado_id || !nome || !email || percentual == null) {
            return res.status(400).json({
                status: "error",
                message: "Campos obrigatórios não preenchidos"
            })
        }

        if (percentual < 0 || percentual > 100){
            return res.status(400).json({
                status: "error",
                message: "Percentual deve estar entre 0 e 100"
            });
        }

        try{
            const [resultado] = await pool.execute(
                'INSERT INTO subafiliados (afiliado_id, nome, email, percentual) VALUES (?, ?, ?, ?)',
                [afiliado_id, nome, email, percentual]
            );
            res.status(201).json({
                status: "success",
                message: "Sub-Afiliado criado com sucesso",
                data: {id: resultado.insertId, afiliado_id, nome, email, percentual}
            }) 
        } catch(error){
            console.log
            res.status(500).json({
                    status: "error",
                    message: "Erro ao criar Sub-Afiliado"
                })
            }
        })

    app.patch('/subafiliados/:id', autenticar, async (req, res) => {
        
        const {nome, email, status, percentual} = req.body;

        if (nome === undefined && email === undefined && status === undefined && percentual === undefined) {
            return res.status(400).json({
            status: "error",
            message: "Nenhum campo válido para atualização foi fornecido. Os campos permitidos são: nome, email, status, percentual."
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
        if (percentual !== undefined) {
            updates.push('percentual = ?');
            valores.push(percentual);
        }

        valores.push(parseInt(req.params.id));

        try{
            await pool.execute(
                `UPDATE subafiliados SET ${updates.join(', ')} WHERE id = ?`, valores
            ); 

        
        const [subAfiliadoAtualizado] = await pool.execute(
            'SELECT id, nome, email, status, percentual, data_cadastro FROM subafiliados WHERE id = ?',
            [parseInt(req.params.id)]
        );

            res.status(200).json({
                status: "success",
                message: "Sub-Afiliado editado com sucesso",
                data: subAfiliadoAtualizado[0]
            });
            
        } catch(erro) {
            const {nome, email, status, percentual} = req.body;
            console.error('body recebido', req.body)
            res.status(500).json({
                status: "error",
                message: "Erros ao editar Sub-Afiliados"
            })
        }
    })

    // ROTAS DE Links //
    app.get('/links-afiliado/:id', autenticar, async (req, res) => {

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