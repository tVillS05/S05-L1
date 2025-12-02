class AulasComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.hoje = this.getAttribute('data-hoje') || "ter";
    this.aulas = [
      { "id": 1, "disciplina": "S05 - Interface Homem-máquina", "data": "ter", "horario": "10:00", "local": "P1-S17", "prova_alert": false, "prova": "07/10", "frequencia": "10/25", "nota": "10", "interessados": ["Lucas","Bruna"] },
      { "id": 2, "disciplina": "E01 - Circuitos Elétricos em Corrente Contínua", "data": "ter", "horario": "10:00", "local": "P1-S17", "prova_alert": true, "prova": "12/05", "frequencia": "10/25", "nota": "5", "interessados": ["Ana","Gabriel","Thiago"] },
      { "id": 3, "disciplina": "M02 - Álgebra e Geometria Analítica", "data": "ter", "horario": "10:00", "local": "P1-S17", "prova_alert": true, "prova": "12/05", "frequencia": "10/25", "nota": "7", "interessados": ["Mariana"] }
    ];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const aulasDia = this.aulas.filter(a => a.data === this.hoje);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles_componente.css">
      <div>
        ${aulasDia.map(a => {
          const nota = parseFloat(a.nota);
          let classeNota = '';
          if (!isNaN(nota)) {
            if (nota < 6) classeNota = 'nota-baixa';
            else if (nota < 8) classeNota = 'nota-media';
            else classeNota = 'nota-alta';
          }
          const provaDisplay = a.prova_alert ? '' : 'display: none;';
          return `
            <div class="comp-aula" data-id="${a.id}">
              <div class="lable-prova p_lable" style="${provaDisplay}">PROVA: <b>${a.prova}</b></div>
              <div class="titulo_aula">${a.disciplina}</div>
              <p class="p">Local e Horário: <b>${a.local} - ${a.horario}</b></p>
              <div class="lables">
                <div class="lable-frequencia p_lable">FALTAS: <b>${a.frequencia}</b></div>
                <div class="lable-nota p_lable ${classeNota}">CR: <b>${a.nota}</b></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const btn = this.shadowRoot.getElementById('btn-open-grupos');
    if (btn) {
      btn.onclick = () => {
        const wrapper = document.getElementById('grupos-wrapper');
        if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('abrir-grupos', { detail: { from: 'aulas-component' } }));
      };
    }
  }
}

customElements.define('aulas-component', AulasComponent);

class GruposEstudo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.state = {
      etapa: 0,
      aulas: [],
      disciplinaId: null
    };

    this._onAbrir = () => {
      if (this.state.etapa === 0) this.setEtapa(1);
      else this.setEtapa(1);
    };
    window.addEventListener('abrir-grupos', this._onAbrir);

    this.loadAulas();
  }

  disconnectedCallback() {
    window.removeEventListener('abrir-grupos', this._onAbrir);
  }

  async loadAulas() {
    try {
      const res = await fetch('aulas.json');
      const json = await res.json();
      if (Array.isArray(json)) {
        this.state.aulas = json.map(a => ({ ...a, interessados: a.interessados || [], reunioes: a.reunioes || [], chat: a.chat || [] }));
      } else {
        this.state.aulas = [];
      }
    } catch (e) {
      this.state.aulas = [
        { id:1, disciplina:'S05 - Interface Homem-máquina', data:'ter', horario:'10:00', local:'P1-S17', prova_alert:false, prova:'07/10', frequencia:'10/25', nota:'10', interessados:['Lucas','Bruna'], reunioes:[], chat:[] },
        { id:2, disciplina:'E01 - Circuitos Elétricos em Corrente Contínua', data:'ter', horario:'10:00', local:'P1-S17', prova_alert:true, prova:'12/05', frequencia:'10/25', nota:'5', interessados:['Ana','Gabriel','Thiago'], reunioes:[], chat:[] },
        { id:3, disciplina:'M02 - Álgebra e Geometria Analítica', data:'ter', horario:'10:00', local:'P1-S17', prova_alert:true, prova:'12/05', frequencia:'10/25', nota:'7', interessados:['Mariana'], reunioes:[], chat:[] }
      ];
    }
    this.loadSavedState();
    this.render();
  }

  setEtapa(n) {
    this.state.etapa = n;
    this.render();
  }

  selecionarDisciplina(id) {
    this.state.disciplinaId = id;
    this.setEtapa(2);
  }

  marcarInteresse(nome = 'Você') {
    const aula = this.state.aulas.find(a => a.id === this.state.disciplinaId);
    if (!aula) { alert('Disciplina não encontrada.'); return; }
    aula.interessados = aula.interessados || [];
    if (!aula.interessados.includes(nome)) aula.interessados.push(nome);
    this.saveState();
    this.setEtapa(3);
  }

  enviarConvitePara(nome) {
    alert(`Convite enviado para ${nome}. (Protótipo)`);
  }

  aceitarConvite() {
    this.setEtapa(4);
  }

  agendarReuniao(dateStr) {
    const aula = this.state.aulas.find(a => a.id === this.state.disciplinaId);
    if (!aula) return;
    aula.reunioes = aula.reunioes || [];
    aula.reunioes.push(dateStr);
    this.saveState();
    this.render();
  }

  abrirChat() {
    this.setEtapa(4);
  }

  enviarMensagem(text) {
    if (!text) return;
    const aula = this.state.aulas.find(a => a.id === this.state.disciplinaId);
    if (!aula) return;
    aula.chat = aula.chat || [];
    aula.chat.push({ from: 'Você', text, at: new Date().toISOString() });
    this.saveState();
    this.render();
    const input = this.shadowRoot.getElementById('chat-input');
    if (input) input.focus();
  }

  saveState() {
    const slim = this.state.aulas.map(a => ({
      id: a.id,
      reunioes: a.reunioes || [],
      chat: a.chat || [],
      interessados: a.interessados || []
    }));
    localStorage.setItem('grupos_aulas_state', JSON.stringify(slim));
  }

  loadSavedState() {
    const raw = localStorage.getItem('grupos_aulas_state');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      parsed.forEach(saved => {
        const aula = this.state.aulas.find(a => a.id === saved.id);
        if (aula) {
          aula.reunioes = saved.reunioes || [];
          aula.chat = saved.chat || [];
          aula.interessados = saved.interessados || aula.interessados || [];
        }
      });
    } catch (e) {}
  }

  voltarPara(n) {
    this.setEtapa(n);
  }

  render() {
    const s = this.state;
    const aula = s.aulas.find(a => a.id === s.disciplinaId);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles_componente.css">
      <style>
        :host { display:block; }
        .root { display:flex; flex-direction:column; gap:8px; font-family:"Segoe UI", Arial, sans-serif; }
        .titulo{ font-weight:700; margin:0; color:#1e88e5; font-size:16px; }
        .small{ color:#666; font-size:13px; }
        .disc-list{ display:flex; flex-direction:column; gap:8px; max-height:220px; overflow:auto; padding-right:6px; }
        .disc-item{ background:#fff; padding:10px; border-radius:8px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.06); }
        .disc-item:hover{ background:#e9f5ff; }
        .badge{ background:#126ae2; color:#fff; padding:6px 10px; border-radius:999px; font-size:13px; }
        .row{ display:flex; justify-content:space-between; align-items:center; }
        .btn{ background:#1e88e5; color:#fff; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; font-weight:600; }
        .btn-ghost{ background:#fff; color:#1e88e5; border:1px solid #1e88e5; padding:7px 10px; border-radius:8px; cursor:pointer; }
        .aluno-row{ display:flex; justify-content:space-between; align-items:center; background:#fff; padding:8px; border-radius:8px; }
        .chat{ background:#fff; padding:10px; border-radius:8px; min-height:120px; box-shadow:0 4px 10px rgba(0,0,0,0.04); overflow:auto; }
        .msg{ margin-bottom:8px; }
        .msg-meta{ font-size:11px; color:#666; }
        .msg-text{ font-size:14px; }
        input[type="date"], input[type="text"], input#chat-input{ padding:8px; border-radius:8px; border:1px solid #ddd; font-size:14px; }
      </style>

      <div class="root">

        ${s.etapa === 0 ? `
          <div>
            <div class="titulo">Grupos de Estudo (fechado)</div>
            <p class="small">Clique no botão "Grupos de Estudo" no cartão de aulas para começar.</p>
            <div style="margin-top:8px; display:flex; gap:8px;"><button class="btn" id="abrir-lista">Abrir</button></div>
          </div>
        ` : ''}

        ${s.etapa === 1 ? `
          <div>
            <div class="titulo">1. Escolha a disciplina</div>
            <div class="disc-list">
              ${s.aulas.map(a => `
                <div class="disc-item" data-id="${a.id}">
                  <div class="row">
                    <div style="font-weight:600">${a.disciplina}</div>
                    <div class="badge">${(a.interessados||[]).length} interessados</div>
                  </div>
                  <div class="small">${a.local || ''} • ${a.horario || ''}</div>
                </div>
              `).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;"><button class="btn-ghost" id="fechar-lista">Fechar</button></div>
          </div>
        ` : ''}

        ${s.etapa === 2 && aula ? `
          <div>
            <div class="titulo">2. ${aula.disciplina}</div>
            <p class="small">Marque interesse e agende reuniões.</p>
            <div style="display:flex;gap:8px;margin-top:8px;"><button class="btn" id="btn-marcar">Marcar interesse</button><button class="btn-ghost" id="voltar-2">Voltar</button></div>

            <div style="margin-top:10px">
              <label class="small">Agendar reunião:</label>
              <div style="display:flex;gap:8px;margin-top:6px;">
                <input id="reuniao-date" type="date">
                <button class="btn" id="btn-agendar">Agendar</button>
              </div>
              <div id="reunioes-list" style="margin-top:8px;">
                ${(aula.reunioes||[]).map(r=>`<div class="small">📅 ${r}</div>`).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${s.etapa === 3 && aula ? `
          <div>
            <div class="titulo">3. Alunos interessados</div>
            ${(aula.interessados && aula.interessados.length) ? `
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${aula.interessados.map(nome => `
                  <div class="aluno-row">
                    <div>${nome}</div>
                    <div><button class="btn-ghost btn-invite" data-nome="${nome}">Convidar</button></div>
                  </div>
                `).join('')}
              </div>
            ` : `<div class="small">Nenhum interessado ainda.</div>`}
            <div style="display:flex;gap:8px;margin-top:8px;"><button class="btn" id="btn-entrar">Entrar / Criar grupo (Chat)</button><button class="btn-ghost" id="voltar-3">Voltar</button></div>
          </div>
        ` : ''}

        ${s.etapa === 4 && aula ? `
          <div>
            <div class="titulo">4. Chat do grupo — ${aula.disciplina}</div>
            <div class="chat" id="chat-area">
              ${ (aula.chat||[]).map(m => `<div class="msg"><div class="msg-meta">${m.from} • ${new Date(m.at).toLocaleString()}</div><div class="msg-text">${m.text}</div></div>`).join('') }
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <input id="chat-input" placeholder="Escreva uma mensagem..." />
              <button class="btn" id="send-chat">Enviar</button>
              <button class="btn-ghost" id="voltar-4">Fechar</button>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    const root = this.shadowRoot;

    if (s.etapa === 0) {
      const abrir = root.getElementById('abrir-lista');
      if (abrir) abrir.onclick = () => this.setEtapa(1);
    }

    if (s.etapa === 1) {
      root.querySelectorAll('.disc-item').forEach(el => {
        el.onclick = () => {
          const id = Number(el.getAttribute('data-id'));
          this.selecionarDisciplina(id);
        };
      });
      const back = root.getElementById('fechar-lista');
      if (back) back.onclick = () => this.setEtapa(0);
    }

    if (s.etapa === 2) {
      const btnMarcar = root.getElementById('btn-marcar');
      if (btnMarcar) btnMarcar.onclick = () => this.marcarInteresse();
      const back = root.getElementById('voltar-2');
      if (back) back.onclick = () => this.setEtapa(1);
      const btnAgendar = root.getElementById('btn-agendar');
      if (btnAgendar) btnAgendar.onclick = () => {
        const dateEl = root.getElementById('reuniao-date');
        if (dateEl && dateEl.value) this.agendarReuniao(dateEl.value);
      };
    }

    if (s.etapa === 3) {
      root.querySelectorAll('.btn-invite').forEach(b => {
        b.onclick = () => this.enviarConvitePara(b.dataset.nome);
      });
      const btnEntrar = root.getElementById('btn-entrar');
      if (btnEntrar) btnEntrar.onclick = () => this.abrirChat();
      const back = root.getElementById('voltar-3');
      if (back) back.onclick = () => this.setEtapa(2);
    }

    if (s.etapa === 4) {
      const send = root.getElementById('send-chat');
      if (send) send.onclick = () => {
        const input = root.getElementById('chat-input');
        if (input && input.value.trim()) { this.enviarMensagem(input.value.trim()); input.value = ''; }
      };
      const chatInput = root.getElementById('chat-input');
      if (chatInput) chatInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const val = chatInput.value.trim();
          if (val) { this.enviarMensagem(val); chatInput.value = ''; }
        }
      };
      const back = root.getElementById('voltar-4');
      if (back) back.onclick = () => this.setEtapa(0);
    }
  }
}

customElements.define('grupos-estudo', GruposEstudo);
