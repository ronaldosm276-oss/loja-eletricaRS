//IMPORTANDO O ARRAY DOS PRODUTOS
import { produtos } from "./produtos.js";

//PEGANDO ELEMENTO DO DOM
const section_cards = document.querySelector('#cards')
const pesquisa = document.querySelector('#pesquisa input')

//FUNÇÃO PARA CARREGAR OS PRODUTOS
const listarProdutos = () => {
    section_cards.innerHTML = ''
    // Chama a função de montar cards passando todos os produtos
    montandoCards(produtos)
}

//FILTRANDO AS SEÇÕES COM A COLEÇÃO map
const listarSecoes = () => {
    //CRIANDO A COLEÇÃO MAP
    const secoesFiltrada = new Map()

    //PECORRENDO O ARRAY PRODUTOS E FILTRANDO AS SEÇÕES
    produtos.forEach((elem, i) => {
        //CRIANDO A CHAVE E O VALOR DA COLEÇÃO MAP A PARTIR DO ID DA SEÇÃO DA LISTA DE PRODUTOS
        secoesFiltrada.set(elem.id_secao, elem)
    })

    //CONVERTENDO O MAP EM ARRAY
    const secoesMenu = Array.from(secoesFiltrada.values())

    //RETORNADO O ARRAY CONVERTIDO
    return secoesMenu
}

//MONTANDO OS LINKS SEÇÕES
const montarSecoes = () => {
    //PEGANDO O ELEMENTO DO DOM
    const ulMenu = document.querySelector('#menu-secoes')
    //LIMPANDO O ELEMENTO ulMenu
    ulMenu.innerHTML = ''

    // 1. CRIANDO O BOTÃO "TODOS" MANUALMENTE, fora da arrow function, um botão todos permanente
    const liTodos = document.createElement('li')
    const aTodos = document.createElement('a')
    aTodos.setAttribute('href', '#')
    aTodos.setAttribute('class', 'lnk-secao')
    aTodos.innerHTML = "Todos"

    // Capturando o clique para listar todos os produtos
    aTodos.addEventListener('click', (event) => {
        event.preventDefault() // Evita que a tela pule para o topo
        montandoCards(produtos)
    })
    liTodos.appendChild(aTodos)
    ulMenu.appendChild(liTodos)

    //PERCORRENDO O ARRAY DAS SEÇÕES FILTRADA, para criar as categorias
    listarSecoes().forEach((elem, i) => {
        //CRIANDO O ELEMENTO li
        const liSecao = document.createElement('li')

        //CRIANDO O ELEMENTO a
        const aSecao = document.createElement('a')
        aSecao.setAttribute('href', '#')
        aSecao.setAttribute('class', 'lnk-secao')
        aSecao.innerHTML = elem.nome_secao

        //CAPTURANDO O CLICK DOS LINKS
        aSecao.addEventListener('click', (event) => {
            event.preventDefault() // Evita que a tela pule para o topo
            //CHAMANDO A FUNÇÃO PRODUTOS FILTRADOS
            montandoCards(produtosFiltrados(elem.id_secao))
        })

        //ADICIONANDO O ELEMENTO FILHO a NO ELEMENTO li
        liSecao.appendChild(aSecao)

        //ADICIONANDO O ELEMENTO FILHO li NO ELEMENTO DO DOM ul
        ulMenu.appendChild(liSecao)
    })
}
const ativarPesquisa = () => {
    pesquisa.addEventListener('input', (event) => {
        // Pega o valor que está digitado na caixa de texto
        const termoBusca = event.target.value
        
        // Filtra os produtos com a função que você criou
        const listaFiltrada = resultadoPesquisa(termoBusca)
        
        // Manda os produtos encontrados para desenhar na tela
        montandoCards(listaFiltrada)
    })
}
//FILTRANDO PRODUTOS 
const produtosFiltrados = (idSecao) => {
    return produtos.filter(elem => elem.id_secao === idSecao)
}
//FILTRANDO PELA PESQUISA
const resultadoPesquisa = (textoDigitado) => {
    return produtos.filter(elem => 
        //Isso aqui faz com que minusculos, maiusculos, frases incompletas, sejam reconhecidas e deem resultado
        elem.descricao_produto.toLowerCase().includes(textoDigitado.toLowerCase())
    )
}


//MONTANDO CARDS
const montandoCards = (objProdutos) => {
    section_cards.innerHTML = ''

    objProdutos.forEach((elem, i) => {
        const divCard = document.createElement('div')
        divCard.setAttribute('class', 'card')

        const imgProduto = document.createElement('img')
        imgProduto.setAttribute('src', elem.caminho_da_imagem)
        imgProduto.setAttribute('alt', elem.descricao_produto)
        imgProduto.setAttribute('class', 'img_card')

        const h2Titulo = document.createElement('h2')
        h2Titulo.setAttribute('class', 'tito_card')
        h2Titulo.innerHTML = elem.descricao_produto

        const h3Valor = document.createElement('h3')
        h3Valor.setAttribute('class', 'valor_card')
        h3Valor.innerHTML = `R$ ${parseFloat(elem.valor_unitario).toFixed(2).replace('.', ',')}`

        const btnCard = document.createElement('button')
        btnCard.setAttribute('class', 'btn_card')
        btnCard.innerHTML = 'Adicionar'

        divCard.appendChild(imgProduto)
        divCard.appendChild(h2Titulo)
        divCard.appendChild(h3Valor)
        divCard.appendChild(btnCard)

        section_cards.appendChild(divCard)
    })
}

// ==========================================
// CHAMADAS DE INICIALIZAÇÃO (NO FINAL DO ARQUIVO)
// ==========================================
listarProdutos()
montarSecoes()
ativarPesquisa()