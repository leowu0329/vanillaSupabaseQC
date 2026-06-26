// js/views/ipqcView.js
class IPQCView {
    constructor() {
        this.tableBody = document.getElementById('ipqcTableBody');
        this.pageInfo = document.getElementById('pageInfo');
        this.pagination = document.getElementById('pagination');
        this.ipqcModal = new bootstrap.Modal(document.getElementById('ipqcModal'));
        this.form = document.getElementById('ipqcForm');

        this.subModalElement = document.getElementById('subCrudModal');
        this.subModal = new bootstrap.Modal(this.subModalElement);
        this.subTableHead = document.getElementById('subTableHead');
        this.subTableBody = document.getElementById('subTableBody');
        this.subFormFields = document.getElementById('subFormFields');
        this.subPagination = document.getElementById('subPagination');
        this.subPageInfo = document.getElementById('subPageInfo');
    }

    renderTable(data, page = 1, limit = 10) {
        this.tableBody.innerHTML = '';
        
        if (data.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">查無相關檢驗紀錄</td></tr>`;
            this.pageInfo.innerText = `顯示 0 至 0 筆，共 0 筆`;
            this.pagination.innerHTML = '';
            return;
        }

        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, data.length);
        const pageData = data.slice(startIndex, endIndex);

        pageData.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.date || ''}</td>
                <td>${item.time || ''}</td>
                <td><strong>${item.order_number || ''}</strong></td>
                <td>${item.operator || ''}</td>
                <td>${item.product_name || ''}</td>
                <td>
                    <small class="text-danger d-block">${item.defect_classification || ''}</small>
                    <span class="badge ${item.defect_status ? 'bg-warning text-dark' : 'bg-success'}">
                        ${item.defect_status || '正常'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="controller.openEditModal(${item.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="controller.handleDelete(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            this.tableBody.appendChild(tr);
        });

        this.pageInfo.innerText = `顯示 ${startIndex + 1} 至 ${endIndex} 筆，共 ${data.length} 筆`;
        this.renderPagination('pagination', data.length, page, limit, 'controller.changePage');
    }

    // 緊湊型無縫邊框分頁渲染器
    renderPagination(elementId, totalItems, currentPage, limit, onClickFuncName) {
        const el = document.getElementById(elementId);
        el.innerHTML = '';
        const totalPages = Math.ceil(totalItems / limit);
        if (totalPages <= 1) return;

        let html = `<div class="compact-pagination">`;

        // 上一頁
        if (currentPage === 1) {
            html += `<span class="page-btn disabled">上一頁</span>`;
        } else {
            html += `<a class="page-btn" href="#" onclick="event.preventDefault(); ${onClickFuncName}(${currentPage - 1})">上一頁</a>`;
        }

        // 動態計算顯示頁碼範圍 (最多顯示當前頁面鄰近的頁碼)
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, startPage + 2);
        if (endPage - startPage < 2) {
            startPage = Math.max(1, endPage - 2);
        }

        for (let i = startPage; i <= endPage; i++) {
            if (currentPage === i) {
                html += `<span class="page-btn active">${i}</span>`;
            } else {
                html += `<a class="page-btn" href="#" onclick="event.preventDefault(); ${onClickFuncName}(${i})">${i}</a>`;
            }
        }

        // 下一頁
        if (currentPage === totalPages) {
            html += `<span class="page-btn disabled">下一頁</span>`;
        } else {
            html += `<a class="page-btn" href="#" onclick="event.preventDefault(); ${onClickFuncName}(${currentPage + 1})">下一頁</a>`;
        }

        html += `</div>`;
        el.innerHTML = html;
    }

    updateSelectOptions(elementId, list, valueField, textField, defaultVal = '') {
        const select = document.getElementById(elementId);
        select.innerHTML = '<option value="">-- 請選擇 --</option>';
        list.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[valueField];
            opt.textContent = item[textField];
            if (String(item[valueField]) === String(defaultVal)) opt.selected = true;
            select.appendChild(opt);
        });
    }

    renderAutocomplete(list) {
        const container = document.getElementById('autocomplete-list');
        container.innerHTML = '';
        if (list.length === 0) {
            container.style.display = 'none';
            return;
        }
        list.forEach(item => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.innerHTML = `<strong>${item.order_number}</strong> <span class="text-muted ms-2">(${item.product_name || '無品名'})</span>`;
            div.onclick = () => {
                controller.selectOrderAutocomplete(item);
                container.style.display = 'none';
            };
            container.appendChild(div);
        });
        container.style.display = 'block';
    }

    setFormData(data = {}) {
        this.form.reset();
        document.getElementById('field_id').value = data.id || '';
        document.getElementById('field_date').value = data.date || new Date().toISOString().split('T')[0];
        document.getElementById('field_time').value = data.time || new Date().toTimeString().slice(0, 5);
        document.getElementById('field_order_number').value = data.order_number || '';
        document.getElementById('field_draw_ver').value = data.draw_ver || '';
        document.getElementById('field_product_number').value = data.product_number || '';
        document.getElementById('field_product_name').value = data.product_name || '';
        document.getElementById('field_spec').value = data.spec || '';
        document.getElementById('field_quantity').value = data.quantity || 0;
        document.getElementById('field_inspector').value = data.inspector || '';
        
        document.getElementById('field_defect_classification').value = data.defect_classification || '';
        document.getElementById('field_defect_status').value = data.defect_status || '';
        document.getElementById('field_handling_measures').value = data.handling_measures || '';
        
        document.getElementById('field_remark').value = data.remark || '';
    }

    getFormData() {
        return {
            id: document.getElementById('field_id').value,
            date: document.getElementById('field_date').value,
            time: document.getElementById('field_time').value,
            order_number: document.getElementById('field_order_number').value,
            operator: document.getElementById('field_operator').value,
            draw_ver: document.getElementById('field_draw_ver').value,
            product_number: document.getElementById('field_product_number').value,
            product_name: document.getElementById('field_product_name').value,
            spec: document.getElementById('field_spec').value,
            quantity: parseInt(document.getElementById('field_quantity').value) || 0,
            inspector: document.getElementById('field_inspector').value,
            
            defect_classification: document.getElementById('field_defect_classification').value,
            defect_status: document.getElementById('field_defect_status').value,
            handling_measures: document.getElementById('field_handling_measures').value,
            
            remark: document.getElementById('field_remark').value
        };
    }

    renderSubModal(tableConfig, data, page = 1, limit = 5) {
        document.getElementById('subCrudModalLabel').innerText = `${tableConfig.title} 獨立維護管理`;
        this.subTableHead.innerHTML = `<tr>${tableConfig.columns.map(col => `<th>${col.label}</th>`).join('')}<th style="width:100px;">操作</th></tr>`;
        this.subTableBody.innerHTML = '';
        
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, data.length);
        const pageData = data.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            this.subTableBody.innerHTML = `<tr><td colspan="${tableConfig.columns.length + 1}" class="text-center text-muted py-3">目前無主檔參考紀錄</td></tr>`;
        } else {
            pageData.forEach(item => {
                const tr = document.createElement('tr');
                let tdHtml = tableConfig.columns.map(col => `<td>${item[col.field] ?? ''}</td>`).join('');
                tdHtml += `
                    <td>
                        <button class="btn btn-xs btn-outline-primary py-0 px-1 me-1" onclick="controller.openSubEdit(${item.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-xs btn-outline-danger py-0 px-1" onclick="controller.handleSubDelete(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tr.innerHTML = tdHtml;
                this.subTableBody.appendChild(tr);
            });
        }

        this.subPageInfo.innerText = `顯示 ${startIndex + 1} 至 ${endIndex} 筆，共 ${data.length} 筆`;
        this.renderPagination('subPagination', data.length, page, limit, 'controller.changeSubPage');
        this.renderSubForm(tableConfig);
    }

    renderSubForm(tableConfig, editData = {}) {
        this.subFormFields.innerHTML = `<input type="hidden" id="sub_id" value="${editData.id || ''}">`;
        tableConfig.columns.forEach(col => {
            const value = editData[col.field] ?? '';
            this.subFormFields.innerHTML += `
                <div class="col-md-12 mb-3">
                    <label class="form-label small">${col.label}</label>
                    <input type="text" id="sub_${col.field}" class="form-control" value="${value}" required>
                </div>
            `;
        });
    }

    getSubFormData(columns) {
        const data = { id: document.getElementById('sub_id').value };
        columns.forEach(col => {
            data[col.field] = document.getElementById(`sub_${col.field}`).value;
        });
        return data;
    }
}