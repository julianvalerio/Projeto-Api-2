package.json — A "Ficha Técnica" do Projeto

{
    "name": "api-aula",
    "version": "1.0.0",
    "description": "Api com CRUD básico",
    "main": "server.js",
    "type": "module",
    "scripts": { "start": "node server.js" },
    "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5"
    }
}
Pense nesse arquivo como a identidade e o manual de instruções do projeto.

Campo	O que significa
"name"	O nome do projeto
"version"	A versão atual
"main"	Qual é o arquivo principal que inicia tudo
"type": "module"	Diz ao Node.js para usar a sintaxe moderna de import/export (em vez do antigo require)
"scripts"	Atalhos de terminal. "start" significa: quando alguém digitar npm start, execute node server.js
"dependencies"	As bibliotecas externas que o projeto precisa para funcionar
As dependências:

express — um framework que facilita muito a criação de servidores web em Node.js. Sem ele, você teria que escrever centenas de linhas a mais.
cors — resolve um problema de segurança do navegador. Por padrão, o browser bloqueia pedidos feitos de um endereço para outro (ex: do frontend para o backend). O CORS libera essa comunicação.
Quando você roda npm install, o Node.js lê esse arquivo e baixa automaticamente essas bibliotecas para a pasta node_modules.

server.js — O Servidor / A API
Este é o coração do projeto. Ele roda no seu computador como um servidor que aguarda pedidos e responde com dados.

Parte 1 — Importações e Configuração

import express from "express"
import cors from "cors"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
Aqui o código importa ferramentas para usar:

express e cors são as bibliotecas do package.json
fileURLToPath, dirname, join são ferramentas nativas do Node.js para trabalhar com caminhos de pastas/arquivos

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(join(__dirname, "../frontend")))
const app = express() — cria o servidor. app é o objeto central que controla tudo.
app.use(cors()) — ativa a permissão para o frontend se comunicar com o backend.
app.use(express.json()) — ensina o servidor a "ler" o corpo das requisições no formato JSON (os dados enviados pelo frontend).
app.use(express.static(...)) — serve os arquivos do frontend automaticamente. Ou seja, quando você acessa http://localhost:3000, ele já exibe o HTML.
__dirname — como esse projeto usa "type": "module", a variável __dirname (que mostra a pasta atual) não existe automaticamente. Essas três linhas recriam ela de uma forma compatível.
Parte 2 — O "Banco de Dados" (em memória)

let usuarios = [
    { id: 1, nome: "João", email: "joao@email.com" },
    { id: 2, nome: "Maria", email: "maria@email.com" }
]
Este projeto não usa banco de dados real. Os dados ficam em um array na memória do servidor. Toda vez que o servidor reiniciar, os dados voltam para esses dois usuários iniciais.

Em um projeto real, aqui estaria uma conexão com banco de dados (MySQL, PostgreSQL, MongoDB, etc.)

Parte 3 — As Rotas (os "endpoints" da API)
Cada rota define: "quando alguém bater nesse endereço com esse método HTTP, faça isso."

GET — Listar todos os usuários


app.get("/usuarios", (req, res) => {
    res.json(usuarios)
})
Quando o frontend acessa GET /usuarios, o servidor responde enviando o array inteiro em formato JSON.

POST — Criar um novo usuário


app.post("/usuarios", (req, res) => {
    const novo = {
        id: Date.now(),       // usa o timestamp atual como ID único
        nome: req.body.nome,  // pega o nome enviado pelo frontend
        email: req.body.email
    }
    usuarios.push(novo)       // adiciona ao array
    res.status(201).json(novo) // responde com o novo usuário criado
})
req.body contém os dados enviados pelo frontend. Date.now() retorna o número de milissegundos desde 1970, garantindo um ID único. O status 201 significa "Criado com sucesso".

PUT — Atualizar um usuário existente


app.put("/usuarios/:id", (req, res) => {
    const id = Number(req.params.id)
    const index = usuarios.findIndex(u => u.id === id)
    if (index === -1) {
        return res.status(404).json({ erro: "Usuário não encontrado" })
    }
    usuarios[index] = { ...usuarios[index], nome: req.body.nome, email: req.body.email }
    res.json(usuarios[index])
})
:id na rota é um parâmetro dinâmico — pode ser qualquer número. Ex: /usuarios/123
req.params.id captura esse valor da URL
Number(...) converte de texto para número (necessário porque parâmetros de URL são sempre strings)
findIndex procura no array pelo usuário com aquele ID. Se não achar, retorna -1
O ...usuarios[index] é o spread operator — copia todos os dados antigos do usuário e sobrescreve só o nome e email com os novos valores
Status 404 = "Não encontrado"
DELETE — Remover um usuário


app.delete("/usuarios/:id", (req, res) => {
    const id = Number(req.params.id)
    usuarios = usuarios.filter(u => u.id !== id)
    res.json({ mensagem: "Usuário removido" })
})
filter cria um novo array com todos os usuários exceto o que tem aquele ID. É como dizer: "fique com todos, menos esse".

Iniciar o servidor


app.listen(3000, () => {
    console.log("Api rodando em http://localhost:3000")
})
O servidor começa a escutar pedidos na porta 3000. O callback (função após a vírgula) roda uma única vez quando o servidor sobe, apenas para mostrar a mensagem no terminal.

script.js — O Frontend (o que roda no Navegador)
Este arquivo controla o que o usuário vê e faz na tela. Ele se comunica com o servidor usando fetch.

A URL base

const API = "http://localhost:3000"
Guarda o endereço do servidor em uma variável. Assim, se o endereço mudar, você só altera em um lugar.

carregar() — Busca e exibe os usuários

async function carregar() {
    const res = await fetch(`${API}/usuarios`)
    const dados = await res.json()

    const lista = document.getElementById("lista")
    lista.innerHTML = ""

    dados.forEach(u => {
        const li = document.createElement("li")
        li.innerHTML = `
            ${u.nome} - ${u.email}
            <button onclick="editar(${u.id}, '${u.nome}', '${u.email}')">Editar</button>
            <button onclick="remover(${u.id})">Excluir</button>
        `
        lista.appendChild(li)
    })
}

carregar() // chama a função imediatamente ao carregar a página
async/await — permite esperar respostas do servidor sem travar o navegador. await pausa a função até receber a resposta.
fetch(...) — faz um pedido HTTP ao servidor (por padrão é GET)
res.json() — converte a resposta (que chega como texto) para um objeto JavaScript
lista.innerHTML = "" — limpa a lista antes de redesenhar, para não duplicar itens
forEach — percorre cada usuário do array e cria um <li> com seu nome, email e dois botões
lista.appendChild(li) — adiciona o <li> criado dentro da <ul> no HTML
O formulário — Criar ou Atualizar

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault() // impede o formulário de recarregar a página

    const id = document.getElementById("editId").value
    const nome = document.getElementById("nome").value
    const email = document.getElementById("email").value

    if (id) {
        // se tem ID, é uma EDIÇÃO
        await fetch(`${API}/usuarios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email })
        })
    } else {
        // se não tem ID, é uma CRIAÇÃO
        await fetch(`${API}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email })
        })
    }

    limparForm()
    carregar()
})
e.preventDefault() — sem isso, ao submeter o formulário a página recarregaria. Isso cancela o comportamento padrão.
O campo editId é invisível no formulário. Ele guarda o ID do usuário sendo editado. Se estiver vazio, é uma criação; se tiver um valor, é uma edição.
headers: { "Content-Type": "application/json" } — avisa o servidor que os dados estão no formato JSON
body: JSON.stringify(...) — converte o objeto JavaScript para texto JSON antes de enviar
{ nome, email } é um atalho moderno para { nome: nome, email: email }
editar() — Preenche o formulário para edição

function editar(id, nome, email) {
    document.getElementById("editId").value = id
    document.getElementById("nome").value = nome
    document.getElementById("email").value = email
    document.getElementById("btnSalvar").textContent = "Atualizar"
    document.getElementById("btnCancelar").style.display = "inline"
}
Quando o usuário clica em "Editar", esta função preenche o formulário com os dados daquele usuário e muda o texto do botão para "Atualizar". O campo oculto editId recebe o ID, sinalizando ao formulário que é uma edição.

limparForm() — Reseta o formulário

function limparForm() {
    document.getElementById("editId").value = ""
    document.getElementById("nome").value = ""
    document.getElementById("email").value = ""
    document.getElementById("btnSalvar").textContent = "Salvar"
    document.getElementById("btnCancelar").style.display = "none"
}
Apaga todos os campos, volta o botão para "Salvar" e esconde o botão "Cancelar". É chamada após salvar e ao clicar em cancelar.

remover() — Exclui um usuário

async function remover(id) {
    await fetch(`${API}/usuarios/${id}`, {
        method: "DELETE"
    })
    carregar()
}
Faz um pedido DELETE ao servidor passando o ID na URL. Depois chama carregar() para atualizar a lista na tela.

Resumo do Fluxo Completo

Usuário interage com a página
         ↓
    script.js faz fetch()
         ↓
    server.js recebe o pedido
         ↓
    server.js lê/modifica o array
         ↓
    server.js responde com JSON
         ↓
    script.js atualiza a tela
Este projeto implementa um CRUD completo (Create, Read, Update, Delete) — as quatro operações fundamentais de qualquer sistema que gerencia dados.
