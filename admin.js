const API_BASE_URL = 'https://backend-mu-gold-36.vercel.app';
let tokenAtual = localStorage.getItem('token_academia');
let listaAlunosLocal = [];

function controlarAcesso() {
    const telaLogin = document.getElementById('telaLogin');
    if (!tokenAtual) {
        telaLogin?.classList.remove('hidden');
    } else {
        telaLogin?.classList.add('hidden');
        carregarAlunos();
    }
}

// LOGIN
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
            window.location.reload();
        } else { alert("Acesso negado!"); }
    } catch (e) { alert("Erro de rede"); }
});

// LISTAR
async function carregarAlunos() {
    if (!tokenAtual) return;
    try {
        const res = await fetch(`${API_BASE_URL}/alunos`, {
            headers: { 'Authorization': `Bearer ${tokenAtual}` }
        });
        listaAlunosLocal = await res.json();
        const tabela = document.getElementById('tabelaAlunos');
        tabela.innerHTML = "";
        let ativos = 0;

        listaAlunosLocal.forEach(aluno => {
            const isAtivo = aluno.status === "ATIVO";
            if(isAtivo) ativos++;
            tabela.innerHTML += `
                <tr class="hover:bg-slate-50/50 transition-all">
                    <td class="px-8 py-6">
                        <div class="font-extrabold text-slate-800">${aluno.nome}</div>
                        <div class="text-[11px] text-slate-400 font-mono mt-1 tracking-wider">${aluno.cpf}</div>
                    </td>
                    <td class="px-8 py-6">
                        <span onclick="alternarStatus(${aluno.id}, '${aluno.status}')" class="cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black tracking-widest border transition-all ${isAtivo ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}">
                            ${aluno.status}
                        </span>
                    </td>
                    <td class="px-8 py-6 text-right space-x-2">
                        <button onclick="prepararEdicao(${JSON.stringify(aluno).replace(/"/g, '&quot;')})" class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="deletarAluno('${aluno.cpf}')" class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </td>
                </tr>`;
        });
        document.getElementById('totalCount').innerText = ativos;
    } catch (e) { console.error(e); }
}

// SALVAR/EDITAR
document.getElementById('alunoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('aluno_id').value;
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf_cadastro').value.trim();
    const status = document.getElementById('statusdeacesso').value;
    
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/alunos/${id}` : `${API_BASE_URL}/alunos`;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAtual}` },
            body: JSON.stringify({ nome, cpf, status })
        });
        if(res.ok) { resetarFormulario(); carregarAlunos(); }
    } catch (e) { alert("Erro ao salvar"); }
});

function prepararEdicao(aluno) {
    document.getElementById('aluno_id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('cpf_cadastro').value = aluno.cpf;
    document.getElementById('statusdeacesso').value = aluno.status;
    document.getElementById('formTitle').innerText = "Editando Aluno";
    document.getElementById('btnCancelar').classList.remove('hidden');
}

function resetarFormulario() {
    document.getElementById('alunoForm').reset();
    document.getElementById('aluno_id').value = "";
    document.getElementById('formTitle').innerText = "Novo Aluno";
    document.getElementById('btnCancelar').classList.add('hidden');
}

async function alternarStatus(id, statusAtual) {
    const novo = statusAtual === "ATIVO" ? "BLOQUEADO" : "ATIVO";
    await fetch(`${API_BASE_URL}/alunos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAtual}` },
        body: JSON.stringify({ status: novo })
    });
    carregarAlunos();
}

async function deletarAluno(cpf) {
    if(!confirm("Excluir aluno?")) return;
    await fetch(`${API_BASE_URL}/alunos/deletar`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAtual}` },
        body: JSON.stringify({ cpf })
    });
    carregarAlunos();
}

document.getElementById('btnLogout')?.addEventListener('click', () => {
    localStorage.removeItem('token_academia');
    window.location.reload();
});

controlarAcesso();