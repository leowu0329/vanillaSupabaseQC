// js/models/ipqcModel.js
class IPQCModel {
    constructor() {
        const { createClient } = supabase;
        this.client = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
    }

    async fetchAll(table, orderField = 'id') {
        const { data, error } = await this.client
            .from(table)
            .select('*')
            .order(orderField, { ascending: false });
        if (error) throw error;
        return data;
    }

    async create(table, record) {
        delete record.id; 
        const { data, error } = await this.client
            .from(table)
            .insert([record]);
        if (error) throw error;
        return data;
    }

    async update(table, id, record) {
        const { data, error } = await this.client
            .from(table)
            .update(record)
            .eq('id', id);
        if (error) throw error;
        return data;
    }

    async delete(table, id) {
        const { data, error } = await this.client
            .from(table)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return data;
    }
}