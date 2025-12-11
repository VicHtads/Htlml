// Variáveis globais
let ventiladores = [];
let productsFiltered = [];
let currentPage = 1;
const productsPerPage = 9;

// Carregar dados do JSON
async function loadVentiladores() {
    try {
        console.log('Iniciando carregamento do JSON...');
        const response = await fetch('ventiladores.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        ventiladores = await response.json();
        console.log('Ventiladores carregados:', ventiladores.length, 'produtos');
        
        productsFiltered = [...ventiladores];
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar JSON:', error);
        const container = document.getElementById('productsContainer');
        if (container) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red; padding: 2rem;">
                ❌ Erro ao carregar produtos. Verifique se o arquivo <strong>ventiladores.json</strong> está na mesma pasta que index.html.<br/>
                Erro: ${error.message}
            </p>`;
        }
    }
}

function renderProducts() {
    console.log('Renderizando produtos. Total:', ventiladores.length);
    
    if (ventiladores.length === 0) {
        console.warn('Nenhum produto disponível');
        return;
    }
    
    const container = document.getElementById('productsContainer');
    if (!container) {
        console.error('Container não encontrado!');
        return;
    }
    
    container.innerHTML = '';
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginated = productsFiltered.slice(startIndex, endIndex);

    console.log(`Mostrando produtos de ${startIndex} a ${endIndex}. Total filtrado: ${productsFiltered.length}`);

    if (paginated.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum produto encontrado.</p>';
        return;
    }

    paginated.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.imagem}" alt="${product.nome}" class="product-image" onerror="this.src='https://via.placeholder.com/200?text=Ventilador'">
            <div class="product-info">
                <div class="product-name">${product.nome}</div>
                <div class="product-potencia">⚡ ${product.potencia}</div>
                <div class="product-description">${product.descricao.substring(0, 80)}...</div>
                <div class="product-price">R$ ${product.preco.toFixed(2)}</div>
                <button class="btn btn-primary" onclick="openModal(${product.id})">Ver Detalhes</button>
            </div>
        `;
        container.appendChild(card);
    });

    renderPagination();
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
            document.querySelector('.catalog')?.scrollIntoView({ behavior: 'smooth' });
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
    console.log('Filtrados:', productsFiltered.length, 'produtos');
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
            productsFiltered.sort((a, b) => parseInt(b.potencia) - parseInt(a.potencia));
            break;
    }
    console.log('Ordenação aplicada:', sortValue);
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

function showSection(section) {
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    
    // Se for catálogo, reinicializar filtros
    if (section === 'catalog') {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'nome';
        productsFiltered = [...ventiladores];
        currentPage = 1;
    }
    
    // Fechar menu em mobile
    document.getElementById('mainNav')?.classList.remove('active');
    
    window.scrollTo(0, 0);
}

function toggleMenu() {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('active');
}

// Fechar menu ao clicar em um link (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        document.getElementById('mainNav')?.classList.remove('active');
    });
});

// Formulário de contato
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.name.value;
        alert(`Obrigado ${name}! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.`);
        this.reset();
    });
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Carregar ventiladores quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadVentiladores);
} else {
    loadVentiladores();
}