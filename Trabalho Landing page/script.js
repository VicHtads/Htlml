// Variáveis globais
let ventiladores = [];
let productsFiltered = [];
let currentPage = 1;
const productsPerPage = 8; // Ajustado para grid

// Carregar dados do JSON
async function loadVentiladores() {
    try {
        const response = await fetch('ventiladores.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        ventiladores = await response.json();
        productsFiltered = [...ventiladores];
        
        // Renderiza elementos iniciais
        renderFeaturedProducts();
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar JSON:', error);
        document.getElementById('productsContainer').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff0f0; border-radius: 10px; color: #d32f2f;">
                <h3>😕 Ops! Algo deu errado.</h3>
                <p>Não conseguimos carregar os produtos no momento.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Renderiza os 3 primeiros produtos na Home (Destaques)
function renderFeaturedProducts() {
    const container = document.getElementById('featuredContainer');
    if (!container) return;

    const featured = ventiladores.slice(0, 3); // Pega os 3 primeiros
    
    container.innerHTML = featured.map(product => `
        <div class="product-card">
            <div class="product-image" style="height: 180px;">
                <img src="${product.imagem}" alt="${product.nome}" style="width:100%; height:100%; object-fit:contain;" onerror="this.src='https://via.placeholder.com/200?text=Ventilador'">
            </div>
            <div class="product-info">
                <div class="product-name" style="font-size: 1rem;">${product.nome}</div>
                <div class="product-price">R$ ${product.preco.toFixed(2)}</div>
                <button class="btn btn-primary" style="width:100%; font-size: 0.9rem;" onclick="openModal(${product.id})">Espiar</button>
            </div>
        </div>
    `).join('');
}

// Renderiza o Catálogo Completo
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (productsFiltered.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhum produto encontrado com estes filtros.</div>';
        return;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginated = productsFiltered.slice(startIndex, endIndex);

    paginated.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.imagem}" alt="${product.nome}" style="width:100%; height:100%; object-fit:contain;" onerror="this.src='https://via.placeholder.com/200?text=Ventilador'">
            </div>
            <div class="product-info">
                <div class="product-name">${product.nome}</div>
                <div><span class="product-potencia">⚡ ${product.potencia}</span></div>
                <div class="product-description">${product.descricao.substring(0, 60)}...</div>
                <div class="product-price">R$ ${product.preco.toFixed(2)}</div>
                <button class="btn btn-primary full-width" onclick="openModal(${product.id})">Ver Detalhes</button>
            </div>
        `;
        container.appendChild(card);
    });

    renderPagination();
}

// Função para filtrar via cards da Home
function filterAndScroll(searchTerm) {
    // Vai para a aba catálogo
    showSection('catalog');
    
    // Define o valor no input de busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = searchTerm;
        // Dispara a função de filtro existente
        filterProducts();
    }
    
    // Rola até o topo da lista de produtos
    setTimeout(() => {
        scrollToElement('catalog');
    }, 100);
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    const totalPages = Math.ceil(productsFiltered.length / productsPerPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => {
            currentPage = i;
            renderProducts();
            document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        };
        pagination.appendChild(button);
    }
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    productsFiltered = ventiladores.filter(product =>
        product.nome.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderProducts();
}

function sortProducts() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    const sortValue = sortSelect.value;
    
    switch(sortValue) {
        case 'nome':
            productsFiltered.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'preco-asc':
            productsFiltered.sort((a, b) => a.preco - b.preco);
            break;
        case 'preco-desc':
            productsFiltered.sort((a, b) => b.preco - a.preco);
            break;
        case 'potencia':
            // Extrai números da string (ex: "120W" -> 120)
            productsFiltered.sort((a, b) => parseInt(b.potencia) - parseInt(a.potencia));
            break;
    }
    currentPage = 1;
    renderProducts();
}

function openModal(productId) {
    const product = ventiladores.find(p => p.id === productId);
    if (product) {
        document.getElementById('modalTitle').textContent = product.nome;
        document.getElementById('modalImage').src = product.imagem;
        document.getElementById('modalPrice').textContent = `R$ ${product.preco.toFixed(2)}`;
        document.getElementById('modalPotencia').textContent = product.potencia;
        document.getElementById('modalDescription').textContent = product.descricao;
        document.getElementById('productModal').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

function showSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    
    // Mostra a alvo
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        // Adiciona classe de animação
        targetSection.classList.remove('fade-in');
        void targetSection.offsetWidth; // trigger reflow
        targetSection.classList.add('fade-in');
    }
    
    // Atualiza menu
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
    
    // Reseta filtros se for catálogo
    if (sectionId === 'catalog') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && !searchInput.value) { // Só reseta se estiver vazio
            productsFiltered = [...ventiladores];
            currentPage = 1;
            renderProducts();
        }
    }
    
    document.getElementById('mainNav').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleMenu() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('active');
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', loadVentiladores);