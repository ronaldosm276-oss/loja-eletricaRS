import { produtos } from "./produtos.js";

// Pegando elemento do DOM
const section_cards = document.querySelector('#cards');

// Função para carregar os produtos
const listaProdutos = () => {
    // 1. Limpa a seção UMA VEZ antes de começar o loop
    section_cards.innerHTML = '';

    produtos.forEach((elem, i) => {
        // Criando a div container do card
        const divCard = document.createElement('div');
        divCard.setAttribute('class', 'card');

        // Criando a imagem do produto
        const imgProduto = document.createElement('img');
        imgProduto.setAttribute('src', elem.caminho_da_imagem);
        imgProduto.setAttribute('alt', elem.descricao_produto);
        imgProduto.setAttribute('class', 'img_card'); // Corrigido de img.card para img_card igual ao CSS esperado

        // Criando o título
        const h2Titulo = document.createElement('h2');
        h2Titulo.setAttribute('class', 'tito_card'); // Adicionado a classe para bater com seu HTML comentado
        h2Titulo.innerHTML = elem.descricao_produto;

        // Criando o valor
        const divValor = document.createElement('h3');
        divValor.setAttribute('class', 'valor_card');
        divValor.innerHTML = `R$ ${parseFloat(elem.valor_unitario).toFixed(2).replace('.', ',')}`;
        
        // Criando o botão
        const btnCard = document.createElement('button');
        btnCard.setAttribute('class', 'btn_card');
        btnCard.innerHTML = 'Adicionar';

        // 2. MONTAGEM: Colocando os elementos dentro do Card
        divCard.appendChild(imgProduto);
        divCard.appendChild(h2Titulo);
        divCard.appendChild(divValor);
        divCard.appendChild(btnCard);

        // Colocando o card pronto dentro da section no HTML
        section_cards.appendChild(divCard);
    });
}

// 3. Executa a função para os cards aparecerem na tela
listaProdutos();