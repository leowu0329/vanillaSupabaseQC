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
            this.tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">查無相關檢驗紀錄</td></tr>`;
            this.pageInfo.innerText = `顯示 0 至 0 筆，共 0 筆`;
            this.pagination.innerHTML = '';
            return;
        }

        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, data.length);
        const pageData = data.slice(startIndex, endIndex);

        pageData.forEach(item => {
            // 🌟 建立容器元素 (使用 table-row-group 以利相容 Bootstrap 隱顯)
            const rowGroup = document.createElement('div');
            rowGroup.className = 'd-contents'; 

            // A. PC/平版寬螢幕模式 (桌面顯示為標準 Table 行)
            const trDesktop = document.createElement('tr');
            trDesktop.className = 'd-none d-md-table-row';
            trDesktop.innerHTML = `
                <td>
                    <span class="text-dark">${item.date || ''}</span><br>
                    <small class="text-muted">${item.time || ''}</small>
                </td>
                <td><strong>${item.order_number || ''}</strong></td>
                <td>
                    <div class="fw-bold text-secondary" style="font-size: 0.9rem;">${item.product_number || ''}</div>
                    <div class="text-dark my-1">${item.product_name || ''}</div>
                    <div class="text-muted small" style="font-size: 0.85rem;">${item.spec || ''}</div>
                </td>
                <td>
                    <small class="text-danger d-block fw-bold">${item.defect_classification || ''}</small>
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

            // B. 手機行動裝置模式 (自動轉化為垂直精緻 Card，包在一個特製 Tr 內填滿寬度)
            const trMobile = document.createElement('tr');
            trMobile.className = 'd-md-none';
            trMobile.innerHTML = `
                <td colspan="5" class="p-2 border-0">
                    <div class="card shadow-sm border-start border-3 border-primary mb-2">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                <span class="badge bg-light text-dark border"><i class="fa-regular fa-calendar me-1"></i>${item.date || ''} ${item.time || ''}</span>
                                <span class="badge ${item.defect_status ? 'bg-warning text-dark' : 'bg-success'}">${item.defect_status || '正常'}</span>
                            </div>
                            <div class="mb-1"><small class="text-muted">工單號碼：</small><strong>${item.order_number || ''}</strong></div>
                            <div class="mb-1"><small class="text-muted">產品料號：</small><span class="text-secondary">${item.product_number || ''}</span></div>
                            <div class="mb-2"><small class="text-muted">品名規格：</small><span class="text-dark fw-bold">${item.product_name || ''}</span> <small class="text-muted">(${item.spec || ''})</small></div>
                            ${item.defect_classification ? `<div class="mb-2"><small class="text-muted text-danger">不良分類：</small><span class="text-danger fw-bold">${item.defect_classification}</span></div>` : ''}
                            <div class="d-flex justify-content-end border-top pt-2 mt-2">
                                <button class="btn btn-sm btn-primary me-2 px-3" onclick="controller.openEditModal(${item.id})"><i class="fa-solid fa-pen me-1"></i>編輯</button>
                                <button class="btn btn-sm btn-danger px-3" onclick="controller.handleDelete(${item.id})"><i class="fa-solid fa-trash me-1"></i>刪除</button>
                            </div>
                        </div>
                    </div>
                </td>
            `;

            rowGroup.appendChild(trDesktop);
            rowGroup.appendChild(trMobile);
            this.tableBody.appendChild(rowGroup);
        });

        this.pageInfo.innerText = `顯示 ${startIndex + 1} 至 ${endIndex} 筆，共 ${data.length} 筆`;
        this.renderPagination('pagination', data.length, page, limit, 'controller.changePage');
    }

    renderPagination(elementId, totalItems, currentPage, limit, onClickFuncName) {
        const el = document.getElementById(elementId);
        el.innerHTML = '';
        const totalPages = Math.ceil(totalItems / limit);
        if (totalPages <= 1) return;

        let html = `<div class="compact-pagination my-2">`;

        if (currentPage === 1) {
            html += `<span class="page-btn disabled">上一頁</span>`;
        } else {
            html += `<a class="page-btn" href="#" onclick="event.preventDefault(); ${onClickFuncName}(${currentPage - 1})">上一頁</a>`;
        }

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
                <div class="col-12 mb-3">
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