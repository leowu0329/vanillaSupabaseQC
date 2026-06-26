// js/controllers/ipqcController.js
class IPQCController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.allData = []; 
        this.filteredData = []; 
        this.currentPage = 1; 
        this.limit = 10;

        this.currentTableKey = ''; 
        this.subAllData = []; 
        this.subFilteredData = []; 
        this.subCurrentPage = 1; 
        this.subLimit = 5;

        // 🌟 核心對齊校正：將 operator_list 的欄位從 dept 改為資料庫真實的 department
        this.tableConfigs = {
            defect: { title: '不良分類主檔 (defect_list)', table: 'defect_list', columns: [{ field: 'defect_type', label: '不良分類' }, { field: 'description', label: '敘述說明' }] },
            order: { title: '工單主檔 (order_list)', table: 'order_list', columns: [{ field: 'order_number', label: '工單號碼' }, { field: 'product_number', label: '產品料號' }, { field: 'product_name', label: '產品名稱' }, { field: 'quantity', label: '數量' }] },
            operator: { title: '操作員主檔 (operator_list)', table: 'operator_list', columns: [{ field: 'name', label: '操作員姓名' }, { field: 'department', label: '部門' }] },
            spec: { title: '規格圖面主檔 (spec_list)', table: 'spec_list', columns: [{ field: 'product_number', label: '對應產品料號' }, { field: 'spec', label: '規格' }, { field: 'version', label: '圖面版本' }] }
        };
    }

    async init() {
        try {
            this.allData = await this.model.fetchAll('ipqc_list');
            this.filteredData = [...this.allData];
            this.view.renderTable(this.filteredData, this.currentPage, this.limit);
            await this.refreshDropdowns();
        } catch (err) {
            console.error('資料初始化載入失敗:', err);
        }
    }

    async refreshDropdowns(currentOperator = '', currentDefect = '') {
        try {
            const operators = await this.model.fetchAll('operator_list', 'name');
            const defects = await this.model.fetchAll('defect_list', 'defect_type');
            this.view.updateSelectOptions('field_operator', operators, 'name', 'name', currentOperator);
            this.view.updateSelectOptions('field_defect_classification', defects, 'defect_type', 'defect_type', currentDefect);
        } catch (err) {
            console.error('更新下拉選單欄位失敗:', err);
        }
    }

    handleSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        this.filteredData = query ? this.allData.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(query))) : [...this.allData];
        this.currentPage = 1;
        this.view.renderTable(this.filteredData, this.currentPage, this.limit);
    }

    changePage(page) {
        this.currentPage = page;
        this.view.renderTable(this.filteredData, this.currentPage, this.limit);
    }

    openAddModal() {
        this.view.setFormData({});
        this.refreshDropdowns();
        this.view.ipqcModal.show();
    }

    openEditModal(id) {
        const record = this.allData.find(item => item.id === id);
        if (record) {
            this.view.setFormData(record);
            this.refreshDropdowns(record.operator, record.defect_classification);
            this.view.ipqcModal.show();
        }
    }

    async handleSave() {
        if (!this.view.form.checkValidity()) {
            this.view.form.reportValidity();
            return;
        }
        const data = this.view.getFormData();
        const id = data.id;

        // 剔除 id 屬性避免與資料庫自增鎖衝突
        delete data.id;

        try {
            if (id) {
                await this.model.update('ipqc_list', id, data);
            } else {
                await this.model.create('ipqc_list', data);
            }
            this.view.ipqcModal.hide();
            await this.init();
            alert('儲存作業成功！');
        } catch (err) {
            alert('系統儲存失敗: ' + err.message);
        }
    }

    async handleDelete(id) {
        if (confirm(`【⚠️ 刪除警告】確定要移除 ID: ${id} 的製程檢驗資料單嗎？`)) {
            try {
                await this.model.delete('ipqc_list', id);
                await this.init();
            } catch (err) {
                alert('刪除失敗: ' + err.message);
            }
        }
    }

    async handleOrderAutocomplete(inputEl) {
        const query = inputEl.value.trim().toLowerCase();
        const container = document.getElementById('autocomplete-list');
        if (!query) {
            container.style.display = 'none';
            return;
        }
        try {
            const orders = await this.model.fetchAll('order_list');
            const matches = orders.filter(o => String(o.order_number).toLowerCase().includes(query));
            this.view.renderAutocomplete(matches);
        } catch (err) {
            console.error(err);
        }
    }

    async selectOrderAutocomplete(orderItem) {
        document.getElementById('field_order_number').value = orderItem.order_number;
        document.getElementById('field_product_number').value = orderItem.product_number || '';
        document.getElementById('field_product_name').value = orderItem.product_name || '';
        document.getElementById('field_quantity').value = orderItem.quantity || 0;

        if (orderItem.product_number) {
            try {
                const specs = await this.model.fetchAll('spec_list');
                const matchedSpec = specs.find(s => String(s.product_number).trim() === String(orderItem.product_number).trim());
                if (matchedSpec) {
                    document.getElementById('field_spec').value = matchedSpec.spec || '';
                    document.getElementById('field_draw_ver').value = matchedSpec.version || '';
                } else {
                    document.getElementById('field_spec').value = '未建規格';
                    document.getElementById('field_draw_ver').value = 'N/A';
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    async openSubCrud(tableKey) {
        this.currentTableKey = tableKey;
        this.subCurrentPage = 1;
        document.getElementById('subSearchInput').value = '';
        await this.reloadSubDataCenter();
        this.view.subModal.show();
    }

    async reloadSubDataCenter() {
        const config = this.tableConfigs[this.currentTableKey];
        this.subAllData = await this.model.fetchAll(config.table);
        this.subFilteredData = [...this.subAllData];
        this.view.renderSubModal(config, this.subFilteredData, this.subCurrentPage, this.subLimit);
    }

    handleSubSearch() {
        const query = document.getElementById('subSearchInput').value.toLowerCase().trim();
        const config = this.tableConfigs[this.currentTableKey];
        this.subFilteredData = query ? this.subAllData.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(query))) : [...this.subAllData];
        this.subCurrentPage = 1;
        this.view.renderSubModal(config, this.subFilteredData, this.subCurrentPage, this.subLimit);
    }

    changeSubPage(page) {
        this.subCurrentPage = page;
        this.view.renderSubModal(this.tableConfigs[this.currentTableKey], this.subFilteredData, this.subCurrentPage, this.subLimit);
    }

    openSubEdit(id) {
        const config = this.tableConfigs[this.currentTableKey];
        const record = this.subAllData.find(item => item.id === id);
        if (record) this.view.renderSubForm(config, record);
    }

    async handleSubSave() {
        const config = this.tableConfigs[this.currentTableKey];
        const subData = this.view.getSubFormData(config.columns);
        const id = subData.id;

        // 剔除 id
        delete subData.id;

        try {
            if (id) {
                await this.model.update(config.table, id, subData);
            } else {
                await this.model.create(config.table, subData);
            }
            await this.reloadSubDataCenter();
            await this.refreshDropdowns(document.getElementById('field_operator').value, document.getElementById('field_defect_classification').value);
            alert('主檔變更儲存成功！');
        } catch (err) {
            alert('主檔儲存失敗: ' + err.message);
        }
    }

    async handleSubDelete(id) {
        if (confirm(`【⚠️ 刪除確認】確定要移除此筆參考主檔資料 (ID: ${id}) 嗎？`)) {
            try {
                await this.model.delete(this.tableConfigs[this.currentTableKey].table, id);
                await this.reloadSubDataCenter();
                await this.refreshDropdowns(document.getElementById('field_operator').value, document.getElementById('field_defect_classification').value);
            } catch (err) {
                alert('刪除失敗: ' + err.message);
            }
        }
    }

    handleSubExport() {
        if (this.subFilteredData.length === 0) return alert('無資料可匯出');
        const headers = Object.keys(this.subFilteredData[0]).join(',');
        const rows = this.subFilteredData.map(item => Object.values(item).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
        const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `SubBackup_${this.tableConfigs[this.currentTableKey].table}.csv`;
        link.click();
    }

    handleSubImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const lines = e.target.result.split('\n').map(l => l.trim()).filter(l => l);
                if (lines.length <= 1) return alert('無有效內容');
                const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
                const records = [];

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, ''));
                    const rec = {};
                    headers.forEach((h, idx) => {
                        if (h !== 'id' && h !== 'created_at') rec[h] = values[idx] || null;
                    });
                    records.push(rec);
                }

                const { error } = await this.model.client.from(this.tableConfigs[this.currentTableKey].table).insert(records);
                if (error) throw error;
                
                alert(`批次匯入完成，成功寫入 ${records.length} 筆資料。`);
                event.target.value = '';
                await this.reloadSubDataCenter();
                await this.refreshDropdowns();
            } catch (err) {
                alert('匯入失敗: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    handleExport() {
        if (this.filteredData.length === 0) return alert('無檢驗單可進行導出');
        const headers = Object.keys(this.filteredData[0]).join(',');
        const rows = this.filteredData.map(item => Object.values(item).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
        const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `IPQC_Master_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const lines = e.target.result.split('\n').map(l => l.trim()).filter(l => l);
                const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
                const records = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, ''));
                    const rec = {};
                    headers.forEach((h, idx) => {
                        if (h !== 'id' && h !== 'created_at') rec[h] = values[idx] || null;
                    });
                    records.push(rec);
                }
                const { error } = await this.model.client.from('ipqc_list').insert(records);
                if (error) throw error;
                alert('檢驗單主檔匯入順利完成！');
                event.target.value = '';
                await this.init();
            } catch (err) {
                alert('主檔匯入失敗: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
}