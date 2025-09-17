// Sistema de Encuestas PAE - Envigado
class EncuestasPAE {
    constructor() {
        this.surveys = {
            'racion-servida': {
                title: 'Evaluación de Satisfacción - Ración Servida',
                form: this.getRacionServidaForm()
            },
            'racion-industrializada': {
                title: 'Evaluación de Satisfacción - Ración Industrializada',
                form: this.getRacionIndustrializadaForm()
            },
            'coordinadores': {
                title: 'Evaluación para Coordinadores PAE',
                form: this.getCoordinadoresForm()
            }
        };
        this.responses = JSON.parse(localStorage.getItem('paesurvey_responses')) || [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSurveyCards();
        this.setupResults();
        this.setupAdmin();
        this.setupFeatureCards();
        this.updateStats();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(btn.dataset.section).classList.add('active');
            });
        });
    }

    setupSurveyCards() {
        document.querySelectorAll('.survey-card').forEach(card => {
            card.addEventListener('click', () => {
                const surveyType = card.dataset.survey;
                this.openSurvey(surveyType);
            });
        });
    }

    setupFeatureCards() {
        // Botón "Ir a Encuestas" - redirige a la sección de encuestas
        const surveyButton = document.querySelector('.feature-card:nth-child(1) .btn-primary');
        if (surveyButton) {
            surveyButton.addEventListener('click', () => {
                this.navigateToSection('surveys');
            });
        }

        // Botón "Ver Resultados" - redirige a la sección de resultados
        const resultsButton = document.querySelector('.feature-card:nth-child(2) .btn-primary');
        if (resultsButton) {
            resultsButton.addEventListener('click', () => {
                this.navigateToSection('results');
            });
        }

        // Botón "Administración" - redirige a la sección de administración
        const adminButton = document.querySelector('.feature-card:nth-child(3) .btn-primary');
        if (adminButton) {
            adminButton.addEventListener('click', () => {
                this.navigateToSection('admin');
            });
        }
    }

    navigateToSection(sectionId) {
        // Remover clase active de todos los botones de navegación
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Remover clase active de todas las secciones
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        
        // Activar el botón correspondiente
        const targetButton = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
        
        // Mostrar la sección correspondiente
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    async openSurvey(surveyType) {
        const modal = document.getElementById('survey-modal');
        const modalTitle = document.getElementById('modal-title');
        const surveyContent = document.getElementById('survey-content');
        
        modalTitle.textContent = this.surveys[surveyType].title;
        
        // Mostrar loading
        surveyContent.innerHTML = '<div class="loading-overlay show"><div class="spinner"></div><p>Cargando formulario...</p></div>';
        modal.style.display = 'block';
        
        try {
            // Cargar el formulario dinámicamente
            const formHTML = await this.surveys[surveyType].form;
            surveyContent.innerHTML = formHTML;
            
            // Configurar el formulario
            this.setupSurveyForm(surveyType);
        } catch (error) {
            console.error('Error cargando formulario:', error);
            surveyContent.innerHTML = '<p>Error cargando el formulario. Por favor, intente nuevamente.</p>';
        }
    }

    setupSurveyForm(surveyType) {
        const form = document.querySelector('#survey-modal form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveResponse(surveyType, new FormData(form));
            });
        }

        // Cerrar modal
        document.querySelector('.close-btn').onclick = () => {
            document.getElementById('survey-modal').style.display = 'none';
        };

        window.onclick = (event) => {
            const modal = document.getElementById('survey-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    saveResponse(surveyType, formData) {
        const response = {
            id: Date.now(),
            type: surveyType,
            date: new Date().toISOString(),
            data: Object.fromEntries(formData.entries())
        };
        
        this.responses.push(response);
        localStorage.setItem('paesurvey_responses', JSON.stringify(this.responses));
        
        alert('¡Encuesta guardada exitosamente!');
        document.getElementById('survey-modal').style.display = 'none';
        this.updateStats();
    }

    setupResults() {
        document.getElementById('load-results').addEventListener('click', () => {
            const surveyType = document.getElementById('survey-select').value;
            if (surveyType) {
                this.loadResults(surveyType);
            }
        });
    }

    loadResults(surveyType) {
        const resultsContent = document.getElementById('results-content');
        const surveyResponses = this.responses.filter(r => r.type === surveyType);
        
        if (surveyResponses.length === 0) {
            resultsContent.innerHTML = '<div class="no-results"><p>No hay respuestas para esta encuesta</p></div>';
            return;
        }

        resultsContent.innerHTML = this.generateResultsHTML(surveyType, surveyResponses);
    }

    generateResultsHTML(surveyType, responses) {
        let html = `<div class="results-header">
            <h3>${this.surveys[surveyType].title}</h3>
            <p>Total de respuestas: ${responses.length}</p>
        </div>`;

        // Generar gráficos para cada pregunta
        const questionStats = this.calculateQuestionStats(responses);
        
        Object.keys(questionStats).forEach(question => {
            const stats = questionStats[question];
            html += `<div class="chart-container">
                <h4 class="chart-title">${question}</h4>
                <canvas id="chart-${question.replace(/\s+/g, '-')}"></canvas>
            </div>`;
        });

        html += `<div class="export-controls">
            <button class="btn-success" onclick="app.exportSurveyData('${surveyType}')">
                📥 Exportar Excel
            </button>
        </div>`;

        setTimeout(() => {
            Object.keys(questionStats).forEach(question => {
                const stats = questionStats[question];
                this.createChart(`chart-${question.replace(/\s+/g, '-')}`, stats);
            });
        }, 100);

        return html;
    }

    calculateQuestionStats(responses) {
        const stats = {};
        
        responses.forEach(response => {
            Object.keys(response.data).forEach(key => {
                if (!stats[key]) stats[key] = {};
                const value = response.data[key];
                stats[key][value] = (stats[key][value] || 0) + 1;
            });
        });

        return stats;
    }

    createChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = Object.keys(data);
        const values = Object.values(data);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#EA5B0C',
                        '#F29100',
                        '#6EB3A6',
                        '#4A9B8E',
                        '#28a745'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupAdmin() {
        document.getElementById('export-all').addEventListener('click', () => {
            this.exportAllData();
        });
    }

    updateStats() {
        const stats = {
            total: this.responses.length,
            racionServida: this.responses.filter(r => r.type === 'racion-servida').length,
            racionIndustrializada: this.responses.filter(r => r.type === 'racion-industrializada').length,
            coordinadores: this.responses.filter(r => r.type === 'coordinadores').length
        };

        document.getElementById('general-stats').innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Encuestas</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.racionServida}</div>
                <div class="stat-label">Ración Servida</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.racionIndustrializada}</div>
                <div class="stat-label">Ración Industrializada</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.coordinadores}</div>
                <div class="stat-label">Coordinadores</div>
            </div>
        `;
    }

    exportSurveyData(surveyType) {
        const responses = this.responses.filter(r => r.type === surveyType);
        this.exportToExcel(responses, `encuesta-${surveyType}.xlsx`);
    }

    exportAllData() {
        this.exportToExcel(this.responses, 'todas-las-encuestas.xlsx');
    }

    exportToExcel(data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas');
        XLSX.writeFile(workbook, filename);
    }

    // Métodos para obtener los formularios de las encuestas
    async getRacionServidaForm() {
        try {
            const response = await fetch('surveys/racion-servida.html');
            return await response.text();
        } catch (error) {
            console.error('Error cargando formulario de ración servida:', error);
            return '<p>Error cargando el formulario</p>';
        }
    }

    async getRacionIndustrializadaForm() {
        try {
            const response = await fetch('surveys/racion-industrializada.html');
            return await response.text();
        } catch (error) {
            console.error('Error cargando formulario de ración industrializada:', error);
            return '<p>Error cargando el formulario</p>';
        }
    }

    async getCoordinadoresForm() {
        try {
            const response = await fetch('surveys/coordinadores.html');
            return await response.text();
        } catch (error) {
            console.error('Error cargando formulario de coordinadores:', error);
            return '<p>Error cargando el formulario</p>';
        }
    }
}

// Inicializar la aplicación
const app = new EncuestasPAE();
