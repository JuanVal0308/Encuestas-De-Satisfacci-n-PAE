// Configuración de Supabase para Sistema de Encuestas PAE
// Usando la versión CDN de Supabase

// 🔧 CONFIGURACIÓN - Reemplaza estos valores con los de tu proyecto Supabase
const supabaseUrl = 'https://algrkzpmqvpmylszcrrk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ3JrenBtcXZwbXlsc3pjcnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjIyMTIsImV4cCI6MjA3Mzc5ODIxMn0.RZv3EiuAWBhWor1w07-twotlgBvIU-mtedHMdzhqZBU'

// Función para esperar a que Supabase esté disponible
function waitForSupabase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        const checkSupabase = () => {
            attempts++;
            if (window.supabase && window.supabase.createClient) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Supabase no se cargó después de 5 segundos'));
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        
        checkSupabase();
    });
}

// Crear cliente de Supabase de forma segura
let supabase = null;

async function initializeSupabase() {
    try {
        await waitForSupabase();
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase inicializado correctamente');
        return supabase;
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        throw error;
    }
}

// Inicializar inmediatamente
initializeSupabase().then(() => {
    window.supabaseClient = supabase;
}).catch(error => {
    console.error('Error en inicialización:', error);
});

// Servicio para manejar las respuestas de las encuestas
class SupabaseService {
    // Guardar una nueva respuesta
    async saveResponse(surveyData) {
        try {
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabase
                .from('survey_responses')
                .insert([
                    {
                        ...surveyData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()

            if (error) throw error
            
            console.log('Respuesta guardada:', data[0])
            return data[0]
        } catch (error) {
            console.error('Error guardando respuesta:', error)
            throw error
        }
    }

    // Obtener todas las respuestas
    async getAllResponses() {
        try {
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }

            const { data, error } = await supabase
                .from('survey_responses')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error obteniendo respuestas:', error)
            throw error
        }
    }

    // Obtener respuestas filtradas
    async getFilteredResponses(filters = {}) {
        try {
            let query = supabase
                .from('survey_responses')
                .select('*')

            // Aplicar filtros
            if (filters.surveyType) {
                query = query.eq('type', filters.surveyType)
            }
            if (filters.institution) {
                query = query.eq('data->institucion', filters.institution)
            }
            if (filters.grade) {
                query = query.eq('data->grado', filters.grade)
            }
            if (filters.sex) {
                query = query.eq('data->sexo', filters.sex)
            }
            if (filters.dateFrom && filters.dateTo) {
                query = query
                    .gte('created_at', filters.dateFrom)
                    .lte('created_at', filters.dateTo)
            }

            const { data, error } = await query.order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error obteniendo respuestas filtradas:', error)
            throw error
        }
    }

    // Escuchar cambios en tiempo real
    onResponsesChange(callback) {
        return supabase
            .channel('survey_responses_changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'survey_responses' 
                }, 
                (payload) => {
                    console.log('Cambio detectado:', payload)
                    // Recargar todas las respuestas cuando hay cambios
                    this.getAllResponses().then(callback)
                }
            )
            .subscribe()
    }

    // Eliminar respuesta (mover a papelera)
    async deleteResponse(responseId) {
        try {
            // Marcar como eliminada en lugar de eliminar físicamente
            const { data, error } = await supabase
                .from('survey_responses')
                .update({ 
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', responseId)
                .select()

            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error eliminando respuesta:', error)
            throw error
        }
    }

    // Restaurar respuesta
    async restoreResponse(responseId) {
        try {
            const { data, error } = await supabase
                .from('survey_responses')
                .update({ 
                    deleted_at: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', responseId)
                .select()

            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error restaurando respuesta:', error)
            throw error
        }
    }

    // Obtener respuestas eliminadas
    async getDeletedResponses() {
        try {
            const { data, error } = await supabase
                .from('survey_responses')
                .select('*')
                .not('deleted_at', 'is', null)
                .order('deleted_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error obteniendo respuestas eliminadas:', error)
            throw error
        }
    }

    // Obtener estadísticas generales
    async getStats() {
        try {
            const { data, error } = await supabase
                .from('survey_responses')
                .select('type, created_at')
                .is('deleted_at', null)

            if (error) throw error

            const stats = {
                total: data.length,
                racionServida: data.filter(r => r.type === 'racion-servida').length,
                racionIndustrializada: data.filter(r => r.type === 'racion-industrializada').length,
                coordinadores: data.filter(r => r.type === 'coordinadores').length
            }

            return stats
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error)
            throw error
        }
    }
}

// Crear instancia del servicio
const supabaseService = new SupabaseService()

// Exportar para uso global
window.supabaseService = supabaseService
