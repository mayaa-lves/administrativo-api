/**
 * ARQUIVO: admin.js (Refatorado para Autenticação e Saneamento)
 */

const API_BASE_URL = 'https://backend-mu-gold-36.vercel.app';

// CRÍTICO: Recupera o token do localStorage sempre que o script carrega
let tokenAtual = localStorage.getItem('token_academia');
let listaAlunosLocal = [];

// Elementos do DOM
const alunoForm = document.getElementById('alunoForm');
const tabelaAlunos = document.getElementById('tabelaAlunos');
const formTitle = document.getElementById('formTitle');

// ==========================================
// 1. FUNÇÃO DE LISTAGEM (Precisa de Token)
// ==========================================
async function carregarAlunos() {
    if (!tokenAtual) return;

    try {
        const res = await fetch(`${API_BASE_URL}/alunos`, {
            headers: {
                'Authorization': `Bearer ${tokenAtual}` // Envia o token para poder listar
            }
        });

        if (res.ok) {
            listaAlunosLocal = await res.json();
            renderizarTabela();
        } else if (res.status === 401) {
            // Se o servidor disser que o token é inválido/expirou
            notificar("Sessão expirada. Faça login novamente.", "erro");
            localStorage.removeItem('token_academia');
            window.location.reload();
        }
    } catch (e) {
        console.error("Erro ao carregar lista", e);
    }
}

function renderizarTabela() {
    if (!tabelaAlunos) return;
    tabelaAlunos.innerHTML = '';
   
    listaAlunosLocal.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-all border-b border-slate-100";
        tr.innerHTML = `
            <td class="px-8 py-6">
                <div class="font-bold text-slate-700">${aluno.nome}</div>
                <div class="text-xs text-slate-400 font-mono">${aluno.cpf}</div>
            </td>
            <td class="px-8 py-6 text-sm font-semibold">${aluno.status}</td>
            <td class="px-8 py-6 text-right">
                <button onclick='prepararEdicao(${JSON.stringify(aluno)})'
                        class="p-2 bg-yellow-400 text-slate-900 rounded-lg mr-2 hover:bg-yellow-500 transition-colors">
                    <i class="fas fa-pen"></i>
                </button>
                <button onclick="deletarAluno('${aluno.cpf}')"
                        class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabelaAlunos.appendChild(tr);
    });
}

// ==========================================
// 2. SALVAR OU EDITAR (Precisa de Token)
// ==========================================
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
   
    // Atualiza a variável caso o login tenha acabado de ocorrer
    tokenAtual = localStorage.getItem('token_academia');

    if (!tokenAtual) {
        notificar("Você precisa estar logado para salvar.", "erro");
        return;
    }

    const id = document.getElementById('aluno_id').value;
    const alunoData = {
        nome: document.getElementById('nome').value.trim(),
        // Limpeza de CPF: Aceita pontos/traços no input mas envia só números para o app.py
        cpf: document.getElementById('cpf_cadastro').value.replace(/\D/g, ''),
        status: document.getElementById('statusdeacesso').value
    };

    // Ajuste da URL para edição (converte id para inteiro como o Python espera)
    const url = id ? `${API_BASE_URL}/alunos/${parseInt(id)}` : `${API_BASE_URL}/alunos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}` // Envia o token para salvar
            },
            body: JSON.stringify(alunoData)
        });

        const dadosRetorno = await res.json();

        if (res.ok) {
            notificar(id ? "Cadastro atualizado!" : "Aluno matriculado!");
            resetarFormulario();
            // Pequeno delay para o Firebase processar a escrita
            setTimeout(() => carregarAlunos(), 800);
        } else {
            // Mostra o erro exato retornado pelo seu app.py (Ex: "CPF já cadastrado")
            notificar(dadosRetorno.erro || "Falha ao salvar", "erro");
        }
    } catch (e) {
        notificar("Erro de conexão com o servidor", "erro");
    }
});

// ==========================================
// 3. EXCLUIR (Precisa de Token)
// ==========================================
async function deletarAluno(cpf) {
    if (!confirm(`Deseja excluir o aluno com CPF ${cpf}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/alunos/deletar`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAtual}` // Token obrigatório aqui também
            },
            body: JSON.stringify({ cpf: cpf })
        });

        if (res.ok) {
            notificar("Registro removido.");
            carregarAlunos();
        } else {
            notificar("Não foi possível excluir.", "erro");
        }
    } catch (e) {
        notificar("Erro ao deletar", "erro");
    }
}

// ==========================================
// FUNÇÕES DE SUPORTE
// ==========================================
function prepararEdicao(aluno) {
    document.getElementById('aluno_id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('cpf_cadastro').value = aluno.cpf;
    document.getElementById('statusdeacesso').value = aluno.status;
    if (formTitle) formTitle.innerText = "Editando Aluno #" + aluno.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetarFormulario() {
    alunoForm.reset();
    document.getElementById('aluno_id').value = '';
    if (formTitle) formTitle.innerText = "Novo Aluno";
}

function notificar(msg, tipo = 'sucesso') {
    // Alerta simples para garantir funcionamento; substitua por Toast se desejar
    alert(`${tipo.toUpperCase()}: ${msg}`);
}

function iniciarApp() {
    if (tokenAtual) {
        carregarAlunos();
    } else {
        console.warn("Nenhum token encontrado. Redirecionando ou exibindo login.");
    }
}

iniciarApp();