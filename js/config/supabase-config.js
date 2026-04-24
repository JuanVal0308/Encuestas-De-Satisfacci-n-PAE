// Configuración de Supabase para Sistema de Encuestas PAE
// Sin autenticación - acceso público

class SupabaseService {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        /** Evita varias instancias de GoTrueClient (createClient solo una vez). */
        this._initPromise = null;
    }

    async _fetchAllPaged(buildQuery, pageSize = 1000) {
        const all = [];
        let from = 0;

        while (true) {
            const to = from + pageSize - 1;
            const { data, error } = await buildQuery().range(from, to);
            if (error) throw error;

            if (Array.isArray(data) && data.length > 0) {
                all.push(...data);
            }

            if (!Array.isArray(data) || data.length < pageSize) {
                break;
            }

            from += pageSize;
        }

        return all;
    }

    async init() {
        if (this.isConnected && this.supabase) {
            return true;
        }
        if (this._initPromise) {
            return this._initPromise;
        }

        this._initPromise = this._doInit();
        try {
            return await this._initPromise;
        } finally {
            this._initPromise = null;
        }
    }

    async _doInit() {
        try {
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase no está disponible, usando localStorage');
                return false;
            }

            const supabaseUrl = 'https://nvecjznyilfqxpfepsdg.supabase.co';
            const supabaseKey = 'sb_publishable_KWANBx81avJMxMfVVbwZ4g_7i3hxvyx';

            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            this.isConnected = true;

            console.log('Supabase conectado correctamente');
            return true;
        } catch (error) {
            console.error('Error conectando a Supabase:', error);
            this.isConnected = false;
            this.supabase = null;
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
            const data = await this._fetchAllPaged(() =>
                this.supabase
                    .from('survey_responses')
                    .select('*')
                    // Algunos registros importados pueden traer is_deleted = NULL.
                    // Los tratamos como "no eliminados".
                    .or('is_deleted.is.null,is_deleted.eq.false')
                    // Paginación estable: ordenar por PK (id) y ordenar por fecha en cliente
                    .order('id', { ascending: true })
            );

            const sorted = (data || []).slice().sort((a, b) => {
                const ad = new Date(a.created_at).getTime();
                const bd = new Date(b.created_at).getTime();
                return bd - ad;
            });

            return sorted.map(item => ({
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
            const data = await this._fetchAllPaged(() =>
                this.supabase
                    .from('survey_responses')
                    .select('*')
                    .eq('survey_type', surveyType)
                    .or('is_deleted.is.null,is_deleted.eq.false')
                    .order('id', { ascending: true })
            );

            const sorted = (data || []).slice().sort((a, b) => {
                const ad = new Date(a.created_at).getTime();
                const bd = new Date(b.created_at).getTime();
                return bd - ad;
            });

            return sorted.map(item => ({
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
            const build = () => {
                let query = this.supabase
                    .from('survey_responses')
                    .select('*')
                    .or('is_deleted.is.null,is_deleted.eq.false')
                    .gte('created_at', startDate)
                    .lte('created_at', endDate);

                if (surveyType) {
                    query = query.eq('survey_type', surveyType);
                }

                return query.order('id', { ascending: true });
            };

            const data = await this._fetchAllPaged(build);

            const sorted = (data || []).slice().sort((a, b) => {
                const ad = new Date(a.created_at).getTime();
                const bd = new Date(b.created_at).getTime();
                return bd - ad;
            });

            return sorted.map(item => ({
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
            const data = await this._fetchAllPaged(() =>
                this.supabase
                    .from('deleted_responses')
                    .select('*')
                    .order('id', { ascending: true })
            );

            const sorted = (data || []).slice().sort((a, b) => {
                const ad = new Date(a.deleted_at).getTime();
                const bd = new Date(b.deleted_at).getTime();
                return bd - ad;
            });

            return sorted.map(item => ({
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
