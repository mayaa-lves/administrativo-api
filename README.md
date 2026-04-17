# 🏋️‍♂️ Academia Puxa Ferro - Painel Administrativo

Sistema de gestão de alunos e controle de acesso desenvolvido para a **Academia Puxa Ferro**. A aplicação oferece uma interface moderna para administração de matrículas, monitoramento de status e integração com backend via API.

---

## 🚀 Funcionalidades

### 🔐 Segurança e Acesso
* **Sistema de Login**: Autenticação via usuário e senha com armazenamento de token JWT (`localStorage`).
* **Proteção de Rotas**: O painel só é carregado após a validação do token de acesso.
* **Logout**: Encerramento de sessão seguro com limpeza de credenciais locais.

### 👥 Gestão de Alunos (CRUD)
* **Cadastro**: Registro de novos alunos com validação de CPF (exige 11 dígitos numéricos).
* **Edição**: Atualização em tempo real de nomes, CPFs e permissões.
* **Exclusão**: Remoção de registros com confirmação de segurança nativa.
* **Status de Acesso**: Alternância rápida entre status **ATIVO** e **BLOQUEADO**.

### 📊 Painel de Controle e Filtros
* **Contador em Tempo Real**: Exibição dinâmica do total de membros ativos no sistema.
* **Busca Dinâmica**: Pesquisa por nome ou CPF diretamente na tabela.
* **Filtro de Status**: Visualização segmentada (Todos, Ativos ou Bloqueados).

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: HTML5 e JavaScript (ES6+).
* **Estilização**: [Tailwind CSS](https://tailwindcss.com) via CDN para interface responsiva.
* **Ícones**: [Font Awesome 6](https://fontawesome.com) para feedback visual.
* **Tipografia**: Fonte *Plus Jakarta Sans* para legibilidade moderna.
* **Backend**: Consumo de API REST hospedada no Vercel.

---

## 📁 Estrutura do Projeto

* `index.html`: Estrutura da interface, incluindo telas de login, formulários e tabela de dados.
* `admin.js`: Lógica de negócio, consumo da API (`fetch`), manipulação do DOM e sistema de notificações personalizadas.
* `icon.png`: Logotipo oficial do sistema (ícone de halter).

---

## ⚙️ Configuração e Execução

1. **Base da API**: O sistema consome a URL base: 
   `https://backend-mu-gold-36.vercel.app`.
2. **Validações**:
   * O CPF deve conter exatamente **11 dígitos**.
   * O sistema utiliza notificações visuais (Toasts) em vez de `alert()` comuns para melhor experiência do usuário.

---
