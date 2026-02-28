  // ============================================================
  // TOVI & MOLLY — Google Apps Script
  // File: Code.gs
  // Gắn vào: Google Sheet "Tovi Molly Catalog"
  // ============================================================

  const SHEET_CATALOG = SpreadsheetApp.getActiveSpreadsheet();
  const TAB_PRODUCTS   = 'products';
  const TAB_CATS       = 'categories';
  const TAB_CAMPAIGNS  = 'campaigns';
  const TAB_ENTRY      = '_entry';

  // Header của tab products — phải khớp đúng thứ tự
  const PRODUCT_HEADERS = [
    'id','name','brand','category','price','original_price',
    'description','badge','is_new','is_hot','in_stock','emoji',
    'images','variants','specs'
  ];

  // ─── WEB APP ENTRY POINT ────────────────────────────────────
  function doPost(e) {
    try {
      const data = JSON.parse(e.postData.contents);
      const action = data.action;

      if (action === 'save_product')   return respond(saveProduct(data.payload));
      if (action === 'delete_product') return respond(deleteProduct(data.id));
      if (action === 'save_order')     return respond(saveOrder(data.payload));

      return respond({ ok: false, error: 'Unknown action' });
    } catch(err) {
      return respond({ ok: false, error: err.message });
    }
  }

  function doGet(e) {
    const action = e.parameter.action;
    if (action === 'search') return respond(searchProducts(e.parameter.q));
    if (action === 'get')    return respond(getProduct(e.parameter.id));
    return respond({ ok: true, msg: 'Tovi & Molly API running' });
  }

  function respond(data) {
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ─── PRODUCT: SAVE (INSERT or UPDATE) ───────────────────────
  function saveProduct(p) {
    const sheet = getOrCreateSheet(TAB_PRODUCTS, PRODUCT_HEADERS);
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idCol = headers.indexOf('id');

    // Tìm dòng có ID trùng
    let targetRow = -1;
    for (let i = 1; i < allData.length; i++) {
      if (String(allData[i][idCol]) === String(p.id)) {
        targetRow = i + 1; // 1-indexed
        break;
      }
    }

    // Build row array đúng thứ tự header
    const row = PRODUCT_HEADERS.map(h => {
      const v = p[h];
      if (v === undefined || v === null) return '';
      if (Array.isArray(v)) return v.join('\n'); // images, variants, specs
      return v;
    });

    if (targetRow > 0) {
      // UPDATE
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
      return { ok: true, action: 'updated', id: p.id };
    } else {
      // INSERT — append
      sheet.appendRow(row);
      return { ok: true, action: 'inserted', id: p.id };
    }
  }

  // ─── PRODUCT: DELETE ────────────────────────────────────────
  function deleteProduct(id) {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_PRODUCTS);
    if (!sheet) return { ok: false, error: 'Sheet not found' };

    const data = sheet.getDataRange().getValues();
    const idCol = data[0].indexOf('id');

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { ok: true, deleted: id };
      }
    }
    return { ok: false, error: 'Product not found' };
  }

  // ─── PRODUCT: SEARCH ────────────────────────────────────────
  function searchProducts(q) {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_PRODUCTS);
    if (!sheet) return { ok: true, results: [] };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol   = headers.indexOf('id');
    const nameCol = headers.indexOf('name');

    if (!q || q.trim() === '') return { ok: true, results: [] };

    const query = q.toLowerCase().trim();
    const results = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const id   = String(row[idCol] || '').toLowerCase();
      const name = String(row[nameCol] || '').toLowerCase();
      if (id.includes(query) || name.includes(query)) {
        results.push({ id: row[idCol], name: row[nameCol] });
        if (results.length >= 10) break;
      }
    }

    return { ok: true, results };
  }

  // ─── PRODUCT: GET BY ID ─────────────────────────────────────
  function getProduct(id) {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_PRODUCTS);
    if (!sheet) return { ok: false, error: 'Sheet not found' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('id');

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = data[i][idx]; });
        return { ok: true, product: obj };
      }
    }
    return { ok: false, error: 'Not found' };
  }

  // ─── ORDER: SAVE ────────────────────────────────────────────
  function saveOrder(order) {
    const ss = SpreadsheetApp.openById(ORDER_SHEET_ID); // set bên dưới
    const now = new Date();
    const tabName = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyy-MM');

    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      const hdr = ['Thời gian','ID đơn','Tên KH','SĐT','Địa chỉ','Sản phẩm','Tổng tiền','Ghi chú','Trạng thái'];
      sheet.appendRow(hdr);
      sheet.getRange(1,1,1,hdr.length).setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    const orderId = 'ORD' + Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyyMMddHHmmss');
    const items = (order.items || []).map(i => `${i.name} ×${i.qty}`).join('; ');

    sheet.appendRow([
      Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'),
      orderId,
      order.name || '',
      order.phone || '',
      order.address || '',
      items,
      order.total || 0,
      order.note || '',
      'Mới'
    ]);

    return { ok: true, orderId };
  }

  // ─── GENERATE ID ────────────────────────────────────────────
  // Gọi từ entry form: tạo ID mới dạng SP001, SP002...
  function generateId() {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_PRODUCTS);
    if (!sheet) return 'SP001';

    const data = sheet.getDataRange().getValues();
    const idCol = data[0].indexOf('id');
    let maxNum = 0;

    for (let i = 1; i < data.length; i++) {
      const id = String(data[i][idCol] || '');
      const match = id.match(/^SP(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    }

    const next = maxNum + 1;
    return 'SP' + String(next).padStart(3, '0');
  }

  // ─── INIT SHEETS ────────────────────────────────────────────
  function setupSheets() {
    // Tạo tất cả tab cần thiết nếu chưa có
    getOrCreateSheet(TAB_PRODUCTS, PRODUCT_HEADERS);
    getOrCreateSheet(TAB_CATS, ['id','name','icon','count']);
    getOrCreateSheet(TAB_CAMPAIGNS, ['id','type','tag','title','description','btn_text','bg_color','active','sort_order']);

    // Tab _entry — tạo layout form
    setupEntrySheet();

    SpreadsheetApp.getUi().alert('✅ Đã tạo xong cấu trúc sheet!');
  }

  function getOrCreateSheet(name, headers) {
    let sheet = SHEET_CATALOG.getSheetByName(name);
    if (!sheet) {
      sheet = SHEET_CATALOG.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#111111')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    return sheet;
  }

  // ─── SETUP ENTRY SHEET ──────────────────────────────────────
  function setupEntrySheet() {
    let sheet = SHEET_CATALOG.getSheetByName(TAB_ENTRY);
    if (sheet) SHEET_CATALOG.deleteSheet(sheet);
    sheet = SHEET_CATALOG.insertSheet(TAB_ENTRY);

    // Tắt gridlines cho đẹp
    sheet.setHiddenGridlines(true);

    // Thiết lập độ rộng cột
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 280);
    sheet.setColumnWidth(3, 30);
    sheet.setColumnWidth(4, 160);
    sheet.setColumnWidth(5, 280);

    // Header
    const titleRange = sheet.getRange('A1:E1');
    titleRange.merge().setValue('🐾 TOVI & MOLLY — QUẢN LÝ SẢN PHẨM')
      .setBackground('#111111').setFontColor('#ffffff')
      .setFontSize(14).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    sheet.setRowHeight(1, 44);

    // Search bar label
    sheet.getRange('A2').setValue('🔍 Tìm sản phẩm (ID hoặc tên):')
      .setFontWeight('bold').setFontSize(11).setBackground('#f4f4f4');
    sheet.getRange('B2').setValue('')
      .setBackground('#ffffff').setBorder(true,true,true,true,false,false,'#cccccc', SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange('C2:E2').merge().setValue('→ Nhập tên/ID rồi chạy: Extensions > Macros > Tìm sản phẩm')
      .setFontColor('#999999').setFontSize(10).setBackground('#f4f4f4');
    sheet.setRowHeight(2, 32);

    // Kết quả search
    sheet.getRange('A3').setValue('Kết quả tìm kiếm:').setFontWeight('bold').setFontSize(10).setBackground('#f4f4f4');
    sheet.getRange('B3:E3').merge().setValue('')
      .setBackground('#fffdf0').setFontColor('#666');
    sheet.setRowHeight(3, 28);

    // Divider
    sheet.getRange('A4:E4').merge().setBackground('#e8e8e8').setValue('').setRowHeight = 8;
    sheet.setRowHeight(4, 8);

    // Section: Thông tin cơ bản
    sheet.getRange('A5:B5').merge().setValue('📋 THÔNG TIN CƠ BẢN')
      .setBackground('#333').setFontColor('#fff').setFontWeight('bold').setFontSize(11)
      .setHorizontalAlignment('center');
    sheet.getRange('D5:E5').merge().setValue('🖼️ ẢNH & BIẾN THỂ')
      .setBackground('#333').setFontColor('#fff').setFontWeight('bold').setFontSize(11)
      .setHorizontalAlignment('center');
    sheet.setRowHeight(5, 30);

    // Fields - cột trái
    const leftFields = [
      ['ID', '(tự động sinh)', '#fff3cd'],
      ['Tên sản phẩm', '', '#ffffff'],
      ['Thương hiệu (Brand)', '', '#ffffff'],
      ['Danh mục (category id)', '', '#ffffff'],
      ['Giá bán (VNĐ)', '', '#ffffff'],
      ['Giá gốc (VNĐ, 0=không giảm)', '', '#ffffff'],
      ['Badge (sale/new/hot/trống)', '', '#ffffff'],
      ['Là sản phẩm mới? (true/false)', 'false', '#ffffff'],
      ['Là sản phẩm hot? (true/false)', 'false', '#ffffff'],
      ['Còn hàng? (true/false)', 'true', '#ffffff'],
      ['Emoji (fallback icon)', '📦', '#ffffff'],
    ];

    leftFields.forEach(([label, val, bg], i) => {
      const row = 6 + i;
      sheet.getRange(row, 1).setValue(label)
        .setBackground('#f4f4f4').setFontSize(10).setFontColor('#333')
        .setBorder(false,false,true,false,false,false,'#e8e8e8',SpreadsheetApp.BorderStyle.SOLID);
      sheet.getRange(row, 2).setValue(val).setBackground(bg).setFontSize(11)
        .setBorder(false,false,true,true,false,false,'#e8e8e8',SpreadsheetApp.BorderStyle.SOLID);
      sheet.setRowHeight(row, 28);
    });

    // Mô tả (tall row)
    const descRow = 17;
    sheet.getRange(descRow, 1).setValue('Mô tả sản phẩm')
      .setBackground('#f4f4f4').setFontSize(10).setFontColor('#333')
      .setVerticalAlignment('top');
    sheet.getRange(descRow, 2).setValue('')
      .setBackground('#ffffff').setVerticalAlignment('top').setWrap(true);
    sheet.setRowHeight(descRow, 80);

    // Fields - cột phải: Ảnh
    sheet.getRange('D6:E6').merge().setValue('URL Ảnh 1 (chính)')
      .setBackground('#f4f4f4').setFontSize(10).setFontColor('#666');
    sheet.getRange('D7:E7').merge().setValue('')
      .setBackground('#ffffff').setBorder(true,true,true,true,false,false,'#e8e8e8',SpreadsheetApp.BorderStyle.SOLID);

    for (let i = 2; i <= 5; i++) {
      const r = 6 + (i * 2) - 2;
      sheet.getRange(r, 4, 1, 2).merge().setValue(`URL Ảnh ${i}`)
        .setBackground('#f4f4f4').setFontSize(10).setFontColor('#666');
      sheet.getRange(r+1, 4, 1, 2).merge().setValue('')
        .setBackground('#ffffff').setBorder(true,true,true,true,false,false,'#e8e8e8',SpreadsheetApp.BorderStyle.SOLID);
    }
    // Rows 6-15 cho ảnh = row 6,7,8,9,10,11,12,13,14,15

    // Variants
    sheet.getRange('D16:E16').merge().setValue('─── BIẾN THỂ (Variants) ───')
      .setBackground('#555').setFontColor('#fff').setFontSize(10)
      .setHorizontalAlignment('center');
    sheet.setRowHeight(16, 24);

    const varHints = [
      'Loại 1 (vd: Màu sắc)', 'Giá trị 1 (vd: Xanh, Hồng, Trắng)',
      'Loại 2 (vd: Size)', 'Giá trị 2 (vd: S, M, L, XL)',
      'Loại 3 (vd: Dung tích)', 'Giá trị 3 (vd: 150ml, 240ml)',
    ];
    for (let i = 0; i < 6; i++) {
      const r = 17 + i;
      const isLabel = i % 2 === 0;
      sheet.getRange(r, 4).setValue(varHints[i])
        .setBackground('#f4f4f4').setFontSize(10).setFontColor('#666').setFontStyle('italic');
      sheet.getRange(r, 5).setValue('')
        .setBackground(isLabel ? '#fff' : '#f9f9f9')
        .setBorder(true,true,true,true,false,false,'#e8e8e8',SpreadsheetApp.BorderStyle.SOLID);
      sheet.setRowHeight(r, 26);
    }

    // Specs
    sheet.getRange('D23:E23').merge().setValue('─── THÔNG SỐ KỸ THUẬT (Specs) ───')
      .setBackground('#555').setFontColor('#fff').setFontSize(10)
      .setHorizontalAlignment('center');
    sheet.setRowHeight(23, 24);

    const specHints = ['Chất liệu','Dung tích / Kích thước','Xuất xứ','Độ tuổi phù hợp','Bảo hành','Ghi chú thêm'];
    for (let i = 0; i < 6; i++) {
      const r = 24 + i;
      sheet.getRange(r, 4).setValue(specHints[i])
        .setBackground('#f4f4f4').setFontSize(10).setFontColor('#666');
      sheet.getRange(r, 5).setValue('')
        .setBackground('#ffffff')
        .setBorder(true,true,true,true,false,false,'#e8e8e8',SpreadsheetApp.BorderStyle.SOLID);
      sheet.setRowHeight(r, 26);
    }

    // Action buttons row
    const btnRow = 30;
    sheet.getRange('A30:E30').merge().setBackground('#f4f4f4').setValue('').setRowHeight = 8;
    sheet.setRowHeight(30, 12);

    // Hướng dẫn nút
    sheet.getRange('A31:E31').merge()
      .setValue('▶ Chạy macro từ menu:  Extensions → Macros →  💾 Lưu sản phẩm  |  🗑️ Xóa sản phẩm  |  ✨ Tạo ID mới  |  🔍 Tìm sản phẩm')
      .setBackground('#111').setFontColor('#fff').setFontSize(10)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    sheet.setRowHeight(31, 36);

    // Note cuối
    sheet.getRange('A32:E32').merge()
      .setValue('💡 Tip: Mỗi URL ảnh 1 dòng riêng. Variant: Loại ở cột D, giá trị ở cột E. Spec: tên ở D, giá trị ở E.')
      .setFontColor('#999').setFontSize(9).setBackground('#fafafa')
      .setHorizontalAlignment('center');
    sheet.setRowHeight(32, 24);

    return sheet;
  }

  // ─── MACRO: TẠO ID MỚI ─────────────────────────────────────
  function macroNewId() {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_ENTRY);
    const newId = generateId();
    sheet.getRange('B6').setValue(newId);
    // Clear toàn bộ form (giữ ID mới)
    clearForm(sheet, newId);
    SpreadsheetApp.getUi().toast(`✨ ID mới: ${newId} — Form đã reset, sẵn sàng nhập!`);
  }

  // ─── MACRO: TÌM SẢN PHẨM ───────────────────────────────────
  function macroSearch() {
    const entrySheet = SHEET_CATALOG.getSheetByName(TAB_ENTRY);
    const q = String(entrySheet.getRange('B2').getValue()).trim();

    if (!q) {
      SpreadsheetApp.getUi().alert('Vui lòng nhập tên hoặc ID vào ô B2 trước.');
      return;
    }

    const result = searchProducts(q);
    if (!result.results.length) {
      entrySheet.getRange('B3').setValue('Không tìm thấy sản phẩm nào.');
      return;
    }

    // Hiển thị kết quả
    const summary = result.results.map(r => `${r.id}: ${r.name}`).join('  |  ');
    entrySheet.getRange('B3').setValue(summary);

    if (result.results.length === 1) {
      // Chỉ 1 kết quả → load ngay
      loadProductToForm(result.results[0].id);
    } else {
      // Nhiều kết quả → hỏi chọn
      const ui = SpreadsheetApp.getUi();
      const choices = result.results.map((r, i) => `${i+1}. ${r.id} — ${r.name}`).join('\n');
      const response = ui.prompt(
        `Tìm thấy ${result.results.length} sản phẩm. Nhập số thứ tự để chọn:`,
        choices,
        ui.ButtonSet.OK_CANCEL
      );
      if (response.getSelectedButton() === ui.Button.OK) {
        const idx = parseInt(response.getResponseText()) - 1;
        if (idx >= 0 && idx < result.results.length) {
          loadProductToForm(result.results[idx].id);
        }
      }
    }
  }

  // ─── LOAD SẢN PHẨM VÀO FORM ────────────────────────────────
  function loadProductToForm(id) {
    const result = getProduct(id);
    if (!result.ok) {
      SpreadsheetApp.getUi().alert('Không tìm thấy sản phẩm: ' + id);
      return;
    }

    const p = result.product;
    const sheet = SHEET_CATALOG.getSheetByName(TAB_ENTRY);

    // Thông tin cơ bản
    sheet.getRange('B6').setValue(p.id);
    sheet.getRange('B7').setValue(p.name);
    sheet.getRange('B8').setValue(p.brand);
    sheet.getRange('B9').setValue(p.category);
    sheet.getRange('B10').setValue(p.price);
    sheet.getRange('B11').setValue(p.original_price);
    sheet.getRange('B12').setValue(p.badge);
    sheet.getRange('B13').setValue(p.is_new);
    sheet.getRange('B14').setValue(p.is_hot);
    sheet.getRange('B15').setValue(p.in_stock);
    sheet.getRange('B16').setValue(p.emoji);
    sheet.getRange('B17').setValue(p.description);

    // Ảnh — split by newline
    const imgs = String(p.images || '').split('\n').filter(Boolean);
    const imgRows = [7, 9, 11, 13, 15];
    imgRows.forEach((r, i) => {
      sheet.getRange(r, 5, 1, 2).merge().setValue(imgs[i] || '');
    });

    // Variants — "Màu sắc\nXanh, Hồng\nSize\nS, M, L"
    const varLines = String(p.variants || '').split('\n').filter(Boolean);
    // Mỗi variant = 2 dòng: tên loại + giá trị
    for (let i = 0; i < 3; i++) {
      sheet.getRange(17 + i*2, 5).setValue(varLines[i*2] || '');
      sheet.getRange(18 + i*2, 5).setValue(varLines[i*2+1] || '');
    }

    // Specs — "Chất liệu: PPSU\nXuất xứ: HQ"
    const specLines = String(p.specs || '').split('\n').filter(Boolean);
    for (let i = 0; i < 6; i++) {
      const parts = (specLines[i] || '').split(':');
      // Ghi vào cột D (label) và E (value)
      sheet.getRange(24 + i, 4).setValue(parts[0] ? parts[0].trim() : (specLines[i] ? '' : ['Chất liệu','Dung tích / Kích thước','Xuất xứ','Độ tuổi phù hợp','Bảo hành','Ghi chú thêm'][i]));
      sheet.getRange(24 + i, 5).setValue(parts[1] ? parts[1].trim() : '');
    }

    SpreadsheetApp.getUi().toast(`✅ Đã load: ${p.name}`);
  }

  // ─── MACRO: LƯU SẢN PHẨM ───────────────────────────────────
  function macroSave() {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_ENTRY);
    const ui = SpreadsheetApp.getUi();

    const id = String(sheet.getRange('B6').getValue()).trim();
    if (!id) {
      ui.alert('Vui lòng tạo ID mới hoặc tải sản phẩm cần sửa trước.');
      return;
    }

    // Đọc ảnh
    const imgRows = [7, 9, 11, 13, 15];
    const images = imgRows.map(r => String(sheet.getRange(r, 5).getValue()).trim()).filter(Boolean);

    // Đọc variants → format: "Loại\nGiá trị\nLoại2\nGiá trị2"
    const varParts = [];
    for (let i = 0; i < 3; i++) {
      const type = String(sheet.getRange(17 + i*2, 5).getValue()).trim();
      const vals = String(sheet.getRange(18 + i*2, 5).getValue()).trim();
      if (type && vals) { varParts.push(type); varParts.push(vals); }
    }

    // Đọc specs → format: "Label: Value"
    const specParts = [];
    for (let i = 0; i < 6; i++) {
      const label = String(sheet.getRange(24 + i, 4).getValue()).trim();
      const val   = String(sheet.getRange(24 + i, 5).getValue()).trim();
      if (label && val) specParts.push(`${label}: ${val}`);
    }

    const payload = {
      id:             id,
      name:           String(sheet.getRange('B7').getValue()).trim(),
      brand:          String(sheet.getRange('B8').getValue()).trim(),
      category:       String(sheet.getRange('B9').getValue()).trim(),
      price:          Number(sheet.getRange('B10').getValue()) || 0,
      original_price: Number(sheet.getRange('B11').getValue()) || 0,
      badge:          String(sheet.getRange('B12').getValue()).trim(),
      is_new:         String(sheet.getRange('B13').getValue()).trim(),
      is_hot:         String(sheet.getRange('B14').getValue()).trim(),
      in_stock:       String(sheet.getRange('B15').getValue()).trim(),
      emoji:          String(sheet.getRange('B16').getValue()).trim(),
      description:    String(sheet.getRange('B17').getValue()).trim(),
      images:         images.join('\n'),
      variants:       varParts.join('\n'),
      specs:          specParts.join('\n'),
    };

    if (!payload.name) {
      ui.alert('Tên sản phẩm không được để trống.');
      return;
    }

    const result = saveProduct(payload);
    if (result.ok) {
      ui.toast(`✅ ${result.action === 'inserted' ? 'Đã thêm' : 'Đã cập nhật'}: ${payload.name} (${id})`);
    } else {
      ui.alert('Lỗi: ' + result.error);
    }
  }

  // ─── MACRO: XÓA SẢN PHẨM ───────────────────────────────────
  function macroDelete() {
    const sheet = SHEET_CATALOG.getSheetByName(TAB_ENTRY);
    const ui = SpreadsheetApp.getUi();
    const id = String(sheet.getRange('B6').getValue()).trim();

    if (!id) { ui.alert('Chưa có sản phẩm nào được chọn.'); return; }

    const name = String(sheet.getRange('B7').getValue()).trim();
    const confirm = ui.alert(
      `Xác nhận xóa?`,
      `Bạn có chắc muốn xóa:\n${id} — ${name}`,
      ui.ButtonSet.YES_NO
    );

    if (confirm === ui.Button.YES) {
      const result = deleteProduct(id);
      if (result.ok) {
        clearForm(sheet, '');
        ui.toast(`🗑️ Đã xóa: ${name}`);
      } else {
        ui.alert('Lỗi: ' + result.error);
      }
    }
  }

  // ─── HELPER: CLEAR FORM ────────────────────────────────────
  function clearForm(sheet, keepId) {
    sheet.getRange('B6').setValue(keepId);
    ['B7','B8','B9','B10','B11','B12','B17'].forEach(r => sheet.getRange(r).setValue(''));
    sheet.getRange('B13').setValue('false');
    sheet.getRange('B14').setValue('false');
    sheet.getRange('B15').setValue('true');
    sheet.getRange('B16').setValue('📦');
    [7,9,11,13,15].forEach(r => sheet.getRange(r, 5, 1, 2).merge().setValue(''));
    for (let i = 0; i < 3; i++) {
      sheet.getRange(17 + i*2, 5).setValue('');
      sheet.getRange(18 + i*2, 5).setValue('');
    }
    for (let i = 0; i < 6; i++) sheet.getRange(24 + i, 5).setValue('');
  }

  // ─── MENU ───────────────────────────────────────────────────
  function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('🐾 Tovi & Molly')
      .addItem('⚙️ Khởi tạo / Reset Sheet', 'setupSheets')
      .addSeparator()
      .addItem('✨ Tạo ID mới (form trống)', 'macroNewId')
      .addItem('🔍 Tìm sản phẩm', 'macroSearch')
      .addSeparator()
      .addItem('💾 Lưu sản phẩm', 'macroSave')
      .addItem('🗑️ Xóa sản phẩm', 'macroDelete')
      .addToUi();
  }

  // ─── CONFIG ─────────────────────────────────────────────────
  // Thay bằng ID của Google Sheet "Tovi Molly Orders"
  const ORDER_SHEET_ID = 'YOUR_ORDER_SHEET_ID_HERE';
