class AulasComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.hoje = this.getAttribute('data-hoje') || "ter";

    // JSON inline (evita fetch de arquivo externo)
    this.aulas = [
      { "id": 1, "disciplina": "S05 - Interface Homem-máquina", "data": "ter", "horario": "10:00", "local": "P1-S17", "prova_alert": false, "prova": "12/05", "frequencia": "10/25", "nota": "10" },
      { "id": 2, "disciplina": "E01 - Circuitos Elétricos em Corrente Contínua", "data": "ter", "horario": "10:00", "local": "P1-S17", "prova_alert": true, "prova": "12/05", "frequencia": "10/25", "nota": "5" },
      { "id": 3, "disciplina": "M02 - Álgebra e Geometria Analítica", "data": "ter", "horario": "10:00", "local": "P1-S17", "prova_alert": true, "prova": "12/05", "frequencia": "10/25", "nota": "7" }
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
            <div class="comp-aula">
              <div class="lable-prova p_lable" style="${provaDisplay}">
                PROVA: <b>${a.prova}</b>
              </div>
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
  }
}

customElements.define('aulas-component', AulasComponent);
