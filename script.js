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
        this.responses = [];
        this.deletedResponses = [];
        this.supabaseService = null;
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupSurveyCards();
        this.setupResults();
        this.setupAdmin();
        this.setupFeatureCards();
        this.setupDateFilters();
        
        // Inicializar Supabase
        await this.initializeSupabase();
        
        // Cargar datos desde Supabase
        await this.loadDataFromSupabase();
        
        this.updateStats();
    }

    async initializeSupabase() {
        try {
            // Verificar que Supabase esté disponible globalmente
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase no está disponible');
            }

            // Cargar el servicio de Supabase
            await this.loadSupabaseService();
            this.supabaseService = window.supabaseService;
            console.log('Supabase inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando Supabase:', error);
            // Fallback a localStorage si Supabase falla
            this.loadFromLocalStorage();
        }
    }

    async loadSupabaseService() {
        // Cargar el script de configuración de Supabase
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = './supabase-config.js';
            script.onload = () => {
                // Esperar un poco para que se inicialice
                setTimeout(() => {
                    if (window.supabaseService) {
                        resolve();
                    } else {
                        reject(new Error('No se pudo cargar el servicio de Supabase'));
                    }
                }, 100);
            };
            script.onerror = () => reject(new Error('Error cargando supabase-config.js'));
            document.head.appendChild(script);
        });
    }

    async loadDataFromSupabase() {
        if (!this.supabaseService) {
            this.loadFromLocalStorage();
            return;
        }

        try {
            // Cargar respuestas activas
            this.responses = await this.supabaseService.getAllResponses();
            
            // Cargar respuestas eliminadas
            this.deletedResponses = await this.supabaseService.getDeletedResponses();
            
            console.log(`Cargadas ${this.responses.length} respuestas desde Supabase`);
        } catch (error) {
            console.error('Error cargando datos desde Supabase:', error);
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        this.responses = JSON.parse(localStorage.getItem('paesurvey_responses')) || [];
        this.deletedResponses = JSON.parse(localStorage.getItem('paesurvey_deleted_responses')) || [];
        console.log('Usando localStorage como fallback');
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

    async saveResponse(surveyType, formData) {
        const response = {
            type: surveyType,
            data: Object.fromEntries(formData.entries())
        };
        
        try {
            if (this.supabaseService) {
                // Guardar en Supabase
                const savedResponse = await this.supabaseService.saveResponse(response);
                this.responses.unshift(savedResponse);
                console.log('Respuesta guardada en Supabase:', savedResponse);
            } else {
                // Fallback a localStorage
                const localResponse = {
                    id: Date.now(),
                    ...response,
                    date: new Date().toISOString()
                };
                this.responses.push(localResponse);
                this.saveData();
            }
            
            alert('¡Encuesta guardada exitosamente!');
            document.getElementById('survey-modal').style.display = 'none';
            this.updateStats();
        } catch (error) {
            console.error('Error guardando respuesta:', error);
            alert('Error guardando la encuesta. Por favor, intente nuevamente.');
        }
    }

    setupResults() {
        document.getElementById('load-results').addEventListener('click', () => {
            const surveyType = document.getElementById('survey-select').value;
            if (surveyType) {
                // Verificar si hay filtros de fecha aplicados
                const dateFrom = document.getElementById('date-from').value;
                const dateTo = document.getElementById('date-to').value;
                
                if (dateFrom && dateTo) {
                    // Usar análisis específico con filtros de fecha
                    this.showSpecificAnalysis(dateFrom, dateTo);
                } else {
                    // Mostrar todos los resultados sin filtros
                    this.loadResults(surveyType);
                }
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

        // Agregar tabla de respuestas con opciones de eliminación
        html += `<div class="responses-table-container">
            <h4>Respuestas Individuales</h4>
            <div class="table-responsive">
                <table class="responses-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Institución</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>`;

        responses.forEach(response => {
            const institution = response.data.institucion || response.data.institucion_educativa || 'No especificada';
            const date = new Date(response.date).toLocaleDateString('es-ES');
            
            html += `<tr>
                <td>${date}</td>
                <td>${institution}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="app.deleteResponse(${response.id})" title="Eliminar respuesta">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody>
                </table>
            </div>
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
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Respuestas',
                    data: values,
                    backgroundColor: [
                        '#EA5B0C',
                        '#F29100',
                        '#6EB3A6',
                        '#4A9B8E',
                        '#28a745',
                        '#17a2b8',
                        '#6c757d',
                        '#fd7e14'
                    ],
                    borderColor: [
                        '#d44a0a',
                        '#d17a00',
                        '#5a9b8e',
                        '#3a7b6e',
                        '#1e7e34',
                        '#138496',
                        '#5a6268',
                        '#e55a00'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribución de Respuestas'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                }
            }
        });
    }

    setupAdmin() {
        document.getElementById('export-all').addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('view-trash').addEventListener('click', () => {
            this.showTrash();
        });
    }

    showTrash() {
        const trashSection = document.getElementById('trash-section');
        const trashContent = document.getElementById('trash-content');
        
        if (this.deletedResponses.length === 0) {
            trashContent.innerHTML = '<div class="empty-trash"><p>🗑️ La papelera está vacía</p></div>';
        } else {
            let html = '';
            this.deletedResponses.forEach(response => {
                const institution = response.data.institucion || response.data.institucion_educativa || 'No especificada';
                const date = new Date(response.date).toLocaleDateString('es-ES');
                const deletedDate = new Date(response.deletedAt).toLocaleDateString('es-ES');
                const surveyType = this.getSurveyTypeName(response.type);
                
                html += `<div class="trash-item">
                    <div class="trash-item-info">
                        <h5>${surveyType}</h5>
                        <p><strong>Institución:</strong> ${institution}</p>
                        <p><strong>Fecha de respuesta:</strong> ${date}</p>
                        <p><strong>Eliminada el:</strong> ${deletedDate}</p>
                    </div>
                    <div class="trash-item-actions">
                        <button class="btn-restore" onclick="app.restoreResponse(${response.id})" title="Restaurar respuesta">
                            🔄 Restaurar
                        </button>
                    </div>
                </div>`;
            });
            trashContent.innerHTML = html;
        }
        
        trashSection.style.display = trashSection.style.display === 'none' ? 'block' : 'none';
    }

    getSurveyTypeName(type) {
        const names = {
            'racion-servida': 'Ración Servida',
            'racion-industrializada': 'Ración Industrializada',
            'coordinadores': 'Coordinadores PAE'
        };
        return names[type] || type;
    }

    setupDateFilters() {
        // Configurar filtros de fecha
        const periodSelect = document.getElementById('period-select');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const applyFilters = document.getElementById('apply-filters');
        const clearFilters = document.getElementById('clear-filters');
        const autoLoadInstitutions = document.getElementById('auto-load-institutions');
        const toggleFilters = document.getElementById('toggle-filters');

        // Configurar toggle de filtros
        if (toggleFilters) {
            toggleFilters.addEventListener('click', () => {
                this.toggleFiltersVisibility();
            });
        }

        // Configurar grupos colapsables
        this.setupCollapsibleGroups();

        // Manejar cambio de período
        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                this.handlePeriodChange();
            });
        }

        // Aplicar filtros
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applyDateFilters();
            });
        }

        // Limpiar filtros
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearDateFilters();
            });
        }

        // Cargar instituciones automáticamente
        if (autoLoadInstitutions) {
            autoLoadInstitutions.addEventListener('click', () => {
                this.loadInstitutionsList();
            });
        }

        // Configurar fechas por defecto
        this.setDefaultDates();

        // Cargar instituciones automáticamente al inicializar
        this.autoLoadInstitutions();
    }

    setupCollapsibleGroups() {
        // Configurar grupos colapsables
        document.querySelectorAll('.filter-group-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.target;
                const content = document.getElementById(targetId);
                const icon = header.querySelector('.collapse-icon');
                
                if (content && icon) {
                    content.classList.toggle('collapsed');
                    header.classList.toggle('collapsed');
                    
                    if (content.classList.contains('collapsed')) {
                        icon.style.transform = 'rotate(-90deg)';
                    } else {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });
    }

    toggleFiltersVisibility() {
        const filtersContent = document.getElementById('filters-content');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (filtersContent && toggleIcon) {
            filtersContent.classList.toggle('collapsed');
            
            if (filtersContent.classList.contains('collapsed')) {
                toggleIcon.textContent = '▶';
            } else {
                toggleIcon.textContent = '▼';
            }
        }
    }

    autoLoadInstitutions() {
        // Cargar instituciones automáticamente al inicializar
        setTimeout(() => {
            this.loadInstitutionsList();
        }, 1000);
    }

    handlePeriodChange() {
        const periodSelect = document.getElementById('period-select');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const today = new Date();

        switch (periodSelect.value) {
            case 'today':
                dateFrom.value = this.formatDate(today);
                dateTo.value = this.formatDate(today);
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                dateFrom.value = this.formatDate(weekStart);
                dateTo.value = this.formatDate(today);
                break;
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                dateFrom.value = this.formatDate(monthStart);
                dateTo.value = this.formatDate(today);
                break;
            case 'quarter':
                const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                dateFrom.value = this.formatDate(quarterStart);
                dateTo.value = this.formatDate(today);
                break;
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                dateFrom.value = this.formatDate(yearStart);
                dateTo.value = this.formatDate(today);
                break;
            case 'custom':
                // Habilitar edición manual
                break;
        }
    }

    setDefaultDates() {
        const today = new Date();
        const dateTo = document.getElementById('date-to');
        dateTo.value = this.formatDate(today);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    applyDateFilters() {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const analysisType = document.querySelector('input[name="analysis-type"]:checked').value;
        const institutionFilter = document.getElementById('institution-filter').value;
        const gradeFilter = document.getElementById('grade-filter').value;
        const ageRangeFilter = document.getElementById('age-range-filter').value;
        const sexFilter = document.getElementById('sex-filter').value;

        // Validar fechas
        if (!dateFrom || !dateTo) {
            this.showNotification('⚠️ Por favor seleccione un rango de fechas válido', 'warning');
            return;
        }

        // Validar que la fecha de inicio no sea mayor que la fecha final
        if (new Date(dateFrom) > new Date(dateTo)) {
            this.showNotification('⚠️ La fecha de inicio no puede ser mayor que la fecha final', 'warning');
            return;
        }

        // Mostrar indicador de carga
        this.showLoadingIndicator();

        // Aplicar filtros con un pequeño delay para mejor UX
        setTimeout(() => {
            try {
                if (analysisType === 'general') {
                    this.showGeneralAnalysis(dateFrom, dateTo, institutionFilter, gradeFilter, ageRangeFilter, sexFilter);
                } else {
                    this.showSpecificAnalysis(dateFrom, dateTo, institutionFilter, gradeFilter, ageRangeFilter, sexFilter);
                }
                
                // Mostrar resumen de filtros aplicados
                this.showFiltersSummary(dateFrom, dateTo, institutionFilter, gradeFilter, ageRangeFilter, sexFilter);
                
            } catch (error) {
                console.error('Error aplicando filtros:', error);
                this.showNotification('❌ Error aplicando filtros. Intente nuevamente.', 'error');
            } finally {
                this.hideLoadingIndicator();
            }
        }, 500);
    }

    showLoadingIndicator() {
        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            resultsContent.innerHTML = `
                <div class="loading-analysis">
                    <div class="spinner"></div>
                    <p>Aplicando filtros y generando análisis...</p>
                </div>
            `;
        }
    }

    hideLoadingIndicator() {
        // El contenido se reemplazará automáticamente por el análisis
    }

    showFiltersSummary(dateFrom, dateTo, institutionFilter, gradeFilter, ageRangeFilter, sexFilter) {
        const activeFilters = [];
        
        if (institutionFilter) activeFilters.push(`Institución: ${institutionFilter}`);
        if (gradeFilter) activeFilters.push(`Grado: ${gradeFilter}°`);
        if (ageRangeFilter) activeFilters.push(`Edad: ${ageRangeFilter} años`);
        if (sexFilter) activeFilters.push(`Sexo: ${sexFilter}`);
        
        const periodText = `${this.formatDateDisplay(dateFrom)} - ${this.formatDateDisplay(dateTo)}`;
        
        let summaryText = `📊 Análisis del período: ${periodText}`;
        if (activeFilters.length > 0) {
            summaryText += ` | Filtros: ${activeFilters.join(', ')}`;
        }
        
        this.showNotification(summaryText, 'info');
    }

    clearDateFilters() {
        // Limpiar todos los campos de filtros
        const filtersToClear = [
            'date-from', 'date-to', 'period-select', 
            'institution-filter', 'grade-filter', 
            'age-range-filter', 'sex-filter'
        ];
        
        filtersToClear.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        // Resetear tipo de análisis
        const generalRadio = document.querySelector('input[name="analysis-type"][value="general"]');
        if (generalRadio) {
            generalRadio.checked = true;
        }
        
        // Resetear período
        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.value = 'all';
        }
        
        // Limpiar contenido de resultados
        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            resultsContent.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">📊</div>
                    <h3>Seleccione filtros para ver los resultados</h3>
                    <p>Use los filtros de arriba para analizar las encuestas por período, institución, grado y otros criterios.</p>
                </div>
            `;
        }
        
        // Mostrar notificación de confirmación
        this.showNotification('✅ Filtros limpiados correctamente', 'success');
    }

    getFilteredResponses(dateFrom, dateTo, institutionFilter = '', gradeFilter = '', ageRangeFilter = '', sexFilter = '') {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día final

        return this.responses.filter(response => {
            const responseDate = new Date(response.date);
            const dateMatch = responseDate >= startDate && responseDate <= endDate;
            
            // Filtro por institución
            const institutionMatch = !institutionFilter || 
                (response.data.institucion && response.data.institucion === institutionFilter);
            
            // Filtro por grado
            const gradeMatch = !gradeFilter || 
                (response.data.grado && response.data.grado === gradeFilter);
            
            // Filtro por sexo
            const sexMatch = !sexFilter || 
                (response.data.sexo && response.data.sexo === sexFilter);
            
            // Filtro por rango de edad
            let ageMatch = true;
            if (ageRangeFilter && response.data.fecha_nacimiento) {
                const birthDate = new Date(response.data.fecha_nacimiento);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                switch (ageRangeFilter) {
                    case '5-8':
                        ageMatch = age >= 5 && age <= 8;
                        break;
                    case '9-12':
                        ageMatch = age >= 9 && age <= 12;
                        break;
                    case '13-16':
                        ageMatch = age >= 13 && age <= 16;
                        break;
                    case '17-20':
                        ageMatch = age >= 17 && age <= 20;
                        break;
                }
            }
            
            return dateMatch && institutionMatch && gradeMatch && sexMatch && ageMatch;
        });
    }

    showGeneralAnalysis(dateFrom, dateTo, institutionFilter = '', gradeFilter = '', ageRangeFilter = '', sexFilter = '') {
        const filteredResponses = this.getFilteredResponses(dateFrom, dateTo, institutionFilter, gradeFilter, ageRangeFilter, sexFilter);
        
        let html = `
            <div class="general-analysis">
                <div class="period-info">
                    <h4>📊 Análisis General del Período</h4>
                    <p><strong>Período:</strong> ${this.formatDateDisplay(dateFrom)} - ${this.formatDateDisplay(dateTo)}</p>
                    <p><strong>Total de respuestas:</strong> ${filteredResponses.length}</p>
                    ${institutionFilter ? `<p><strong>Institución:</strong> ${institutionFilter}</p>` : ''}
                    ${gradeFilter ? `<p><strong>Grado:</strong> ${gradeFilter}°</p>` : ''}
                </div>
                
                <div class="analysis-summary">
                    <div class="summary-card">
                        <h4>Total Respuestas</h4>
                        <div class="number">${filteredResponses.length}</div>
                        <div class="label">En el período seleccionado</div>
                    </div>
                    <div class="summary-card">
                        <h4>Ración Servida</h4>
                        <div class="number">${filteredResponses.filter(r => r.type === 'racion-servida').length}</div>
                        <div class="label">Respuestas</div>
                    </div>
                    <div class="summary-card">
                        <h4>Ración Industrializada</h4>
                        <div class="number">${filteredResponses.filter(r => r.type === 'racion-industrializada').length}</div>
                        <div class="label">Respuestas</div>
                    </div>
                    <div class="summary-card">
                        <h4>Coordinadores</h4>
                        <div class="number">${filteredResponses.filter(r => r.type === 'coordinadores').length}</div>
                        <div class="label">Respuestas</div>
                    </div>
                </div>
            </div>
        `;

        // Agregar gráficos por tipo de encuesta
        const surveyTypes = ['racion-servida', 'racion-industrializada', 'coordinadores'];
        surveyTypes.forEach(surveyType => {
            const typeResponses = filteredResponses.filter(r => r.type === surveyType);
            if (typeResponses.length > 0) {
                html += this.generateResultsHTML(surveyType, typeResponses);
            }
        });

        document.getElementById('results-content').innerHTML = html;
        
        // Generar gráficos después de insertar HTML
        setTimeout(() => {
            surveyTypes.forEach(surveyType => {
                const typeResponses = filteredResponses.filter(r => r.type === surveyType);
                if (typeResponses.length > 0) {
                    this.generateChartsForSurvey(surveyType, typeResponses);
                }
            });
        }, 100);
    }

    showSpecificAnalysis(dateFrom, dateTo, institutionFilter = '', gradeFilter = '', ageRangeFilter = '', sexFilter = '') {
        const surveySelect = document.getElementById('survey-select');
        const selectedSurvey = surveySelect.value;
        
        if (!selectedSurvey) {
            alert('Por favor seleccione una encuesta específica para el análisis');
            return;
        }

        const filteredResponses = this.getFilteredResponses(dateFrom, dateTo, institutionFilter, gradeFilter, ageRangeFilter, sexFilter);
        const surveyResponses = filteredResponses.filter(r => r.type === selectedSurvey);
        
        let html = `
            <div class="period-info">
                <h4>📊 Análisis Específico: ${this.getSurveyTypeName(selectedSurvey)}</h4>
                <p><strong>Período:</strong> ${this.formatDateDisplay(dateFrom)} - ${this.formatDateDisplay(dateTo)}</p>
                <p><strong>Respuestas en el período:</strong> ${surveyResponses.length}</p>
                ${institutionFilter ? `<p><strong>Institución:</strong> ${institutionFilter}</p>` : ''}
                ${gradeFilter ? `<p><strong>Grado:</strong> ${gradeFilter}°</p>` : ''}
            </div>
        `;

        if (surveyResponses.length > 0) {
            html += this.generateResultsHTML(selectedSurvey, surveyResponses);
        } else {
            html += '<div class="no-results"><p>No hay respuestas para este período y encuesta seleccionada</p></div>';
        }

        document.getElementById('results-content').innerHTML = html;
        
        if (surveyResponses.length > 0) {
            setTimeout(() => {
                this.generateChartsForSurvey(selectedSurvey, surveyResponses);
            }, 100);
        }
    }

    formatDateDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    generateChartsForSurvey(surveyType, responses) {
        // Generar estadísticas y gráficos para la encuesta específica
        const questionStats = this.calculateQuestionStats(responses);
        
        Object.keys(questionStats).forEach(question => {
            const stats = questionStats[question];
            const chartId = `chart-${question.replace(/\s+/g, '-')}`;
            this.createChart(chartId, stats);
        });
    }

    loadInstitutionsList() {
        const institutionSelect = document.getElementById('institution-filter');
        
        if (!institutionSelect) {
            console.warn('No se encontró el elemento institution-filter');
            return;
        }
        
        // Obtener todas las instituciones únicas de las respuestas
        const institutions = [...new Set(this.responses
            .filter(r => r.data.institucion || r.data.institucion_educativa)
            .map(r => r.data.institucion || r.data.institucion_educativa)
            .filter(inst => inst && inst.trim() !== '')
        )].sort();
        
        // Limpiar opciones existentes (excepto la primera)
        institutionSelect.innerHTML = '<option value="">Todas las instituciones</option>';
        
        // Agregar instituciones
        institutions.forEach(institution => {
            const option = document.createElement('option');
            option.value = institution;
            option.textContent = institution;
            institutionSelect.appendChild(option);
        });
        
        // Mostrar notificación más elegante
        if (institutions.length > 0) {
            this.showNotification(`✅ Se cargaron ${institutions.length} instituciones disponibles`, 'success');
        } else {
            this.showNotification('⚠️ No se encontraron instituciones en las respuestas', 'warning');
        }
        
        console.log(`Instituciones cargadas: ${institutions.length}`, institutions);
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 600;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
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
            <div class="stat-item">
                <div class="stat-number">${this.deletedResponses.length}</div>
                <div class="stat-label">En Papelera</div>
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
        if (!data || data.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Formatear datos para Excel
        const formattedData = data.map(response => {
            const formatted = {
                'ID': response.id,
                'Tipo de Encuesta': this.getSurveyTypeName(response.type),
                'Fecha': new Date(response.date).toLocaleDateString('es-ES'),
                'Hora': new Date(response.date).toLocaleTimeString('es-ES')
            };

            // Agregar todos los campos del formulario
            Object.keys(response.data).forEach(key => {
                const value = response.data[key];
                // Formatear el nombre del campo para que sea más legible
                const formattedKey = this.formatFieldName(key);
                formatted[formattedKey] = value;
            });

            return formatted;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas');
        
        // Ajustar ancho de columnas
        const colWidths = [];
        const headers = Object.keys(formattedData[0] || {});
        headers.forEach(header => {
            colWidths.push({ wch: Math.max(header.length, 15) });
        });
        worksheet['!cols'] = colWidths;
        
        XLSX.writeFile(workbook, filename);
        alert(`Se exportaron ${data.length} respuestas exitosamente`);
    }

    formatFieldName(fieldName) {
        const fieldMap = {
            'institucion': 'Institución',
            'grado': 'Grado',
            'nombre': 'Nombre',
            'apellido': 'Apellido',
            'edad': 'Edad',
            'telefono': 'Teléfono',
            'email': 'Email',
            'observaciones': 'Observaciones',
            'alimentos_gustan': 'Alimentos que más gustan',
            'alimentos_no_gustan': 'Alimentos que menos gustan'
        };

        return fieldMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Métodos para manejo de respuestas eliminadas
    async deleteResponse(responseId) {
        try {
            if (this.supabaseService) {
                // Eliminar en Supabase
                await this.supabaseService.deleteResponse(responseId);
                
                // Actualizar arrays locales
                const responseIndex = this.responses.findIndex(r => r.id === responseId);
                if (responseIndex !== -1) {
                    const deletedResponse = this.responses[responseIndex];
                    deletedResponse.deleted_at = new Date().toISOString();
                    this.deletedResponses.push(deletedResponse);
                    this.responses.splice(responseIndex, 1);
                }
            } else {
                // Fallback a localStorage
                const responseIndex = this.responses.findIndex(r => r.id === responseId);
                if (responseIndex !== -1) {
                    const deletedResponse = this.responses[responseIndex];
                    deletedResponse.deletedAt = new Date().toISOString();
                    deletedResponse.deletedBy = 'user';
                    
                    this.deletedResponses.push(deletedResponse);
                    this.responses.splice(responseIndex, 1);
                    this.saveData();
                }
            }
            
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error eliminando respuesta:', error);
            return false;
        }
    }

    async restoreResponse(responseId) {
        try {
            if (this.supabaseService) {
                // Restaurar en Supabase
                await this.supabaseService.restoreResponse(responseId);
                
                // Actualizar arrays locales
                const responseIndex = this.deletedResponses.findIndex(r => r.id === responseId);
                if (responseIndex !== -1) {
                    const restoredResponse = this.deletedResponses[responseIndex];
                    delete restoredResponse.deleted_at;
                    this.responses.push(restoredResponse);
                    this.deletedResponses.splice(responseIndex, 1);
                }
            } else {
                // Fallback a localStorage
                const responseIndex = this.deletedResponses.findIndex(r => r.id === responseId);
                if (responseIndex !== -1) {
                    const restoredResponse = this.deletedResponses[responseIndex];
                    delete restoredResponse.deletedAt;
                    delete restoredResponse.deletedBy;
                    
                    this.responses.push(restoredResponse);
                    this.deletedResponses.splice(responseIndex, 1);
                    this.saveData();
                }
            }
            
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error restaurando respuesta:', error);
            return false;
        }
    }

    saveData() {
        localStorage.setItem('paesurvey_responses', JSON.stringify(this.responses));
        localStorage.setItem('paesurvey_deleted_responses', JSON.stringify(this.deletedResponses));
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
