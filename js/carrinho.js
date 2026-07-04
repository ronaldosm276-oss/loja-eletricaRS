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
                <td class="td-preco">R$ ${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}</td>
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

        localStorage.setItem("carrinho-fake", JSON.stringify(carrinho));
        renderizarCarrinho();
    });

   // 5. ADAPTAÇÃO DA API VIACEP (Usando a técnica de Callback / JSONP enviada)
    
    // Esta função global receberá o resultado vindo do script do ViaCEP
    window.meu_callback = function (conteudo) {
        if (!("erro" in conteudo)) {
            // CEP encontrado com sucesso! Obtemos o Estado (UF)
            const estado = conteudo.uf;

            // REGRA LOGÍSTICA DE FRETE (Baseada em Sergipe)
            switch (estado) {
                case "SE":
                    valorFreteAtual = 0.00; // Frete Grátis para o estado local
                    break;

                case "AL": 
                case "BA":
                    valorFreteAtual = 12.90; // Vizinhos diretos (Nordeste mais próximo)
                    break;

                case "PE": 
                case "CE": 
                case "RN": 
                case "PB": 
                case "MA": 
                case "PI":
                    valorFreteAtual = 19.90; // Restante do Nordeste
                    break;

                case "SP":
                    valorFreteAtual = 22.00; // Eixo RJ-SP (Grande fluxo logístico/rodoviário, preço competitivo)
                    break;

                case "RJ": 
                case "MG": 
                case "ES":
                    valorFreteAtual = 26.50; // Restante da Região Sudeste
                    break;

                case "PR": 
                case "SC": 
                case "RS":
                case "GO": 
                case "DF": 
                case "MS": 
                case "MT":
                    valorFreteAtual = 35.00; // Regiões Sul e Centro-Oeste (Maior distância rodoviária)
                    break;

                case "AM": 
                case "PA": 
                case "RO": 
                case "RR": 
                case "AC": 
                case "TO": 
                case "AP":
                    valorFreteAtual = 49.90; // Região Norte (Logística complexa e grandes distâncias)
                    break;

                default:
                    valorFreteAtual = 25.00; // Caso venha algum estado não mapeado
            }

            // Alerta informativo ao usuário com os dados reais da API
            alert(`CEP localizado com sucesso!\nCidade: ${conteudo.localidade} - ${estado}\nFrete atualizado para a sua região.`);
            
            // Recarrega o carrinho para aplicar as contas com o novo frete
            renderizarCarrinho();
        } else {
            // CEP pesquisado mas não existe na base dos Correios
            valorFreteAtual = 0;
            alert("CEP não encontrado.");
            renderizarCarrinho();
        }
    };

    // Ação acionada ao clicar no botão "Calcular" do formulário de frete
    btnCalcularFrete.addEventListener("click", function () {
        // Nova variável "cep" somente com dígitos (exatamente como no seu exemplo)
        var cep = inputCep.value.replace(/\D/g, '');

        // Verifica se o campo cep possui valor informado
        if (cep != "") {
            // Expressão regular para validar o CEP (8 dígitos numéricos)
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {
                // Cria um elemento javascript de forma dinâmica
                var script = document.createElement('script');

                // Sincroniza com o nosso callback global criado acima
                script.src = 'https://viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';

                // Insere o script no documento para carregar o conteúdo e executar o callback
                document.body.appendChild(script);
            } else {
                alert("Formato de CEP inválido.");
            }
        } else {
            alert("Por favor, informe um CEP.");
        }
    });

    // 6. Botão de Finalizar Compra
    btnFinalizarCompra.addEventListener("click", function () {
        alert("Compra finalizada com sucesso! Obrigado por comprar na RS Elétrica.");
        localStorage.removeItem("carrinho-fake");
        valorFreteAtual = 0;
        renderizarCarrinho();
    });

    // Inicializa a página rodando a renderização pela primeira vez
    renderizarCarrinho();
});

// Função para aplicar a máscara e limitar o CEP enquanto o usuário digita
inputCep.addEventListener("input", function (evento) {
    // 1. Pega o valor atual e remove absolutamente tudo o que não for número
    let valor = evento.target.value.replace(/\D/g, "");

    // 2. Limita a string a no máximo 8 números puros
    if (valor.length > 8) {
        valor = valor.slice(0, 8);
    }

    // 3. Se o usuário digitou mais de 5 números, encaixa o hífen no meio
    if (valor.length > 5) {
        valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
    }

    // 4. Devolve o valor formatado de volta para o campo de texto
    evento.target.value = valor;
});