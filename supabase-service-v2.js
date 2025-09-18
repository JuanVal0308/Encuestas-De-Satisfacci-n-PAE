/**
 * Servicio de Supabase para la nueva estructura de base de datos
 * Maneja encuestas, preguntas, opciones, sesiones y respuestas
 */

class SupabaseServiceV2 {
    constructor() {
        this.client = null;
        this.isInitialized = false;
    }

    // Inicializar el cliente de Supabase
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            
            // Crear cliente
            this.client = window.supabase.createClient(
                'https://algrkzpmqvpmylszcrrk.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ3JrenBtcXZwbXlsc3pjcnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjIyMTIsImV4cCI6MjA3Mzc5ODIxMn0.RZv3EiuAWBhWor1w07-twotlgBvIU-mtedHMdzhqZBU'
            );

            this.isInitialized = true;
            console.log('✅ SupabaseServiceV2 inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando SupabaseServiceV2:', error);
            throw error;
        }
    }

    // Esperar a que Supabase esté disponible
    async waitForSupabase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo
            
            const checkSupabase = () => {
                attempts++;
                
                if (window.supabase && window.supabase.createClient) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Supabase no se cargó en el tiempo esperado'));
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            
            checkSupabase();
        });
    }

    // Verificar que el cliente esté inicializado
    ensureInitialized() {
        if (!this.isInitialized || !this.client) {
            throw new Error('SupabaseServiceV2 no está inicializado');
        }
    }

    // ===== ENCUESTAS =====

    // Obtener todas las encuestas activas
    async getActiveSurveys() {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('surveys')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Obtener encuesta por slug
    async getSurveyBySlug(slug) {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('surveys')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data;
    }

    // ===== PREGUNTAS Y OPCIONES =====

    // Obtener preguntas de una encuesta
    async getSurveyQuestions(surveyId) {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('questions')
            .select('*')
            .eq('survey_id', surveyId)
            .order('ord', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // Obtener opciones de una pregunta
    async getQuestionChoices(questionId) {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('choices')
            .select('*')
            .eq('question_id', questionId)
            .order('ord', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // Obtener encuesta completa con preguntas y opciones
    async getFullSurvey(slug) {
        this.ensureInitialized();
        
        // Obtener encuesta
        const survey = await this.getSurveyBySlug(slug);
        if (!survey) return null;

        // Obtener preguntas
        const questions = await this.getSurveyQuestions(survey.id);
        
        // Para cada pregunta, obtener sus opciones
        for (let question of questions) {
            if (question.type === 'single' || question.type === 'multi') {
                question.choices = await this.getQuestionChoices(question.id);
            }
        }

        survey.questions = questions;
        return survey;
    }

    // ===== SESIONES Y RESPUESTAS =====

    // Crear nueva sesión de respuesta
    async createAnswerSession(surveyId, clientToken, meta = {}) {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('answer_sessions')
            .insert([{
                survey_id: surveyId,
                client_token: clientToken,
                meta: meta
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Guardar respuesta individual
    async saveAnswer(sessionId, questionId, clientToken, answerData) {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('answers')
            .insert([{
                session_id: sessionId,
                question_id: questionId,
                client_token: clientToken,
                ...answerData
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Guardar todas las respuestas de una sesión
    async saveSessionAnswers(sessionId, clientToken, answers) {
        this.ensureInitialized();
        
        const answerRecords = answers.map(answer => ({
            session_id: sessionId,
            question_id: answer.question_id,
            client_token: clientToken,
            choice_id: answer.choice_id || null,
            value_text: answer.value_text || null,
            value_num: answer.value_num || null
        }));

        const { data, error } = await this.client
            .from('answers')
            .insert(answerRecords)
            .select();

        if (error) throw error;
        return data;
    }

    // ===== ANÁLISIS Y REPORTES =====

    // Obtener respuestas de una encuesta (para análisis)
    async getSurveyResponses(surveyId) {
        this.ensureInitialized();
        
        const { data, error } = await this.client
            .from('answer_sessions')
            .select(`
                id,
                created_at,
                answers (
                    id,
                    question_id,
                    choice_id,
                    value_text,
                    value_num,
                    questions (
                        id,
                        text,
                        type,
                        choices (
                            id,
                            text
                        )
                    )
                )
            `)
            .eq('survey_id', surveyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Obtener estadísticas de una encuesta
    async getSurveyStats(surveyId) {
        this.ensureInitialized();
        
        // Obtener respuestas
        const responses = await this.getSurveyResponses(surveyId);
        
        // Calcular estadísticas
        const stats = {
            total_responses: responses.length,
            questions: {}
        };

        // Procesar cada pregunta
        for (let session of responses) {
            for (let answer of session.answers) {
                const questionId = answer.question_id;
                const question = answer.questions;
                
                if (!stats.questions[questionId]) {
                    stats.questions[questionId] = {
                        text: question.text,
                        type: question.type,
                        responses: []
                    };
                }

                // Agregar respuesta según el tipo
                if (question.type === 'rating') {
                    stats.questions[questionId].responses.push({
                        value: answer.value_num,
                        type: 'rating'
                    });
                } else if (question.type === 'single' || question.type === 'multi') {
                    const choice = question.choices.find(c => c.id === answer.choice_id);
                    stats.questions[questionId].responses.push({
                        choice: choice ? choice.text : 'Sin opción',
                        type: 'choice'
                    });
                } else if (question.type === 'open') {
                    stats.questions[questionId].responses.push({
                        text: answer.value_text,
                        type: 'text'
                    });
                }
            }
        }

        return stats;
    }

    // ===== UTILIDADES =====

    // Generar token único para el cliente
    generateClientToken() {
        return crypto.randomUUID();
    }

    // Validar estructura de respuesta
    validateAnswer(question, answerData) {
        const { type } = question;
        
        switch (type) {
            case 'rating':
                return answerData.value_num >= 1 && answerData.value_num <= 5;
            case 'single':
                return answerData.choice_id && answerData.choice_id.length > 0;
            case 'multi':
                return answerData.choice_ids && answerData.choice_ids.length > 0;
            case 'open':
                return answerData.value_text && answerData.value_text.trim().length > 0;
            default:
                return false;
        }
    }
}

// Crear instancia global
window.SupabaseServiceV2 = SupabaseServiceV2;
