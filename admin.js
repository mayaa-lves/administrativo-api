/**
 * ARQUIVO: admin.js (Sistema de Catraca Academia)
 * OBJETIVO: CRUD de Alunos consumindo a API da Academia
 */

// ==========================================
// CONFIGURAÇÕES GERAIS DA API
// ==========================================

// 🎯 [PASSO 1: Rota Base da Academia]
const API_BASE_URL = 'https://backend-mu-gold-36.vercel.app'; 

// ==========================================
// REFERÊNCIAS DO DOM
// ==========================================
const loginSection = document.getElementById('telaLogin'); // Adaptado do seu HTML
const adminSection = document.getElementById('adminSection'); 
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');
const userInfo = document.getElementById('userInfo');
const loginError = document.getElementById('loginError');

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
        mostrarPainelAdmin();
        carregarAlunos();
    } else {
        mostrarLogin();
    }
}

// ==========================================
// 1. AUTENTICAÇÃO (Login / Logout)
// ==========================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        // 🎯 [PASSO 2: Login na API da Academia]
        const resposta = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuario, senha: password }) 
        });

        if (resposta.ok) {
            const dados = await resposta.json(); 
            tokenAtual = dados.token;

            // 🎯 [PASSO 3: Storage da Academia]
            localStorage.setItem('token_academia', tokenAtual); 
            
            loginForm.reset(); 
            mostrarPainelAdmin();
            carregarAlunos(); 
        } else {
            alert("Acesso negado! Verifique suas credenciais.");
            if(loginError) loginError.classList.remove('hidden');
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Não foi possível conectar ao servidor da academia.");
    }
});

btnLogout.addEventListener('click', () => {
    tokenAtual = null;
    localStorage.removeItem('token_academia');
    window.location.reload(); 
});


// ==========================================
// 2. CRUD: READ (Listar Alunos)
// ==========================================
async function carregarAlunos() {
    try {
        // 🎯 [PASSO 4: Rota de Alunos]
        const resposta = await fetch(`${API_BASE_URL}/alunos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenAtual}`
            }
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert("Sessão expirada.");
            btnLogout.click();
            return;
        }

        if (resposta.ok) {
            listaAlunosLocal = await resposta.json(); 
            renderizarTabela(); 
        }
    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro);
    }
}

function renderizarTabela() {
    if (!tabelaAlunos) return;
    tabelaAlunos.innerHTML = ''; 
    
    let ativos = 0;

    listaAlunosLocal.forEach(aluno => {
        if(aluno.status === "ATIVO") ativos++;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-all";
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
            <td class="px-8 py-6 text-right">
                <button onclick="prepararEdicao(${JSON.stringify(aluno).replace(/"/g, '&quot;')})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                <button onclick="deletarAluno('${aluno.cpf}')" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });

    if(totalCountEl) totalCountEl.textContent = ativos;
}

// ==========================================
// 3. CRUD: CREATE e UPDATE
// ==========================================
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('aluno_id').value;
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf_cadastro').value;
    const status = document.getElementById('statusdeacesso').value;

    if (cpf.length !== 11 || isNaN(cpf)) {
        alert("O CPF deve ter exatamente 11 números e não conter letras.");
        return; }

    const alunoData = { nome, cpf, status };

    try {
        let url = `${API_BASE_URL}/alunos`;
        let metodoHTTP = 'POST'; 

        if (id) {
            url = `${API_BASE_URL}/alunos/${id}`;
            metodoHTTP = 'PUT'; 
        }

        const respostaApi = await fetch(url, {
            method: metodoHTTP,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}` 
            },
            body: JSON.stringify(alunoData)
        });

        if (respostaApi.ok) {
            alert(id ? "Dados do aluno atualizados!" : "Aluno cadastrado com sucesso!");
            limparFormulario();
            carregarAlunos(); 
        } else {
            alert("Erro ao salvar dados do aluno.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
    }
});

function prepararEdicao(aluno) {
    document.getElementById('aluno_id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('cpf_cadastro').value = aluno.cpf;
    document.getElementById('statusdeacesso').value = aluno.status;

    formTitle.textContent = "Editando Aluno";
    if(btnCancelar) btnCancelar.classList.remove('hidden');
}

if(btnCancelar) btnCancelar.addEventListener('click', limparFormulario);

function limparFormulario() {
    alunoForm.reset();
    document.getElementById('aluno_id').value = '';
    formTitle.textContent = "Novo Aluno";
    if(btnCancelar) btnCancelar.classList.add('hidden');
}


// ==========================================
// 4. CRUD: DELETE
// ==========================================
async function deletarAluno(cpf) {
    if (!confirm(`Deseja realmente excluir o aluno com CPF: ${cpf}?`)) return;

    try {
        const resposta = await fetch(`${API_BASE_URL}/alunos/deletar`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}`
            },
            body: JSON.stringify({ cpf: cpf })
        });

        if (resposta.ok) {
            carregarAlunos(); 
        } else {
            alert("Falha ao excluir aluno.");
        }
    } catch (erro) {
        console.error("Erro ao excluir:", erro);
    }
}


// ==========================================
// CONTROLE DE TELA
// ==========================================
function mostrarLogin() {
    if(loginSection) loginSection.classList.remove('hidden');
    if(adminSection) adminSection.classList.add('hidden');
    if(userInfo) userInfo.classList.add('hidden');
}

function mostrarPainelAdmin() {
    if(loginSection) loginSection.classList.add('hidden');
    if(adminSection) adminSection.classList.remove('hidden');
    if(userInfo) userInfo.classList.remove('hidden');
}

// Inicializa a aplicação
iniciarApp();