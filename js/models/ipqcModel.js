// js/models/ipqcModel.js
class IPQCModel {
    constructor() {
        const { createClient } = supabase;
        this.client = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
    }

    // 通用獲取全部資料
    async fetchAll(table, orderField = 'id') {
        const { data, error } = await this.client
            .from(table)
            .select('*')
            .order(orderField, { ascending: false });
        if (error) throw error;
        return data;
    }

    // 通用新增紀錄
    async create(table, record) {
        delete record.id; 
        const { data, error } = await this.client
            .from(table)
            .insert([record]);
        if (error) throw error;
        return data;
    }

    // 通用更新紀錄
    async update(table, id, record) {
        const { data, error } = await this.client
            .from(table)
            .update(record)
            .eq('id', id);
        if (error) throw error;
        return data;
    }

    // 通用刪除紀錄
    async delete(table, id) {
        const { data, error } = await this.client
            .from(table)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return data;
    }
}