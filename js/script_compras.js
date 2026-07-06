// Passo 1: Esperar o HTML carregar completamente antes de executar o script
document.addEventListener("DOMContentLoaded", function () {
    
    // Capturar a seção que contém todos os cards de produtos
    const secaoCards = document.getElementById("cards");

    // Passo 1 (continuação): Escutar qualquer clique dentro da seção de cards
    secaoCards.addEventListener("click", function (evento) {
        
        // Verificar se o elemento que o usuário clicou é o botão de adicionar
        if (evento.target.classList.contains("btn_card")) {
            
            // Passo 2: Encontrar o "pai" mais próximo que tenha a classe .card
            const cardElemento = evento.target.closest(".card");

            // Passo 3: Recolher as informações de dentro DESTE card específico
            const nomeProduto = cardElemento.querySelector(".tito_card").textContent;
            const precoTexto = cardElemento.querySelector(".valor_card").textContent;
            const imagemCaminhoOriginal = cardElemento.querySelector("img").getAttribute("src");

            // Passo 4: Limpar e ajustar os dados
            // Transforma o texto "R$ 120,00" no número 120.00
            const precoNumero = parseFloat(precoTexto.replace("R$", "").replace(",", ".").trim());
            
            // Ajusta o caminho da imagem adicionando "../" para o carrinho.html encontrar na pasta raiz
            const imagemParaCarrinho = "../" + imagemCaminhoOriginal;

            // Passo 5: Criar o objeto estruturado do produto
            const produtoSelecionado = {
                nome: nomeProduto,
                preco: precoNumero,
                imagem: imagemParaCarrinho,
                quantidade: 1
            };

            // Passo 6: Guardar no LocalStorage (A nossa mala de viagem)
            // Primeiro, pegamos o que já existe no carrinho (se não existir nada, criamos uma lista vazia '[]')
            let carrinho = JSON.parse(localStorage.getItem("carrinho-fake")) || [];

            // Verificar se o produto já está na lista (comparamos pelo nome)
            const produtoExiste = carrinho.find(item => item.nome === produtoSelecionado.nome);

            if (produtoExiste) {
                // Se o produto já existe, apenas aumentamos a quantidade dele
                produtoExiste.quantidade += 1;
            } else {
                // Se é um produto novo, adicionamos ele ao final da lista
                carrinho.push(produtoSelecionado);
            }

            // Salva a lista atualizada de volta na memória do navegador
            localStorage.setItem("carrinho-fake", JSON.stringify(carrinho));

            // Feedback visual simples para o usuário saber que funcionou
            //alert(`${nomeProduto} foi adicionado ao seu carrinho!`);
        }
    });
});