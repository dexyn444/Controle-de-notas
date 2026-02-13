const DB_NF = 'ERP_NF_LIGHT';
const DB_USER = 'ERP_USERS_LIGHT';

let dbNotas = JSON.parse(localStorage.getItem(DB_NF)) || [];
let dbUsers = JSON.parse(localStorage.getItem(DB_USER)) || [{user: 'admin', pass: 'admin'}];
let currentTab = 'TODOS';

// --- AUTH ---
function autenticar() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const found = dbUsers.find(acc => acc.user === u && acc.pass === p);

    if (found) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('logged-user-name').innerText = u;
        sessionStorage.setItem('sessao', u);
        renderizar();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logout() { sessionStorage.removeItem('sessao'); location.reload(); }

// --- MODULOS ---
function trocarModulo(mod) {
    document.getElementById('mod-conferencia').style.display = mod === 'conferencia' ? 'block' : 'none';
    document.getElementById('mod-usuarios').style.display = mod === 'usuarios' ? 'block' : 'none';
    
    document.getElementById('btn-mod-conf').classList.toggle('active', mod === 'conferencia');
    document.getElementById('btn-mod-user').classList.toggle('active', mod === 'usuarios');
    if(mod === 'usuarios') renderizarUsuarios();
}

// --- NOTAS ---
function adicionarNF() {
    const num = document.getElementById('inputNF').value;
    const data = document.getElementById('inputData').value;
    if (!num || !data) return;

    dbNotas.push({ id: Date.now(), numero: parseInt(num), data: data, conferida: false });
    localStorage.setItem(DB_NF, JSON.stringify(dbNotas));
    currentTab = data;
    document.getElementById('inputNF').value = '';
    renderizar();
}

function alternarStatus(id) {
    dbNotas = dbNotas.map(n => n.id === id ? {...n, conferida: !n.conferida} : n);
    localStorage.setItem(DB_NF, JSON.stringify(dbNotas));
    renderizar();
}

function renderizar() {
    const listHtml = document.getElementById('tabelaNfs');
    const tabsHtml = document.getElementById('abasDias');
    listHtml.innerHTML = ''; tabsHtml.innerHTML = '';

    const datas = [...new Set(dbNotas.map(n => n.data))].sort();

    const addAba = (l, v) => {
        const li = document.createElement('li');
        li.innerText = l; li.className = currentTab === v ? 'active' : '';
        li.onclick = () => { currentTab = v; renderizar(); };
        tabsHtml.appendChild(li);
    }
    addAba('HISTÓRICO', 'TODOS');
    datas.forEach(d => addAba(d.split('-').reverse().join('/'), d));

    let lista = currentTab === 'TODOS' ? dbNotas : dbNotas.filter(n => n.data === currentTab);
    lista.sort((a, b) => a.numero - b.numero);

    document.getElementById('resumoTotal').innerText = lista.length;
    document.getElementById('resumoSucesso').innerText = lista.filter(n => n.conferida).length;

    lista.forEach(n => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="fa fa-circle" style="color:${n.conferida ? 'green' : 'orange'}"></i></td>
            <td><strong>NF ${n.numero}</strong></td>
            <td>${n.data.split('-').reverse().join('/')}</td>
            <td><button onclick="alternarStatus(${n.id})">${n.conferida ? 'Voltar' : 'OK'}</button></td>
        `;
        listHtml.appendChild(tr);
    });
}

// --- USUÁRIOS ---
function cadastrarUsuario() {
    const u = document.getElementById('new-user').value;
    const p = document.getElementById('new-pass').value;
    if (!u || !p) return;
    dbUsers.push({user: u, pass: p});
    localStorage.setItem(DB_USER, JSON.stringify(dbUsers));
    renderizarUsuarios();
}

function renderizarUsuarios() {
    const t = document.getElementById('tabelaUsuarios');
    t.innerHTML = dbUsers.map(u => `<tr><td>${u.user}</td><td><button onclick="dbUsers=dbUsers.filter(x=>x.user!=='${u.user}');localStorage.setItem(DB_USER,JSON.stringify(dbUsers));renderizarUsuarios();">Remover</button></td></tr>`).join('');
}

// Init
document.getElementById('inputData').valueAsDate = new Date();
if (sessionStorage.getItem('sessao')) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';
    renderizar();
}