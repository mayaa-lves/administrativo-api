/**
 * ARQUIVO: admin.js
 */

const API_BASE_URL = 'https://backend-mu-gold-36.vercel.app';
let tokenAtual = localStorage.getItem('token_academia');
let listaAlunosLocal = [];

// ==========================================
// SISTEMA DE NOTIFICAÇÕES (SUBSTITUI ALERTS)
// ==========================================
function notificar(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bg = tipo === 'sucesso' ? 'bg-slate-900' : 'bg-red-600';
    const icon = tipo === 'sucesso' ? 'fa-check-circle text-green-400' : 'fa-exclamation-triangle';

    toast.className = `toast ${bg} text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10`;
    toast.innerHTML = `<i class="fas ${icon} text-lg"></i> <span class="font-bold text-sm">${mensagem}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// ==========================================
// LOGIN E CONTROLE DE SESSÃO
// ==========================================
function verificarAutenticacao() {
    const tela = document.getElementById('telaLogin');
    if (!tokenAtual) {
        tela.classList.remove('hidden');
    } else {
        tela.classList.add('hidden');
        carregarAlunos();
    }
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const dados = await res.json();
        if (res.ok) {
            localStorage.setItem('token_academia', dados.token);
            tokenAtual = dados.token;
            notificar("Acesso autorizado!");
            verificarAutenticacao();
        } else {
            notificar(dados.erro || "Credenciais inválidas", "erro");
        }
    } catch (err) {
        notificar("Erro de ligação ao servidor", "erro");
    }
});

document.getElementById('btnSair').onclick = () => {
    localStorage.removeItem('token_academia');
    location.reload();
};

// ==========================================
// GESTÃO DE DADOS (CRUD)
// ==========================================
async function carregarAlunos() {
    try {
        const res = await fetch(`${API_BASE_URL}/alunos`, {
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        if (res.ok) {
            listaAlunosLocal = await res.json();
            renderizarTabela(listaAlunosLocal);
        } else if (res.status === 401) {
            tokenAtual = null;
            verificarAutenticacao();
        }
    } catch (e) {
        notificar("Falha ao sincronizar dados", "erro");
    }
}

function renderizarTabela(alunos) {
    const tbody = document.getElementById('tabelaAlunos');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    document.getElementById('totalCount').innerText = alunos.filter(a => a.status === 'ATIVO').length;

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-all group";
        tr.innerHTML = `
            <td class="px-10 py-6">
                <div class="font-bold text-slate-800">${aluno.nome}</div>
                <div class="text-xs text-slate-400 font-mono tracking-tighter">${aluno.cpf}</div>
            </td>
            <td class="px-10 py-6">
                <span class="px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${aluno.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${aluno.status}
                </span>
            </td>
            <td class="px-10 py-6 text-right">
                <button onclick='prepararEdicao(${JSON.stringify(aluno)})' class="w-9 h-9 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><i class="fas fa-edit"></i></button>
                <button onclick="deletarAluno('${aluno.cpf}')" class="w-9 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-1"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('alunoForm').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('aluno_id').value;
    const dados = {
        nome: document.getElementById('nome').value.trim(),
        cpf: document.getElementById('cpf_cadastro').value.replace(/\D/g, ''),
        status: document.getElementById('statusdeacesso').value
    };

    const url = id ? `${API_BASE_URL}/alunos/${id}` : `${API_BASE_URL}/alunos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAtual}` },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            notificar(id ? "Perfil atualizado!" : "Novo aluno registado!");
            resetarFormulario();
            carregarAlunos();
        } else {
            const err = await res.json();
            notificar(err.erro || "Erro ao salvar", "erro");
        }
    } catch (e) {
        notificar("Erro técnico na operação", "erro");
    }
};

function prepararEdicao(aluno) {
    document.getElementById('aluno_id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('cpf_cadastro').value = aluno.cpf;
    document.getElementById('statusdeacesso').value = aluno.status;
    document.getElementById('formTitle').innerHTML = `<span class="w-2 h-7 bg-blue-500 rounded-full"></span> Editar Perfil`;
    document.getElementById('btnSalvar').innerText = "ATUALIZAR REGISTO";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetarFormulario() {
    document.getElementById('alunoForm').reset();
    document.getElementById('aluno_id').value = '';
    document.getElementById('formTitle').innerHTML = `<span class="w-2 h-7 bg-amber-400 rounded-full"></span> Novo Registo`;
    document.getElementById('btnSalvar').innerText = "SALVAR DADOS";
}

async function deletarAluno(cpf) {
    if (!confirm(`Deseja mesmo remover o aluno com CPF ${cpf}?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/alunos/deletar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAtual}` },
            body: JSON.stringify({ cpf: cpf })
        });
        if (res.ok) {
            notificar("Aluno removido.");
            carregarAlunos();
        }
    } catch (e) {
        notificar("Não foi possível apagar", "erro");
    }
}

document.getElementById('inputPesquisa').oninput = (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = listaAlunosLocal.filter(a => a.nome.toLowerCase().includes(termo) || a.cpf.includes(termo));
    renderizarTabela(filtrados);
};

verificarAutenticacao();