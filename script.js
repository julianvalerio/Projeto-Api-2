const API = "http://localhost:3000"

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

carregar()


document.getElementById("form").addEventListener("submit", async (e) => {

    e.preventDefault()

    const id = document.getElementById("editId").value
    const nome = document.getElementById("nome").value
    const email = document.getElementById("email").value

    if (id) {
        await fetch(`${API}/usuarios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email })
        })
    } else {
        await fetch(`${API}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email })
        })
    }

    limparForm()
    carregar()

})



function editar(id, nome, email) {

    document.getElementById("editId").value = id
    document.getElementById("nome").value = nome
    document.getElementById("email").value = email
    document.getElementById("btnSalvar").textContent = "Atualizar"
    document.getElementById("btnCancelar").style.display = "inline"

}

document.getElementById("btnCancelar").addEventListener("click", limparForm)

function limparForm() {

    document.getElementById("editId").value = ""
    document.getElementById("nome").value = ""
    document.getElementById("email").value = ""
    document.getElementById("btnSalvar").textContent = "Salvar"
    document.getElementById("btnCancelar").style.display = "none"

}

async function remover(id) {
    await fetch(`${API}/usuarios/${id}`, {
        method: "DELETE"
    })
    carregar()

}
