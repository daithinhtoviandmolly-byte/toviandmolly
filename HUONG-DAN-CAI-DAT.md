# 🐾 Tovi And Molly — Hướng dẫn cài đặt

> Thời gian hoàn thành: khoảng 20–30 phút

---

## Tổng quan hệ thống

```
Google Sheet "Catalog"  ──đọc dữ liệu──▶  Website (index.html)
                                                    │
                        ◀──gửi đơn hàng────────────┘
                                │
Google Sheet "Orders"  ◀────────┘  (qua Apps Script)
```

- **Website** đọc dữ liệu sản phẩm từ Google Sheet, không cần server
- **Đơn hàng** được gửi về Sheet Orders và mở Zalo tự động
- **Quản lý sản phẩm** hoàn toàn trên Google Sheet, không cần đụng code

---

## Phần 1 — Google Sheet Catalog

### 1.1 Tạo Sheet mới

1. Vào [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** để tạo sheet mới
3. Đổi tên thành **Tovi Molly Catalog** (click vào tên "Untitled spreadsheet" ở góc trên trái)

### 1.2 Lấy Sheet ID

Nhìn vào URL trên trình duyệt:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```

Phần in đậm giữa `/d/` và `/edit` chính là **Sheet ID**. Copy lại, cần dùng ở bước sau.

### 1.3 Chia sẻ Sheet để website đọc được

1. Click nút **Share** (góc trên phải)
2. Mục "General access" → chọn **Anyone with the link**
3. Quyền giữ là **Viewer**
4. Click **Done**

---

## Phần 2 — Cài đặt Apps Script

Apps Script là công cụ tự động hóa của Google, dùng để:
- Tạo cấu trúc các tab trong Sheet
- Xử lý form nhập liệu sản phẩm
- Nhận và lưu đơn hàng từ website

### 2.1 Mở Apps Script

Trong Google Sheet vừa tạo:
- Trên thanh menu → **Extensions** → **Apps Script**
- Một tab trình duyệt mới sẽ mở ra

### 2.2 Paste code

1. Trong cửa sổ Apps Script, click vào file **Code.gs** ở cột bên trái
2. **Xóa toàn bộ** nội dung có sẵn (thường là `function myFunction() {}`)
3. **Paste** toàn bộ nội dung file `Code.gs` vào
4. Nhấn **Ctrl+S** để lưu
5. Nếu được hỏi tên project → gõ **Tovi Molly** → OK

### 2.3 Chạy setupSheets() để khởi tạo

Đây là bước quan trọng nhất — chạy **một lần duy nhất** để tạo tất cả các tab cần thiết.

**Cách chạy:**

1. Tìm ô dropdown ở thanh công cụ (thường hiển thị tên function)

```
┌─────────────────────────────────────────────┐
│  💾  ▶  🐛  [ setupSheets    ▼ ]           │
└─────────────────────────────────────────────┘
```

2. Click vào dropdown → chọn **setupSheets**
3. Nhấn nút **▶ Run**

**Cấp quyền (chỉ lần đầu):**

Lần đầu chạy Google sẽ yêu cầu cấp quyền:

1. Popup xuất hiện → click **Review permissions**
2. Chọn **tài khoản Google** của bạn
3. Thấy màn hình cảnh báo "Google hasn't verified this app"
   - Click **Advanced** (góc dưới trái)
   - Click **Go to Tovi Molly (unsafe)**
4. Click **Allow**
5. Quay lại Apps Script → nhấn **▶ Run** lần nữa

**Kết quả thành công:**

- Góc dưới màn hình hiện thông báo `"Đã tạo xong cấu trúc sheet!"`
- Quay lại Google Sheet → thấy các tab mới xuất hiện:

```
products | categories | campaigns | _entry
```

- Trên thanh menu của Sheet xuất hiện menu **🐾 Tovi And Molly**

> ⚠️ Nếu không thấy menu 🐾, thử reload lại trang Google Sheet

### 2.4 Deploy Web App (để nhận đơn hàng)

1. Trong Apps Script → click **Deploy** (góc trên phải) → **New deployment**

```
┌──────────────────────────────────────┐
│  Deploy ▼                            │
│  ├── New deployment         ← click  │
│  ├── Manage deployments              │
│  └── Test deployments                │
└──────────────────────────────────────┘
```

2. Click biểu tượng **⚙️** cạnh "Select type" → chọn **Web app**
3. Điền thông tin:

| Trường | Giá trị |
|---|---|
| Description | Tovi Molly API |
| Execute as | **Me** |
| Who has access | **Anyone** |

4. Click **Deploy**
5. Nếu hỏi quyền → làm lại các bước cấp quyền như ở 2.3
6. Copy **Web app URL** xuất hiện — dạng:

```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec
```

> Lưu URL này lại, cần điền vào `index.html` ở bước tiếp theo

---

## Phần 3 — Tạo Sheet Orders (lưu đơn hàng)

1. Tạo thêm một Google Sheet mới tên **Tovi Molly Orders**
2. Lấy Sheet ID theo cách tương tự (phần 1.2)
3. Quay lại Apps Script của Sheet Catalog
4. Tìm dòng cuối cùng trong `Code.gs`:

```javascript
const ORDER_SHEET_ID = 'YOUR_ORDER_SHEET_ID_HERE';
```

5. Thay bằng ID vừa lấy:

```javascript
const ORDER_SHEET_ID = '1AbcDefGhiJklMnoPqrStuvWxyz1234567890abcd';
```

6. Nhấn **Ctrl+S** lưu lại
7. Vào **Deploy → Manage deployments** → click biểu tượng ✏️ → **New version** → **Deploy** để cập nhật

---

## Phần 4 — Cập nhật file index.html

Mở file `index.html` bằng bất kỳ text editor nào (Notepad, VS Code...).

Tìm đoạn code đầu phần JavaScript (khoảng dòng 450):

```javascript
const CFG = {
  SHEET_ID: 'YOUR_SHEET_ID',
  ZALO: '84901234567',
  SCRIPT: 'YOUR_APPS_SCRIPT_URL',
  ...
};
```

Thay thế bằng thông tin thực tế:

```javascript
const CFG = {
  SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',  // Sheet ID từ bước 1.2
  ZALO: '84901234567',   // Số điện thoại Zalo (bỏ số 0 đầu, thêm 84)
  SCRIPT: 'https://script.google.com/macros/s/AKfycbx.../exec', // URL từ bước 2.4
  ...
};
```

**Ví dụ chuyển đổi số Zalo:**
- Số thực: `0901 234 567`
- Điền vào: `84901234567`

Lưu file lại sau khi sửa.

---

## Phần 5 — Deploy Website

### Cách 1: GitHub Pages (miễn phí, khuyến nghị)

1. Đăng ký tài khoản tại [github.com](https://github.com) nếu chưa có
2. Click **+** → **New repository**
3. Đặt tên repository (vd: `toviandmolly`)
4. Chọn **Public** → click **Create repository**
5. Upload file `index.html`:
   - Click **Add file** → **Upload files**
   - Kéo thả file `index.html` vào
   - Click **Commit changes**
6. Vào **Settings** → **Pages** (menu bên trái)
7. Mục "Source" → chọn **Deploy from a branch**
8. Branch → chọn **main** → **/root** → click **Save**
9. Chờ 1–2 phút → website sẽ có địa chỉ dạng:

```
https://username.github.io/toviandmolly
```

### Cách 2: Netlify (miễn phí, dễ hơn)

1. Vào [netlify.com](https://netlify.com) → đăng ký tài khoản
2. Từ trang Dashboard → kéo thả thư mục chứa `index.html` vào vùng deploy
3. Chờ 30 giây → website sẵn sàng với địa chỉ tự động

---

## Phần 6 — Kiểm tra hoàn chỉnh

Mở website trên trình duyệt và kiểm tra từng mục:

| Mục kiểm tra | Kết quả mong đợi |
|---|---|
| Trang chủ load | Hiện banner và danh sách sản phẩm |
| Dữ liệu từ sheet | Không thấy demo data, thấy dữ liệu thật |
| Click sản phẩm | Mở trang detail |
| Thêm vào giỏ | Icon giỏ hàng cập nhật số lượng |
| Đặt hàng | Mở Zalo với nội dung điền sẵn |
| Đơn hàng lưu | Sheet Orders có dữ liệu mới |

**Nếu vẫn thấy demo data sau khi cài đặt:**

- Mở F12 → tab **Console** → kiểm tra có lỗi đỏ không
- Thường gặp: chưa share sheet (quay lại bước 1.3)
- Hoặc: Sheet ID bị sai (kiểm tra lại bước 1.2)

---

## Cập nhật Apps Script sau này

Mỗi khi sửa code trong Apps Script, cần re-deploy để áp dụng:

1. **Deploy** → **Manage deployments**
2. Click biểu tượng ✏️ (Edit)
3. Version → chọn **New version**
4. Click **Deploy**

> Lưu ý: URL Web App không thay đổi sau khi re-deploy, không cần sửa lại `index.html`
