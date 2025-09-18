/**
 * Sistema de Encuestas PAE - Versión 2
 * Integración con nueva estructura de base de datos
 */

class SurveySystemV2 {
    constructor() {
        this.supabaseService = null;
        this.currentSurvey = null;
        this.currentSession = null;
        this.clientToken = null;
        this.responses = [];
        this.deletedResponses = [];
        this.isInitialized = false;
    }

    // Inicializar el sistema
    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Encuestas V2...');
            
            // Inicializar servicio de Supabase
            this.supabaseService = new window.SupabaseServiceV2();
            await this.supabaseService.initialize();
            
            // Generar token único para esta sesión
            this.clientToken = this.supabaseService.generateClientToken();
            
            this.isInitialized = true;
            console.log('✅ Sistema inicializado correctamente');
            
            // Cargar encuestas disponibles
            await this.loadAvailableSurveys();
            
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.showError('Error al inicializar el sistema. Recarga la página.');
        }
    }

    // Cargar encuestas disponibles
    async loadAvailableSurveys() {
        try {
            const surveys = await this.supabaseService.getActiveSurveys();
            this.updateSurveySelector(surveys);
        } catch (error) {
            console.error('Error cargando encuestas:', error);
        }
    }

    // Actualizar selector de encuestas
    updateSurveySelector(surveys) {
        const selector = document.getElementById('survey-selector');
        if (!selector) return;

        selector.innerHTML = '<option value="">Selecciona una encuesta</option>';
        
        surveys.forEach(survey => {
            const option = document.createElement('option');
            option.value = survey.slug;
            option.textContent = survey.title;
            selector.appendChild(option);
        });
    }

    // Cargar encuesta seleccionada
    async loadSurvey(slug) {
        try {
            if (!slug) return;
            
            console.log(`📋 Cargando encuesta: ${slug}`);
            this.currentSurvey = await this.supabaseService.getFullSurvey(slug);
            
            if (!this.currentSurvey) {
                throw new Error('Encuesta no encontrada');
            }
            
            this.displaySurvey(this.currentSurvey);
            
        } catch (error) {
            console.error('Error cargando encuesta:', error);
            this.showError('Error al cargar la encuesta seleccionada.');
        }
    }

    // Mostrar encuesta en el modal
    displaySurvey(survey) {
        const modal = document.getElementById('surveyModal');
        const modalTitle = document.getElementById('surveyModalTitle');
        const modalBody = document.getElementById('surveyModalBody');
        
        if (!modal || !modalTitle || !modalBody) return;

        // Configurar título
        modalTitle.textContent = survey.title;
        if (survey.description) {
            modalTitle.innerHTML += `<br><small class="text-muted">${survey.description}</small>`;
        }

        // Construir formulario
        let formHTML = '<form id="surveyForm">';
        
        survey.questions.forEach((question, index) => {
            formHTML += this.buildQuestionHTML(question, index);
        });
        
        formHTML += `
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeSurveyModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Enviar Encuesta</button>
            </div>
        </form>`;
        
        modalBody.innerHTML = formHTML;
        
        // Mostrar modal
        modal.style.display = 'block';
        
        // Configurar envío del formulario
        document.getElementById('surveyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitSurvey();
        });
    }

    // Construir HTML para una pregunta
    buildQuestionHTML(question, index) {
        let html = `
            <div class="form-section">
                <h4>${question.text}</h4>
        `;
        
        switch (question.type) {
            case 'rating':
                html += this.buildRatingQuestion(question, index);
                break;
            case 'single':
                html += this.buildSingleChoiceQuestion(question, index);
                break;
            case 'multi':
                html += this.buildMultiChoiceQuestion(question, index);
                break;
            case 'open':
                html += this.buildOpenQuestion(question, index);
                break;
        }
        
        html += '</div>';
        return html;
    }

    // Construir pregunta de rating (1-5)
    buildRatingQuestion(question, index) {
        let html = '<div class="rating-options">';
        for (let i = 1; i <= 5; i++) {
            html += `
                <label class="rating-option">
                    <input type="radio" name="question_${question.id}" value="${i}" required>
                    <span>${i}</span>
                </label>
            `;
        }
        html += '</div>';
        return html;
    }

    // Construir pregunta de opción única
    buildSingleChoiceQuestion(question, index) {
        let html = '<div class="choice-options">';
        question.choices.forEach(choice => {
            html += `
                <label class="choice-option">
                    <input type="radio" name="question_${question.id}" value="${choice.id}" required>
                    <span>${choice.text}</span>
                </label>
            `;
        });
        html += '</div>';
        return html;
    }

    // Construir pregunta de opción múltiple
    buildMultiChoiceQuestion(question, index) {
        let html = '<div class="choice-options">';
        question.choices.forEach(choice => {
            html += `
                <label class="choice-option">
                    <input type="checkbox" name="question_${question.id}" value="${choice.id}">
                    <span>${choice.text}</span>
                </label>
            `;
        });
        html += '</div>';
        return html;
    }

    // Construir pregunta abierta
    buildOpenQuestion(question, index) {
        return `
            <div class="open-question">
                <textarea name="question_${question.id}" rows="3" placeholder="Escribe tu respuesta aquí..." required></textarea>
            </div>
        `;
    }

    // Enviar encuesta
    async submitSurvey() {
        try {
            if (!this.currentSurvey) {
                throw new Error('No hay encuesta cargada');
            }

            console.log('📤 Enviando encuesta...');
            
            // Crear sesión de respuesta
            const session = await this.supabaseService.createAnswerSession(
                this.currentSurvey.id,
                this.clientToken,
                {
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            );
            
            this.currentSession = session;
            
            // Recopilar respuestas
            const answers = this.collectAnswers();
            
            // Guardar respuestas
            await this.supabaseService.saveSessionAnswers(
                session.id,
                this.clientToken,
                answers
            );
            
            console.log('✅ Encuesta enviada correctamente');
            this.showSuccess('¡Encuesta enviada correctamente!');
            this.closeSurveyModal();
            
        } catch (error) {
            console.error('Error enviando encuesta:', error);
            this.showError('Error al enviar la encuesta. Inténtalo de nuevo.');
        }
    }

    // Recopilar respuestas del formulario
    collectAnswers() {
        const answers = [];
        const form = document.getElementById('surveyForm');
        const formData = new FormData(form);
        
        this.currentSurvey.questions.forEach(question => {
            const answer = {
                question_id: question.id
            };
            
            switch (question.type) {
                case 'rating':
                    const rating = formData.get(`question_${question.id}`);
                    if (rating) {
                        answer.value_num = parseFloat(rating);
                    }
                    break;
                    
                case 'single':
                    const singleChoice = formData.get(`question_${question.id}`);
                    if (singleChoice) {
                        answer.choice_id = singleChoice;
                    }
                    break;
                    
                case 'multi':
                    const multiChoices = formData.getAll(`question_${question.id}`);
                    if (multiChoices.length > 0) {
                        // Para múltiples opciones, guardamos la primera (podríamos extender esto)
                        answer.choice_id = multiChoices[0];
                    }
                    break;
                    
                case 'open':
                    const textValue = formData.get(`question_${question.id}`);
                    if (textValue) {
                        answer.value_text = textValue.trim();
                    }
                    break;
            }
            
            if (answer.choice_id || answer.value_text || answer.value_num) {
                answers.push(answer);
            }
        });
        
        return answers;
    }

    // Cerrar modal de encuesta
    closeSurveyModal() {
        const modal = document.getElementById('surveyModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentSurvey = null;
        this.currentSession = null;
    }

    // Mostrar análisis de respuestas
    async showAnalysis() {
        try {
            if (!this.currentSurvey) {
                this.showError('Selecciona una encuesta primero');
                return;
            }
            
            console.log('📊 Generando análisis...');
            const stats = await this.supabaseService.getSurveyStats(this.currentSurvey.id);
            this.displayAnalysis(stats);
            
        } catch (error) {
            console.error('Error generando análisis:', error);
            this.showError('Error al generar el análisis');
        }
    }

    // Mostrar análisis en el modal
    displayAnalysis(stats) {
        const modal = document.getElementById('analysisModal');
        const modalBody = document.getElementById('analysisModalBody');
        
        if (!modal || !modalBody) return;
        
        let html = `
            <div class="analysis-header">
                <h3>Análisis de Respuestas</h3>
                <p>Total de respuestas: <strong>${stats.total_responses}</strong></p>
            </div>
        `;
        
        // Mostrar análisis por pregunta
        Object.values(stats.questions).forEach(question => {
            html += this.buildQuestionAnalysis(question);
        });
        
        modalBody.innerHTML = html;
        modal.style.display = 'block';
    }

    // Construir análisis para una pregunta
    buildQuestionAnalysis(question) {
        let html = `
            <div class="question-analysis">
                <h4>${question.text}</h4>
                <div class="analysis-content">
        `;
        
        switch (question.type) {
            case 'rating':
                html += this.buildRatingAnalysis(question);
                break;
            case 'single':
            case 'multi':
                html += this.buildChoiceAnalysis(question);
                break;
            case 'open':
                html += this.buildTextAnalysis(question);
                break;
        }
        
        html += '</div></div>';
        return html;
    }

    // Análisis de rating
    buildRatingAnalysis(question) {
        const ratings = question.responses.map(r => r.value);
        const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        
        return `
            <div class="rating-stats">
                <p>Promedio: <strong>${average.toFixed(1)}/5</strong></p>
                <div class="rating-distribution">
                    ${[1,2,3,4,5].map(rating => {
                        const count = ratings.filter(r => r === rating).length;
                        const percentage = (count / ratings.length) * 100;
                        return `
                            <div class="rating-bar">
                                <span>${rating}:</span>
                                <div class="bar">
                                    <div class="fill" style="width: ${percentage}%"></div>
                                </div>
                                <span>${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Análisis de opciones
    buildChoiceAnalysis(question) {
        const choices = {};
        question.responses.forEach(response => {
            const choice = response.choice;
            choices[choice] = (choices[choice] || 0) + 1;
        });
        
        const total = question.responses.length;
        
        return `
            <div class="choice-stats">
                ${Object.entries(choices).map(([choice, count]) => {
                    const percentage = (count / total) * 100;
                    return `
                        <div class="choice-item">
                            <span>${choice}:</span>
                            <div class="bar">
                                <div class="fill" style="width: ${percentage}%"></div>
                            </div>
                            <span>${count} (${percentage.toFixed(1)}%)</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Análisis de texto
    buildTextAnalysis(question) {
        const texts = question.responses.map(r => r.text).filter(t => t && t.trim());
        
        return `
            <div class="text-stats">
                <p>Respuestas de texto: <strong>${texts.length}</strong></p>
                <div class="text-responses">
                    ${texts.slice(0, 10).map(text => `
                        <div class="text-response">"${text}"</div>
                    `).join('')}
                    ${texts.length > 10 ? `<p>... y ${texts.length - 10} respuestas más</p>` : ''}
                </div>
            </div>
        `;
    }

    // Cerrar modal de análisis
    closeAnalysisModal() {
        const modal = document.getElementById('analysisModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Mostrar mensaje de éxito
    showSuccess(message) {
        // Implementar notificación de éxito
        alert('✅ ' + message);
    }

    // Mostrar mensaje de error
    showError(message) {
        // Implementar notificación de error
        alert('❌ ' + message);
    }
}

// Funciones globales para compatibilidad
let surveySystem;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    surveySystem = new SurveySystemV2();
    await surveySystem.init();
});

// Funciones globales
function loadSurvey() {
    const selector = document.getElementById('survey-selector');
    if (selector && surveySystem) {
        surveySystem.loadSurvey(selector.value);
    }
}

function showAnalysis() {
    if (surveySystem) {
        surveySystem.showAnalysis();
    }
}

function closeSurveyModal() {
    if (surveySystem) {
        surveySystem.closeSurveyModal();
    }
}

function closeAnalysisModal() {
    if (surveySystem) {
        surveySystem.closeAnalysisModal();
    }
}
