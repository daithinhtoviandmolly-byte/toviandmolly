# 🐾 Tovi And Molly — Hướng dẫn thêm & quản lý dữ liệu

node: account vào googlesheet và cloudinary.com thì đều dùng tài khoản daithinhtoviandmolly@gmail.com

## Link trang web để xem:
https://toviandmolly.vn

(gốc: https://daithinhtoviandmolly-byte.github.io/toviandmolly/ )
## File Tovi Molly Catalog:
https://docs.google.com/spreadsheets/d/1F-Fcu0Aoj8tvyedmF7yDohLSqJbRNCeftpQhr3_Lifo/edit?gid=1895329997#gid=1895329997
---

## Tổng quan các tab trong Google Sheet

```
Tovi Molly Catalog
├── products      ← dữ liệu sản phẩm (website đọc từ đây)
├── categories    ← danh mục
├── campaigns     ← banner trang chủ + thanh thông báo
└── _entry        ← form nhập liệu (chỉ để quản lý, website không đọc)
```

> **Quy tắc quan trọng:** Chỉ sửa dữ liệu qua tab `_entry` và menu 🐾. Không nên sửa trực tiếp tab `products` để tránh lỗi format.

---

## Phần 1 — Quản lý sản phẩm (tab `_entry`)

### 1.1 Thêm sản phẩm mới

1. Mở Google Sheet → vào tab **`_entry`**
2. Trên thanh menu → click **🐾 Tovi And Molly** → **✨ Tạo ID mới (form trống)**
3. Form tự động reset và sinh ID mới (SP001, SP002...)
4. Điền thông tin vào các ô:

**Cột trái — Thông tin cơ bản:**

| Ô | Điền gì | Ví dụ |
|---|---|---|
| Tên sản phẩm | Tên đầy đủ | `Bình sữa PPSU cao cấp 240ml` |
| Thương hiệu | Tên brand | `Tovi` hoặc `Molly` |
| Danh mục | ID danh mục | `binh`, `do-choi`, `quan-ao`... |
| Giá bán | Số nguyên, không dấu chấm | `285000` |
| Giá gốc | Để `0` nếu không giảm giá | `380000` |
| Badge | Nhãn hiển thị | `sale`, `new`, `hot`, hoặc để trống |
| Là sản phẩm mới? | Chữ thường | `true` hoặc `false` |
| Là sản phẩm hot? | Chữ thường | `true` hoặc `false` |
| Còn hàng? | Chữ thường | `true` hoặc `false` |
| Emoji | Icon dự phòng khi chưa có ảnh | `🍼` |
| Mô tả | Nội dung tự do, **Alt+Enter** để xuống dòng | |

**Cột phải — Ảnh:**

- Dán URL ảnh Cloudinary vào các ô **URL Ảnh 1 → 5**
- Ảnh 1 là ảnh chính hiển thị ngoài danh sách
- Tối đa 5 ảnh, để trống nếu không có
- cách upload và lấy URL của ảnh thì xem mục upload ảnh bên dưới (2.2 Upload ảnh)

**Cột phải — Biến thể (Variants):**

Mỗi loại variant gồm 2 dòng liền nhau:
- Dòng trên (cột D): **Tên loại** — vd: `Màu sắc`
- Dòng dưới (cột E): **Các giá trị**, cách nhau bởi dấu phẩy — vd: `Xanh, Hồng, Trắng`

```
Ví dụ sản phẩm có 2 loại variant:

Loại 1  │ Màu sắc          ← cột D
Giá trị │ Xanh, Hồng, Trắng  ← cột E

Loại 2  │ Dung tích        ← cột D
Giá trị │ 150ml, 240ml     ← cột E
```

**Cột phải — Thông số kỹ thuật (Specs):**

Mỗi dòng gồm:
- Cột D: **Tên thông số** — vd: `Chất liệu`
- Cột E: **Giá trị** — vd: `PPSU cao cấp`

Tối đa 6 dòng specs.

5. Sau khi điền xong → **🐾 Tovi And Molly** → **💾 Lưu sản phẩm**
6. Thông báo xác nhận xuất hiện ở góc dưới màn hình

---

### 1.2 Tìm và sửa sản phẩm

1. Vào tab `_entry`
2. **🐾 Tovi And Molly** → **🔍 Tìm sản phẩm**
3. Popup xuất hiện → nhập tên hoặc ID sản phẩm → OK

```
Ví dụ:
- Nhập "SP001" → load ngay sản phẩm đó
- Nhập "bình" → hiện danh sách: "1. SP001 — Bình sữa PPSU | 2. SP009 — Bình sữa thủy tinh..."
- Nhập số thứ tự để chọn
```

4. Dữ liệu sản phẩm tự động điền vào form
5. Sửa các ô cần thay đổi
6. **🐾 Tovi And Molly** → **💾 Lưu sản phẩm**

---

### 1.3 Xóa sản phẩm

1. Tìm và load sản phẩm cần xóa (theo bước 1.2)
2. **🐾 Tovi And Molly** → **🗑️ Xóa sản phẩm**
3. Hộp thoại xác nhận hiện ra → click **Yes**

> ⚠️ Xóa không thể hoàn tác. Nếu chỉ muốn ẩn sản phẩm, đổi "Còn hàng?" thành `false` thay vì xóa.

---

### 1.4 Tắt/bật hiển thị sản phẩm

Để tạm ẩn sản phẩm mà không xóa:
- Tìm sản phẩm → đổi **Còn hàng?** từ `true` → `false` → Lưu
- Website sẽ hiển thị nhãn "Hết hàng" và mờ sản phẩm đó

---

## Phần 2 — Upload ảnh lên Cloudinary

### 2.1 Đăng ký Cloudinary (miễn phí) -> cái này đã đăng ký bằng tài khoản google daithinhtoviandmolly@gmail.com

1. Vào [cloudinary.com](https://cloudinary.com) → **Sign up for free**
2. Đăng ký bằng email hoặc Google
3. Gói miễn phí: 25GB lưu trữ, đủ dùng cho hàng trăm sản phẩm

### 2.2 Upload ảnh

Vào trang upload ảnh của Cloudinary: 
(https://console.cloudinary.com/app/c-79affc9ce297e90073bf4be20a2f56/assets/media_library/folders/ce539499b0091f2645bd924a39d91f1ca7?view_mode=mosaic)
1. Vào **Media Library** (menu trái) -> chọn **Folders** -> tạo cấu trúc folder cho dễ quản lý, có thể mỗi sản phẩm 1 folder như hiện tại đang có -> kéo thả ảnh lên folder sản phẩm tương ứng.
2. Hoặc Click **Upload** → chọn ảnh từ máy tính
(Có thể upload nhiều ảnh cùng lúc)

**Mẹo đặt tên file trước khi upload:**
```
sp001-1.jpg   ← ảnh chính sản phẩm SP001
sp001-2.jpg   ← ảnh phụ
sp001-3.jpg
```

### 2.3 Lấy URL ảnh

1. Click vào ảnh trong Media Library
2. Nhìn sang bảng bên phải → tìm mục **URL** hoặc **Copy URL** (đưa chuột vào từng ảnh, có biểu tượng <> copy URL ở góc trên bên phải)
3. URL dạng:
```
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sp001-1.jpg
```


---

## Phần 3 — Quản lý danh mục (tab `categories`)

Tab `categories` có thể sửa trực tiếp (đơn giản, ít thay đổi).

**Cấu trúc:**

| id | name | icon | count |
|---|---|---|---|
| binh | Bình sữa | 🍼 | (tự động) |
| do-choi | Đồ chơi | 🧸 | |
| quan-ao | Quần áo | 👕 | |

- **id**: chữ thường, không dấu, không space (dùng dấu `-`) — phải khớp với cột `category` trong tab products
- **name**: tên hiển thị trên website
- **icon**: emoji bất kỳ
- **count**: để trống, website tự đếm

**Thêm danh mục mới:**
1. Vào tab `categories`
2. Thêm dòng mới phía dưới
3. Điền đủ 3 cột: `id`, `name`, `icon`
4. Khi thêm sản phẩm, điền đúng `id` này vào cột "Danh mục" trong form

---

## Phần 4 — Quản lý Banner và thông báo (tab `campaigns`)

### 4.1 Thanh thông báo (promo bar)

Dòng chạy phía trên banner, dùng để hiển thị khuyến mãi ngắn.

| id | type | title | active |
|---|---|---|---|
| 1 | promo_bar | Sale 30% hôm nay! | true |

- **type**: phải là `promo_bar`
- **title**: nội dung hiển thị
- **active**: `true` để hiện, `false` để ẩn
- Chỉ hiển thị dòng `promo_bar` đầu tiên có `active = true`

### 4.2 Banner trang chủ

Mỗi dòng là một slide banner.

| id | type | tag | title | description | btn_text | bg_color | active | sort_order |
|---|---|---|---|---|---|---|---|---|
| 2 | banner | Bộ sưu tập mới | Yêu thương bé | Đồ dùng chất lượng cao... | Khám phá → | #f7f4f0 | true | 1 |
| 3 | banner | Khuyến mãi | Giảm đến 50% | Ưu đãi đặc biệt... | Mua ngay → | #f0f4f7 | true | 2 |

- **type**: phải là `banner`
- **tag**: dòng chữ nhỏ phía trên tiêu đề (vd: "Bộ sưu tập mới")
- **title**: tiêu đề lớn — xuống dòng bằng `\n` (vd: `Yêu thương bé\ntừng khoảnh khắc`)
- **description**: mô tả ngắn phía dưới tiêu đề
- **btn_text**: chữ trên nút (vd: `Khám phá →`)
- **bg_color**: màu nền dạng hex (vd: `#f7f4f0`) — nên dùng màu nhạt
- **active**: `true` để hiện, `false` để ẩn
- **sort_order**: số thứ tự slide (1, 2, 3...)

**Gợi ý màu nền banner nhẹ:**
```
#f7f4f0  ← kem ấm
#f0f4f7  ← xanh lạnh nhẹ
#f4f7f0  ← xanh lá nhẹ
#f7f0f4  ← hồng nhẹ
#f5f5f5  ← xám trắng
```

---

## Phần 5 — Xem đơn hàng (Sheet Orders)

Đơn hàng được lưu tự động vào **Tovi Molly Orders**: https://docs.google.com/spreadsheets/d/1QbMLOANknwQGfEhBnXkTVFxTJMbHEyuCLVphHZewjwY/edit?gid=0#gid=0, mỗi tháng một tab riêng:

```
Tovi Molly Orders
├── 2025-01   ← tháng 1/2025
├── 2025-02   ← tháng 2/2025
└── 2025-03   ← tháng 3/2025 (tab hiện tại)
```

**Các cột trong mỗi tab:**

| Thời gian | ID đơn | Tên KH | SĐT | Địa chỉ | Sản phẩm | Tổng tiền | Ghi chú | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| 01/03/2025 14:32 | ORD20250301143200 | Nguyễn Văn A | 0901... | Q.1 HCM | SP001 ×2; SP003 ×1 | 769000 | | Mới |

- **Trạng thái** mặc định là `Mới` — có thể sửa tay thành `Đang xử lý`, `Đã giao`, `Hủy`...
- Cột này không ảnh hưởng đến website, chỉ để bạn theo dõi nội bộ

---

## Phần 6 — Các lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| Website vẫn hiện demo data | Sheet chưa public | Share sheet → Anyone with link → Viewer |
| Sản phẩm không hiện | Sheet ID sai | Kiểm tra lại CFG.SHEET_ID trong index.html |
| Đơn hàng không lưu vào Sheet | Apps Script chưa deploy hoặc URL sai | Kiểm tra CFG.SCRIPT, re-deploy nếu cần |
| Menu 🐾 không xuất hiện | Cần reload Sheet | F5 hoặc đóng/mở lại Google Sheet |
| Ảnh không hiện | URL Cloudinary sai | Kiểm tra URL có thể mở trực tiếp trên trình duyệt không |
| Sản phẩm không có variants | Định dạng sai | Kiểm tra: dòng lẻ = tên loại, dòng chẵn = giá trị, cách nhau bởi dấu phẩy |

---

## Ghi nhớ nhanh

```
Thêm sản phẩm:   _entry → menu 🐾 → ✨ Tạo ID mới → điền form → 💾 Lưu
Sửa sản phẩm:   _entry → menu 🐾 → 🔍 Tìm → chọn → sửa → 💾 Lưu
Xóa sản phẩm:   _entry → menu 🐾 → 🔍 Tìm → chọn → 🗑️ Xóa
Ẩn sản phẩm:    Còn hàng? = false → 💾 Lưu
Thêm banner:     tab campaigns → thêm dòng mới, type = banner
Xem đơn hàng:   Sheet "Tovi Molly Orders" → chọn tab tháng
```
