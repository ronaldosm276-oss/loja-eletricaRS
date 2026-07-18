// ============================================
// CADASTRO
// ============================================
const formCadastro = document.querySelector('#form-pessoa')

if (formCadastro) {

    const inputCEP = document.querySelector('#CEP')
    const divEndereco = document.querySelector('#div-dados-endereco')

    // Busca o endereço no ViaCEP quando o usuário sai do campo CEP (evento "blur")
    inputCEP.addEventListener('blur', async () => {
        const cep = inputCEP.value.replace(/\D/g, '') // remove tudo que não for número

        if (cep.length !== 8) return // CEP incompleto, nem tenta buscar

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const dados = await resposta.json()

            if (dados.erro) {
                alert('CEP não encontrado.')
                return
            }

            // Preenchendo os campos automaticamente com o que veio da API
            document.querySelector('#logradouro').value = dados.logradouro
            document.querySelector('#bairro').value = dados.bairro
            document.querySelector('#localidade').value = dados.localidade
            document.querySelector('#uf').value = dados.uf

            // Revela a div de endereço (que começa escondida com a classe "oculto")
            divEndereco.classList.remove('oculto')

        } catch (erro) {
            alert('Não foi possível buscar o CEP. Tente novamente.')
        }
    })

    formCadastro.addEventListener('submit', (evt) => {
        evt.preventDefault()

        const nome = document.querySelector('#nome').value
        const cpf = document.querySelector('#cpf').value
        const dataNascimento = document.querySelector('#data-nascimento').value
        const sexoSelecionado = document.querySelector('input[name="sexo"]:checked')
        const senha = document.querySelector('#senha').value

        const novoUsuario = {
            nome: nome,
            cpf: cpf,
            dataNascimento: dataNascimento,
            sexo: sexoSelecionado ? sexoSelecionado.value : '',
            cep: inputCEP.value,
            logradouro: document.querySelector('#logradouro').value,
            numero: document.querySelector('#Número').value,
            complemento: document.querySelector('#complemento-end').value,
            bairro: document.querySelector('#bairro').value,
            localidade: document.querySelector('#localidade').value,
            uf: document.querySelector('#uf').value,
            senha: senha // texto puro, conforme combinado
        }

        // Pega os usuários já cadastrados (ou array vazio, se for o primeiro cadastro)
        let usuarios = JSON.parse(localStorage.getItem('usuarios-fake')) || []

        // Impede cadastro duplicado com o mesmo CPF
        const cpfJaExiste = usuarios.find(usuario => usuario.cpf === cpf)

        if (cpfJaExiste) {
            alert('Já existe um cadastro com esse CPF.')
            return
        }

        usuarios.push(novoUsuario)
        localStorage.setItem('usuarios-fake', JSON.stringify(usuarios))

        alert('Cadastro realizado com sucesso!')
        window.location.href = 'login.html'
    })
}

// ============================================
// LOGIN
// ============================================
const formLogin = document.querySelector('#login')

if (formLogin) {
    formLogin.addEventListener('submit', (evt) => {
        evt.preventDefault()

        const cpfDigitado = document.querySelector('#cpf').value
        const senhaDigitada = document.querySelector('#senha').value

        const usuarios = JSON.parse(localStorage.getItem('usuarios-fake')) || []

        const usuarioEncontrado = usuarios.find(usuario =>
            usuario.cpf === cpfDigitado && usuario.senha === senhaDigitada
        )

        if (usuarioEncontrado) {
            localStorage.setItem('logado', 'true')
            localStorage.setItem('usuario-logado', usuarioEncontrado.nome)
            localStorage.setItem('cep-usuario-logado', usuarioEncontrado.cep)
            alert(`Bem-vindo(a), ${usuarioEncontrado.nome}!`)
            window.location.href = 'carrinho.html'
        } else {
            alert('CPF ou senha incorretos.')
        }
    })
}