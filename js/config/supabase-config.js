// Configuración de Supabase para Sistema de Encuestas PAE
// Sin autenticación - acceso público

class SupabaseService {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.init();
    }

    async init() {
        try {
            // Verificar si Supabase está disponible
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase no está disponible, usando localStorage');
                return false;
            }

            // Configuración de Supabase
            const supabaseUrl = 'https://algrkzpmqvpmylszcrrk.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ3JrenBtcXZwbXlsc3pjcnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjIyMTIsImV4cCI6MjA3Mzc5ODIxMn0.RZv3EiuAWBhWor1w07-twotlgBvIU-mtedHMdzhqZBU';

            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            this.isConnected = true;
            
            console.log('Supabase conectado correctamente');
            return true;
        } catch (error) {
            console.error('Error conectando a Supabase:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Guardar respuesta de encuesta
    async saveResponse(responseData) {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            const { data, error } = await this.supabase
                .from('survey_responses')
                .insert([
                    {
                        survey_type: responseData.type,
                        response_data: responseData.data,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;

            return {
                id: data[0].id,
                type: data[0].survey_type,
                data: data[0].response_data,
                date: data[0].created_at
            };
        } catch (error) {
            console.error('Error guardando respuesta:', error);
            throw error;
        }
    }

    // Obtener todas las respuestas
    async getAllResponses() {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            const { data, error } = await this.supabase
                .from('survey_responses')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(item => ({
                id: item.id,
                type: item.survey_type,
                data: item.response_data,
                date: item.created_at
            }));
        } catch (error) {
            console.error('Error obteniendo respuestas:', error);
            throw error;
        }
    }

    // Obtener respuestas por tipo
    async getResponsesByType(surveyType) {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            const { data, error } = await this.supabase
                .from('survey_responses')
                .select('*')
                .eq('survey_type', surveyType)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(item => ({
                id: item.id,
                type: item.survey_type,
                data: item.response_data,
                date: item.created_at
            }));
        } catch (error) {
            console.error('Error obteniendo respuestas por tipo:', error);
            throw error;
        }
    }

    // Obtener respuestas filtradas por fecha
    async getResponsesByDateRange(startDate, endDate, surveyType = null) {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            let query = this.supabase
                .from('survey_responses')
                .select('*')
                .eq('is_deleted', false)
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            if (surveyType) {
                query = query.eq('survey_type', surveyType);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(item => ({
                id: item.id,
                type: item.survey_type,
                data: item.response_data,
                date: item.created_at
            }));
        } catch (error) {
            console.error('Error obteniendo respuestas por fecha:', error);
            throw error;
        }
    }

    // Eliminar respuesta (mover a papelera)
    async deleteResponse(responseId) {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            // Primero obtener la respuesta original
            const { data: originalResponse, error: fetchError } = await this.supabase
                .from('survey_responses')
                .select('*')
                .eq('id', responseId)
                .single();

            if (fetchError) throw fetchError;

            // Mover a tabla de eliminados
            const { error: insertError } = await this.supabase
                .from('deleted_responses')
                .insert([
                    {
                        original_id: responseId,
                        survey_type: originalResponse.survey_type,
                        response_data: originalResponse.response_data,
                        original_created_at: originalResponse.created_at,
                        deleted_at: new Date().toISOString()
                    }
                ]);

            if (insertError) throw insertError;

            // Marcar como eliminado en la tabla principal
            const { error: updateError } = await this.supabase
                .from('survey_responses')
                .update({ 
                    is_deleted: true, 
                    deleted_at: new Date().toISOString() 
                })
                .eq('id', responseId);

            if (updateError) throw updateError;

            return true;
        } catch (error) {
            console.error('Error eliminando respuesta:', error);
            throw error;
        }
    }

    // Restaurar respuesta desde papelera
    async restoreResponse(originalId) {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            // Obtener datos de la papelera
            const { data: deletedResponse, error: fetchError } = await this.supabase
                .from('deleted_responses')
                .select('*')
                .eq('original_id', originalId)
                .single();

            if (fetchError) throw fetchError;

            // Restaurar en tabla principal
            const { error: updateError } = await this.supabase
                .from('survey_responses')
                .update({ 
                    is_deleted: false, 
                    deleted_at: null 
                })
                .eq('id', originalId);

            if (updateError) throw updateError;

            // Eliminar de papelera
            const { error: deleteError } = await this.supabase
                .from('deleted_responses')
                .delete()
                .eq('original_id', originalId);

            if (deleteError) throw deleteError;

            return true;
        } catch (error) {
            console.error('Error restaurando respuesta:', error);
            throw error;
        }
    }

    // Obtener respuestas eliminadas
    async getDeletedResponses() {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            const { data, error } = await this.supabase
                .from('deleted_responses')
                .select('*')
                .order('deleted_at', { ascending: false });

            if (error) throw error;

            return data.map(item => ({
                id: item.original_id,
                type: item.survey_type,
                data: item.response_data,
                date: item.original_created_at,
                deletedAt: item.deleted_at
            }));
        } catch (error) {
            console.error('Error obteniendo respuestas eliminadas:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    async getStats() {
        if (!this.isConnected) {
            throw new Error('Supabase no está conectado');
        }

        try {
            const { data, error } = await this.supabase
                .rpc('get_survey_stats');

            if (error) throw error;

            return data[0];
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Sincronizar con localStorage
    async syncWithLocalStorage() {
        try {
            // Obtener datos de Supabase
            const responses = await this.getAllResponses();
            const deletedResponses = await this.getDeletedResponses();

            // Guardar en localStorage como backup
            localStorage.setItem('paesurvey_responses', JSON.stringify(responses));
            localStorage.setItem('paesurvey_deleted_responses', JSON.stringify(deletedResponses));

            console.log('Sincronización completada');
            return { responses, deletedResponses };
        } catch (error) {
            console.error('Error en sincronización:', error);
            throw error;
        }
    }
}

// Crear instancia global
window.supabaseService = new SupabaseService();
