// ============================================================
// TOVI & MOLLY — Google Apps Script
// File: Code.gs
// Gắn vào: Google Sheet "Tovi Molly Catalog"
// ============================================================

const SHEET_CATALOG = SpreadsheetApp.getActiveSpreadsheet();
const TAB_PRODUCTS   = 'products';
const TAB_CATS       = 'categories';
const TAB_CAMPAIGNS  = 'campaigns';
const TAB_TYPOGRAPHY = 'typography_settings';
const TAB_ENTRY      = '_entry';

// Thứ tự từ trên xuống dưới theo giao diện website.
// Các giá trị default chỉ dùng để người quản lý tham khảo; website vẫn giữ
// default thật trong HTML và chỉ ghi đè khi cột setting tương ứng có dữ liệu.
const TYPOGRAPHY_ROWS = [
  [1,  'topbar',             '01. Thanh thông báo',       'Dòng miễn phí vận chuyển / hotline',        13, 13, 'Thông tin nhỏ trên cùng trang'],
  [2,  'brand_name',          '02. Header thương hiệu',    'Tên “Tovi And Molly”',                      20, 20, 'Brand chính cạnh logo'],
  [3,  'brand_subtitle',      '02. Header thương hiệu',    'Dòng “Việt Nam”',                           12, 12, 'Brand phụ bên dưới tên'],
  [4,  'search_input',        '02. Header thương hiệu',    'Chữ trong ô tìm kiếm',                      14, 14, 'Ô tìm kiếm desktop'],
  [5,  'main_menu',           '03. Menu danh mục',         'Tất cả, Bình sữa, Núm ti, Phụ kiện…',       14, 14, 'Menu ngang ngay dưới header'],
  [6,  'banner_tag',          '04. Banner',                'Tag nhỏ phía trên banner',                   12, 12, 'Ví dụ: Bộ sưu tập mới'],
  [7,  'banner_title',        '04. Banner',                'Tiêu đề lớn của banner',                    48, 34, 'Cột title trong campaigns'],
  [8,  'banner_description',  '04. Banner',                'Mô tả của banner',                           15, 15, 'Cột description trong campaigns'],
  [9,  'banner_button',       '04. Banner',                'Nút hành động của banner',                   14, 14, 'Cột btn_text trong campaigns'],
  [10, 'benefit_title',       '05. Quyền lợi mua hàng',    'Giao hàng toàn quốc, Chính hãng…',           14, 14, 'Dòng chính'],
  [11, 'benefit_description', '05. Quyền lợi mua hàng',    'Miễn phí từ 499K, Cam kết bảo đảm…',         13, 13, 'Dòng mô tả nhỏ'],
  [12, 'section_title',       '06. Tiêu đề khu vực',       'Danh mục, Sản phẩm',                         30, 24, 'Tiêu đề section'],
  [13, 'section_link',        '06. Tiêu đề khu vực',       'Xem tất cả',                                 13, 13, 'Liên kết bên phải tiêu đề'],
  [14, 'category_name',       '07. Danh mục dạng thẻ',     'Tên danh mục trong thẻ',                     14, 14, 'Ví dụ: Bình sữa'],
  [15, 'category_count',      '07. Danh mục dạng thẻ',     'Số lượng sản phẩm',                          13, 13, 'Con số bên dưới danh mục'],
  [16, 'filter_button',       '08. Bộ lọc sản phẩm',       'Tất cả, Đang giảm, Mới nhất, Bán chạy',      14, 14, 'Các nút lọc'],
  [17, 'sort_select',         '08. Bộ lọc sản phẩm',       'Mặc định / Giá tăng dần…',                   14, 14, 'Danh sách sắp xếp'],
  [18, 'result_count',        '08. Bộ lọc sản phẩm',       'Dòng tổng số sản phẩm',                      13, 13, 'Ví dụ: 35 sản phẩm'],
  [19, 'product_brand',       '09. Thẻ sản phẩm',          'Tên thương hiệu sản phẩm',                   12, 12, 'Ví dụ: Tovi And Molly'],
  [20, 'product_name',        '09. Thẻ sản phẩm',          'Tên sản phẩm',                               16, 15, 'Tên chính trong card'],
  [21, 'product_price',       '09. Thẻ sản phẩm',          'Giá bán hiện tại',                           16, 16, 'Giá nổi bật'],
  [22, 'product_old_price',   '09. Thẻ sản phẩm',          'Giá gốc gạch ngang',                         14, 14, 'Chỉ hiện khi giảm giá'],
  [23, 'product_badge',       '09. Thẻ sản phẩm',          'Hot / New / Sale',                           11, 11, 'Nhãn nhỏ trên ảnh'],
  [24, 'detail_brand',        '10. Chi tiết sản phẩm',     'Thương hiệu trên trang chi tiết',            12, 12, 'Brand phía trên tên sản phẩm'],
  [25, 'detail_title',        '10. Chi tiết sản phẩm',     'Tên sản phẩm trang chi tiết',                30, 24, 'Tiêu đề lớn'],
  [26, 'detail_price',        '10. Chi tiết sản phẩm',     'Giá trong trang chi tiết',                   24, 22, 'Giá bán nổi bật'],
  [27, 'detail_body',         '10. Chi tiết sản phẩm',     'Mô tả, thông số và nhãn lựa chọn',           14, 14, 'Nội dung chi tiết'],
  [28, 'action_button',       '11. Nút hành động',         'Thêm giỏ, đặt hàng, xác nhận Zalo',          14, 14, 'Nút thao tác chính'],
  [29, 'cart_text',           '12. Giỏ hàng / đặt hàng',   'Tên sản phẩm, số lượng, tổng tiền, form',    14, 14, 'Nội dung giỏ và form'],
  [30, 'footer_description',  '13. Chân trang',            'Mô tả thương hiệu ở footer',                 14, 14, 'Đoạn giới thiệu'],
  [31, 'footer_heading',      '13. Chân trang',            'Sản phẩm, Hỗ trợ, Liên hệ',                  13, 13, 'Tiêu đề các cột'],
  [32, 'footer_link',         '13. Chân trang',            'Các liên kết footer',                        14, 14, 'Nội dung danh sách'],
  [33, 'footer_bottom',       '13. Chân trang',            'Copyright / Made with love',                 13, 13, 'Dòng cuối trang'],
  [34, 'mobile_nav',          '14. Điều hướng mobile',     'Trang chủ, Tìm kiếm, Giỏ hàng, Zalo',        12, 12, 'Thanh cố định dưới điện thoại']
];

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
  getOrCreateSheet(TAB_CATS, ['id','name','icon','image_url','count']);
  const campaignSheet = getOrCreateSheet(TAB_CAMPAIGNS, ['id','type','tag','title','description','btn_text','bg_color','image_url','mobile_image_url','image_position','overlay','active','sort_order']);
  setupCampaignDropdowns(campaignSheet);
  setupTypographySettings();

  // Tab _entry — tạo layout form
  setupEntrySheet();

  return logSetupResult('✅ Đã tạo xong cấu trúc sheet!');
}

// Tạo/cập nhật tab cấu hình chữ mà không xóa các giá trị override đã nhập.
function setupTypographySettings() {
  const headers = [
    'order','key','area','web_content','default_desktop_px','desktop_px',
    'default_mobile_px','mobile_px','font_weight','font_style','line_height',
    'letter_spacing_px','color','text_transform','note'
  ];
  let sheet = SHEET_CATALOG.getSheetByName(TAB_TYPOGRAPHY);
  if (!sheet) {
    sheet = SHEET_CATALOG.insertSheet(TAB_TYPOGRAPHY);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const lastRow = sheet.getLastRow();
  const existing = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()
    : [];
  const rowByKey = {};
  existing.forEach((row, index) => {
    const key = String(row[1] || '').trim();
    if (key) rowByKey[key] = index + 2;
  });

  TYPOGRAPHY_ROWS.forEach(item => {
    const [order, key, area, content, desktopDefault, mobileDefault, note] = item;
    let row = rowByKey[key];
    if (!row) {
      row = sheet.getLastRow() + 1;
      sheet.getRange(row, 1, 1, headers.length).setValues([[
        order, key, area, content, desktopDefault, '', mobileDefault, '',
        '', '', '', '', '', '', note
      ]]);
    } else {
      // Chỉ cập nhật cột mô tả/default; giữ nguyên các cột người dùng chỉnh.
      sheet.getRange(row, 1, 1, 5).setValues([[order, key, area, content, desktopDefault]]);
      sheet.getRange(row, 7).setValue(mobileDefault);
      sheet.getRange(row, 15).setValue(note);
    }
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff')
    .setWrap(true).setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
  sheet.setHiddenGridlines(true);
  const dataRowCount = Math.max(sheet.getLastRow() - 1, 1);
  sheet.getRange(2, 1, dataRowCount, headers.length).sort({ column: 1, ascending: true });

  // Cột giải thích/default màu xám; cột nhập override màu vàng nhạt.
  sheet.getRange(2, 1, dataRowCount, headers.length)
    .setVerticalAlignment('middle').setWrap(true);
  sheet.getRange(2, 1, dataRowCount, 5).setBackground('#f4f4f4');
  sheet.getRange(2, 7, dataRowCount, 1).setBackground('#f4f4f4');
  sheet.getRange(2, 15, dataRowCount, 1).setBackground('#f4f4f4');
  [6,8,9,10,11,12,13,14].forEach(col =>
    sheet.getRange(2, col, dataRowCount, 1).setBackground('#fff8d8')
  );

  const widths = [55,170,190,290,125,105,120,95,105,100,100,130,105,125,260];
  widths.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
  sheet.setRowHeight(1, 42);
  for (let row = 2; row <= dataRowCount + 1; row++) sheet.setRowHeight(row, 44);

  const rowCount = dataRowCount;
  const listRule = (values, help) => SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true).setAllowInvalid(false).setHelpText(help).build();
  sheet.getRange(2, 9, rowCount, 1).setDataValidation(listRule(
    ['300', '400', '500', '600', '700'],
    'Độ đậm: 400 = thường, 500 = vừa, 600–700 = đậm. Để trống để dùng mặc định.'
  ));
  sheet.getRange(2, 10, rowCount, 1).setDataValidation(listRule(
    ['normal', 'italic'],
    'Chọn normal hoặc italic. Để trống để dùng mặc định.'
  ));
  sheet.getRange(2, 11, rowCount, 1).setDataValidation(listRule(
    ['normal', '1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '2'],
    'Khoảng cách dòng. Khuyến nghị 1.4–1.6 cho nội dung thường.'
  ));
  sheet.getRange(2, 14, rowCount, 1).setDataValidation(listRule(
    ['none', 'uppercase', 'lowercase', 'capitalize'],
    'Kiểu chữ hoa/thường. Để trống để dùng mặc định.'
  ));
  const sizeRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(8, 96).setAllowInvalid(false)
    .setHelpText('Chỉ nhập số từ 8 đến 96, đơn vị px. Có thể để trống.').build();
  sheet.getRange(2, 6, rowCount, 1).setDataValidation(sizeRule);
  sheet.getRange(2, 8, rowCount, 1).setDataValidation(sizeRule);
  sheet.getRange(2, 12, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberBetween(-2, 10).setAllowInvalid(false)
      .setHelpText('Khoảng cách ký tự từ -2 đến 10px. Có thể để trống.').build()
  );
  // Không dùng custom-formula validation cho cột màu vì dấu phân cách công
  // thức phụ thuộc locale của Google Sheet (`,` hoặc `;`). Website vẫn kiểm
  // tra chặt mã HEX trước khi áp dụng, nên giá trị sai sẽ được bỏ qua an toàn.
  sheet.getRange(2, 13, rowCount, 1).clearDataValidations();

  sheet.getRange('F1').setNote('Cỡ chữ desktop muốn ghi đè, chỉ nhập số px. Để trống = dùng HTML mặc định.');
  sheet.getRange('H1').setNote('Cỡ chữ mobile muốn ghi đè, chỉ nhập số px. Để trống = dùng HTML mặc định.');
  sheet.getRange('I1').setNote('Dropdown độ đậm: 400 thường, 500 vừa, 600–700 đậm.');
  sheet.getRange('J1').setNote('Dropdown chữ thường hoặc chữ nghiêng.');
  sheet.getRange('K1').setNote('Dropdown chiều cao dòng.');
  sheet.getRange('L1').setNote('Khoảng cách ký tự theo px, ví dụ 0, 0.5, 1 hoặc 2.');
  sheet.getRange('M1').setNote('Mã màu HEX 6 ký tự, ví dụ #111111, #666666, #087A37.');
  sheet.getRange('N1').setNote('Dropdown chuyển chữ hoa/thường.');

  return logSetupResult('✅ Tab typography_settings đã sẵn sàng; dữ liệu override cũ được giữ nguyên.');
}

// Ghi kết quả vào Execution log để các hàm setup chạy được cả khi project
// được mở trực tiếp từ script.google.com và không có Google Sheet UI.
function logSetupResult(message) {
  console.log(message);
  return { ok: true, message };
}

// Thêm các cột ảnh banner còn thiếu mà không xóa hoặc thay đổi dữ liệu hiện có.
// Chạy riêng hàm này một lần nếu Sheet đã được khởi tạo trước đây.
function setupCampaignImageColumns() {
  const headers = ['image_url', 'mobile_image_url', 'image_position', 'overlay'];
  const sheet = getOrCreateSheet(TAB_CAMPAIGNS, [
    'id','type','tag','title','description','btn_text','bg_color',
    'image_url','mobile_image_url','image_position','overlay','active','sort_order'
  ]);
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
  const missing = headers.filter(header => !current.includes(header));

  if (missing.length) {
    sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
    sheet.getRange(1, lastColumn + 1, 1, missing.length)
      .setFontWeight('bold')
      .setBackground('#111111')
      .setFontColor('#ffffff');
  }

  setupCampaignDropdowns(sheet);

  return logSetupResult(
    missing.length
      ? '✅ Đã thêm cột: ' + missing.join(', ') + ' và cấu hình dropdown.'
      : '✅ Các cột ảnh banner và dropdown đã sẵn sàng.'
  );
}

// Tạo dropdown cho các cấu hình banner để người quản lý không phải nhập tay.
function setupCampaignDropdowns(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
  const positionColumn = headers.indexOf('image_position') + 1;
  const overlayColumn = headers.indexOf('overlay') + 1;
  const rowCount = Math.max(sheet.getMaxRows() - 1, 1);

  if (positionColumn > 0) {
    const positionRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([
        'center',
        'left center',
        'right center',
        'center top',
        'center bottom',
        'left top',
        'left bottom',
        'right top',
        'right bottom'
      ], true)
      .setAllowInvalid(false)
      .setHelpText('Chọn vị trí ưu tiên của ảnh khi banner tự cắt theo khung.')
      .build();
    sheet.getRange(2, positionColumn, rowCount, 1).setDataValidation(positionRule);
    sheet.getRange(1, positionColumn).setNote('Vị trí ảnh khi hiển thị. Khuyến nghị: right center.');
  }

  if (overlayColumn > 0) {
    const overlayRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([
        '0', '0.1', '0.15', '0.2', '0.22', '0.25',
        '0.3', '0.35', '0.4', '0.5', '0.6', '0.7'
      ], true)
      .setAllowInvalid(false)
      .setHelpText('Chọn độ tối phủ lên ảnh. Số càng lớn thì ảnh càng tối và chữ càng dễ đọc.')
      .build();
    sheet.getRange(2, overlayColumn, rowCount, 1).setDataValidation(overlayRule);
    sheet.getRange(1, overlayColumn).setNote('Độ tối từ 0 đến 0.7. Khuyến nghị mặc định: 0.22.');
  }
}

// Thêm cột ảnh danh mục còn thiếu mà không xóa hoặc thay đổi dữ liệu hiện có.
// Chạy riêng hàm này một lần nếu Sheet đã được khởi tạo trước đây.
function setupCategoryImageColumn() {
  const sheet = getOrCreateSheet(TAB_CATS, ['id','name','icon','image_url','count']);
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);

  if (!current.includes('image_url')) {
    sheet.getRange(1, lastColumn + 1).setValue('image_url')
      .setFontWeight('bold')
      .setBackground('#111111')
      .setFontColor('#ffffff');
    return logSetupResult('✅ Đã thêm cột image_url vào tab categories.');
  } else {
    return logSetupResult('✅ Cột image_url đã tồn tại trong tab categories.');
  }
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
  SHEET_CATALOG.toast(`✨ ID mới: ${newId} — Form đã reset, sẵn sàng nhập!`, 'Tovi & Molly', 4);
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

  SHEET_CATALOG.toast(`✅ Đã load: ${p.name}`, 'Tovi & Molly', 3);
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
    SHEET_CATALOG.toast(`✅ ${result.action === 'inserted' ? 'Đã thêm' : 'Đã cập nhật'}: ${payload.name} (${id})`, 'Tovi & Molly', 4);
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
      SHEET_CATALOG.toast(`🗑️ Đã xóa: ${name}`, 'Tovi & Molly', 3);
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
    .addItem('🎨 Tạo / cập nhật cấu hình chữ', 'setupTypographySettings')
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
const ORDER_SHEET_ID = '1QbMLOANknwQGfEhBnXkTVFxTJMbHEyuCLVphHZewjwY';
