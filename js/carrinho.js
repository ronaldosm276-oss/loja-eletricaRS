document.addEventListener("DOMContentLoaded", function () {
    // 1. Mapear os elementos do HTML que vamos manipular
    const tabelaItens = document.getElementById("itens-carrinho");
    const containerVazio = document.getElementById("carrinho-vazio");
    const tabelaCompleta = document.querySelector(".tabela-carrinho");

    const txtSubtotal = document.getElementById("valor-subtotal");
    const txtFrete = document.getElementById("valor-frete");
    const txtTotal = document.getElementById("valor-total");

    const btnCalcularFrete = document.getElementById("btn-calcular-frete");
    const btnFinalizarCompra = document.getElementById("btn-finalizar-compra");
    const inputCep = document.getElementById("input-cep");

    // Variável global para controlar o valor do frete fictício
    let valorFreteAtual = 0;
    let freteCalculado = false;

    // 2. Função principal para renderizar os produtos na tela
    function renderizarCarrinho() {
        // Buscar a lista guardada no LocalStorage (se não existir, cria uma lista vazia)
        let carrinho = JSON.parse(localStorage.getItem("carrinho-fake")) || [];

        // Se o carrinho estiver vazio
        if (carrinho.length === 0) {
            tabelaCompleta.style.display = "none"; // Esconde a tabela
            containerVazio.style.display = "block"; // Mostra a mensagem "Carrinho Vazio"

            // Zera os valores exibidos na lateral
            txtSubtotal.textContent = "R$ 0,00";
            txtFrete.textContent = "R$ 0,00";
            txtTotal.textContent = "R$ 0,00";
            return;
        }

        // Se houver itens, garante que a tabela apareça e o aviso suma
        tabelaCompleta.style.display = "table";
        containerVazio.style.display = "none";

        // Limpa as linhas antigas da tabela antes de desenhar as novas
        tabelaItens.innerHTML = "";

        // Passar item por item do carrinho e criar a linha (TR) no HTML
        carrinho.forEach((produto, index) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td class="td-imagem">
                    <img src="${produto.imagem}" alt="${produto.nome}" class="img-produto-carrinho">
                </td>
                <td class="td-nome">
                    <span class="nome-prod">${produto.nome}</span>
                </td>
                <td class="td-qtd">
                    <div class="controle-qtd">
                        <button class="btn-qtd btn-diminuir" data-index="${index}">-</button>
                        <input type="number" value="${produto.quantidade}" readonly class="input-qtd">
                        <button class="btn-qtd btn-aumentar" data-index="${index}">+</button>
                    </div>
                </td>

                <td class="td-precoTotal">R$${produto.preco.toFixed(2).replace(".", ",")}</td>

                <td class="td-preco">R$${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}</td>

                <td class="td-X"><img src="../image/icon/excluir.png" class="img-X" data-index="${index}"></td>


            `;

            tabelaItens.appendChild(linha);
        });

        // Após desenhar os itens, faz as contas matemáticas dos totais
        calcularTotais(carrinho);
    }

    // 3. Função para calcular os valores (Subtotal e Total)
    function calcularTotais(carrinho) {
        let subtotal = 0;

        // Soma o (preço * quantidade) de cada produto
        carrinho.forEach(produto => {
            subtotal += produto.preco * produto.quantidade;
        });

        // O total sempre será o subtotal somado ao frete atual
        let total = subtotal + valorFreteAtual;

        // Atualiza os textos na tela formatando como moeda brasileira
        txtSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
        txtFrete.textContent = `R$ ${valorFreteAtual.toFixed(2).replace(".", ",")}`;
        txtTotal.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    }

    // 4. Escutar cliques na tabela para aumentar ou diminuir a quantidade
    tabelaItens.addEventListener("click", function (evento) {
        let carrinho = JSON.parse(localStorage.getItem("carrinho-fake")) || [];
        const index = evento.target.getAttribute("data-index");

        if (index === null) return;

        if (evento.target.classList.contains("btn-aumentar")) {
            carrinho[index].quantidade += 1;
        }

        else if (evento.target.classList.contains("btn-diminuir")) {
            carrinho[index].quantidade -= 1;
            if (carrinho[index].quantidade <= 0) {
                carrinho.splice(index, 1);
            }
        }
        if (evento.target.classList.contains("img-X")) {
            carrinho.splice(index, 1);
        }

        localStorage.setItem("carrinho-fake", JSON.stringify(carrinho));
        renderizarCarrinho();
    });

    // 5. Mapa de UF -> valor do frete (regra logística baseada em Sergipe)
    const TABELA_FRETE = {
        SE: 0.00,                                  // Frete grátis para o estado local
        AL: 12.90, BA: 12.90,                       // Vizinhos diretos (Nordeste mais próximo)
        PE: 19.90, CE: 19.90, RN: 19.90, PB: 19.90,
        MA: 19.90, PI: 19.90,                       // Restante do Nordeste
        SP: 22.00,                                  // Eixo RJ-SP
        RJ: 26.50, MG: 26.50, ES: 26.50,            // Restante do Sudeste
        PR: 35.00, SC: 35.00, RS: 35.00,
        GO: 35.00, DF: 35.00, MS: 35.00, MT: 35.00, // Sul e Centro-Oeste
        AM: 49.90, PA: 49.90, RO: 49.90, RR: 49.90,
        AC: 49.90, TO: 49.90, AP: 49.90             // Região Norte
    };
    const FRETE_PADRAO = 25.00; // Caso venha algum estado não mapeado

    // Consulta o ViaCEP via fetch (API REST normal, com suporte a CORS)
    async function consultarCep(cep) {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        return resposta.json();
    }

    // Ação acionada ao clicar no botão "Calcular" do formulário de frete
    btnCalcularFrete.addEventListener("click", async function () {
        const cep = inputCep.value.replace(/\D/g, "");

        if (cep === "") {
            alert("Por favor, informe um CEP.");
            return;
            
        }

        const validacep = /^[0-9]{8}$/;
        if (!validacep.test(cep)) {
            alert("Formato de CEP inválido.");
            return;
        }

        // Feedback visual simples enquanto a consulta acontece
        const textoOriginalBotao = btnCalcularFrete.textContent;
        btnCalcularFrete.disabled = true;
        btnCalcularFrete.textContent = "Consultando...";

        try {
            const conteudo = await consultarCep(cep);

            if ("erro" in conteudo) {
                valorFreteAtual = 0;
                alert("CEP não encontrado.");
                renderizarCarrinho();
                return;
            }

            const estado = conteudo.uf;
            valorFreteAtual = TABELA_FRETE[estado] ?? FRETE_PADRAO;

            freteCalculado = true;

            alert(`CEP localizado com sucesso!\nCidade: ${conteudo.localidade} - ${estado}\nFrete atualizado para a sua região.`);
            renderizarCarrinho();

        } catch (erro) {
            console.error("Erro ao consultar CEP:", erro);
            alert("Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.");
            freteCalculado = false;
        } finally {
            btnCalcularFrete.disabled = false;
            btnCalcularFrete.textContent = textoOriginalBotao;
        }
    });

    // 6. Botão de Finalizar Compra
    btnFinalizarCompra.addEventListener("click", function () {

        // Verifica se existe a flag de login no localStorage
        const estaLogado = localStorage.getItem("logado");

        if (!estaLogado || estaLogado !== "true") {
            alert("Você precisa fazer login para finalizar a compra.");
            window.location.href = "login.html";
            return; // interrompe a função aqui, o resto do código abaixo não executa
        }
        
        let carrinho = JSON.parse(localStorage.getItem("carrinho-fake")) || [];
        if (carrinho.length == 0) {
            alert("Adicione algum produto");
            return;
        }

        if (!freteCalculado) {
            alert("Por favor, calcule o frete antes de finalizar a compra.");
            return;
        }

        alert("Compra finalizada com sucesso! Obrigado por comprar na RS Elétrica.");
        localStorage.removeItem("carrinho-fake");
        valorFreteAtual = 0;
        freteCalculado = false;
        renderizarCarrinho();
    });

    // 7. Máscara do CEP enquanto o usuário digita (agora dentro do escopo correto)
    inputCep.addEventListener("input", function (evento) {
        // Pega o valor atual e remove tudo que não for número
        let valor = evento.target.value.replace(/\D/g, "");

        // Limita a string a no máximo 8 números puros
        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        // Se o usuário digitou mais de 5 números, encaixa o hífen no meio
        if (valor.length > 5) {
            valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
        }

        // Devolve o valor formatado de volta para o campo de texto
        evento.target.value = valor;
    });

    const cepSalvo = localStorage.getItem("cep-usuario-logado");
    if (cepSalvo) {
        inputCep.value = cepSalvo;
    }
        
    renderizarCarrinho();
});