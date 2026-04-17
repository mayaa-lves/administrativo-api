/**
 * ARQUIVO: admin.js (Sistema de Catraca Academia Puxa Ferro)
 */

const API_BASE_URL = 'https://backend-mu-gold-36.vercel.app'; 

// ==========================================
// REFERÊNCIAS DO DOM
// ==========================================
const telaLogin = document.getElementById('telaLogin');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const alunoForm = document.getElementById('alunoForm');
const tabelaAlunos = document.getElementById('tabelaAlunos');
const totalCountEl = document.getElementById('totalCount');
const btnCancelar = document.getElementById('btnCancelar');
const formTitle = document.getElementById('formTitle');

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
let tokenAtual = localStorage.getItem('token_academia') || null;
let listaAlunosLocal = [];

function iniciarApp() {
    if (tokenAtual) {
        telaLogin.classList.add('hidden');
        carregarAlunos();
    } else {
        telaLogin.classList.remove('hidden');
    }
}

// ==========================================
// SISTEMA DE NOTIFICAÇÃO (Substitui o Alert)
// ==========================================
function notificar(mensagem, tipo = 'sucesso') {
    const toast = document.createElement('div');
    const bg = tipo === 'sucesso' ? 'bg-slate-900' : 'bg-red-600';
    const icon = tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    
    toast.className = `fixed bottom-8 right-8 ${bg} text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 transform translate-y-20 opacity-0 transition-all duration-500 z-[200] border border-white/10`;
    
    toast.innerHTML = `
        <i class="fas ${icon} text-yellow-400"></i>
        <span class="font-bold tracking-tight">${mensagem}</span>
    `;

    document.body.appendChild(toast);

    // Animação de entrada
    setTimeout(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    }, 100);

    // Remove após 3 segundos
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ==========================================
// 1. AUTENTICAÇÃO
// ==========================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const resposta = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha: password }) 
        });

        if (resposta.ok) {
            const dados = await resposta.json(); 
            tokenAtual = dados.token;
            localStorage.setItem('token_academia', tokenAtual); 
            
            notificar("Acesso autorizado! Bem-vindo.");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            notificar("Usuário ou senha inválidos.", "erro");
        }
    } catch (erro) {
        notificar("Erro de conexão com o servidor.", "erro");
    }
});

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token_academia');
    window.location.reload(); 
});

// ==========================================
// 2. CRUD: LISTAR (Com ícones)
// ==========================================
async function carregarAlunos() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos`, {
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });

        if (resposta.ok) {
            listaAlunosLocal = await resposta.json(); 
            renderizarTabela(); 
        }
    } catch (erro) {
        console.error(erro);
    }
}

function renderizarTabela() {
    tabelaAlunos.innerHTML = ''; 
    let ativos = 0;

    listaAlunosLocal.forEach(aluno => {
        if(aluno.status === "ATIVO") ativos++;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-all group";
        tr.innerHTML = `
            <td class="px-8 py-6">
                <div class="font-extrabold text-slate-800">${aluno.nome}</div>
                <div class="text-[11px] text-slate-400 font-mono mt-1 tracking-wider">${aluno.cpf}</div>
            </td>
            <td class="px-8 py-6">
                <span class="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest border ${aluno.status === 'ATIVO' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}">
                    ${aluno.status}
                </span>
            </td>
            <td class="px-8 py-6 text-right space-x-2">
                <button onclick="prepararEdicao(${JSON.stringify(aluno).replace(/"/g, '&quot;')})" 
                        class="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-sm">
                    <i class="fas fa-pen-to-square"></i>
                </button>
                <button onclick="deletarAluno('${aluno.cpf}')" 
                        class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });
    totalCountEl.textContent = ativos;
}

// ==========================================
// 3. CRUD: SALVAR / EDITAR
// ==========================================
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('aluno_id').value;
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf_cadastro').value.trim();
    const status = document.getElementById('statusdeacesso').value;

    if (cpf.length !== 11) {
        notificar("CPF deve ter exatamente 11 dígitos.", "erro");
        return;
    }

    const alunoData = { nome, cpf, status };

    try {
        const url = id ? `${API_BASE_URL}/alunos/${id}` : `${API_BASE_URL}/alunos`;
        const metodo = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}` 
            },
            body: JSON.stringify(alunoData)
        });

        if (res.ok) {
            notificar(id ? "Cadastro atualizado!" : "Novo aluno matriculado!");
            resetarFormulario();
            carregarAlunos(); 
        } else {
            notificar("Erro ao salvar os dados.", "erro");
        }
    } catch (erro) {
        notificar("Erro de conexão.", "erro");
    }
});

function prepararEdicao(aluno) {
    document.getElementById('aluno_id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('cpf_cadastro').value = aluno.cpf;
    document.getElementById('statusdeacesso').value = aluno.status;

    formTitle.innerHTML = `<span class="w-3 h-8 bg-blue-500 rounded-full"></span> Editando Aluno`;
    btnCancelar.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetarFormulario() {
    alunoForm.reset();
    document.getElementById('aluno_id').value = '';
    formTitle.innerHTML = `<span class="w-3 h-8 bg-yellow-400 rounded-full"></span> Novo Aluno`;
    btnCancelar.classList.add('hidden');
}

// ==========================================
// 4. CRUD: EXCLUIR
// ==========================================
async function deletarAluno(cpf) {
    // Aqui ainda uso o confirm nativo por ser uma ação crítica de segurança
    if (!confirm(`Tem certeza que deseja excluir o aluno do CPF ${cpf}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/alunos/deletar`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}`
            },
            body: JSON.stringify({ cpf })
        });

        if (res.ok) {
            notificar("Aluno removido do sistema.");
            carregarAlunos(); 
        } else {
            notificar("Não foi possível excluir.", "erro");
        }
    } catch (erro) {
        notificar("Erro ao tentar excluir.", "erro");
    }
}

// ==========================================
// FUNÇÃO DE PESQUISA E FILTRO DE STATUS
// ==========================================
function filtrarAlunos() {
    const termo = document.getElementById('inputPesquisa').value.toLowerCase();
    const statusFiltro = document.getElementById('filtroStatus').value; // PEGA O ATIVO/BLOQUEADO/TODOS
    const linhas = tabelaAlunos.getElementsByTagName('tr');

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        const textoLinha = linha.innerText.toLowerCase();
        
        // Verifica se a linha contém o texto da pesquisa
        const bateComTexto = textoLinha.includes(termo);
        
        // Verifica se o status da linha bate com o filtro (ou se o filtro é "TODOS")
        // O includes(statusFiltro) funciona porque o texto da linha tem a palavra ATIVO ou BLOQUEADO
        const bateComStatus = (statusFiltro === "TODOS") || textoLinha.includes(statusFiltro.toLowerCase());

        // Só mostra se bater com os DOIS filtros ao mesmo tempo
        if (bateComTexto && bateComStatus) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }
    }
}

iniciarApp();