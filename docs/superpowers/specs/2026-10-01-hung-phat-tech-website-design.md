# Đặc tả thiết kế website Hưng Phát Tech

## 1. Mục tiêu

Xây dựng website tiếng Việt chạy local cho Công ty TNHH Thiết Bị Công Nghệ Hưng Phát, giúp khách hàng:

- Nhận biết HƯNG PHÁT TECH là đơn vị cung cấp nhiều nhóm thiết bị công nghệ.
- Khám phá bốn nhóm chính: điện mặt trời, camera giám sát, laptop và PC, khóa cửa thông minh.
- Tìm kiếm, lọc và xem chi tiết sản phẩm minh họa.
- Tìm hiểu giải pháp, dự án, kiến thức và liên hệ tư vấn.

Website chưa triển khai hosting, chưa thay đổi DNS và không kết nối dịch vụ bên ngoài.

## 2. Nền tảng kỹ thuật

- Next.js App Router phiên bản ổn định, tương thích tại thời điểm cài đặt.
- TypeScript ở chế độ strict.
- Tailwind CSS để xây dựng hệ thống giao diện responsive.
- Vitest và Testing Library cho kiểm thử hành vi.
- Playwright hoặc công cụ trình duyệt tương đương cho smoke test và kiểm tra viewport.
- Không đưa khóa API hoặc thông tin bí mật vào mã nguồn phía client.

## 3. Thông tin doanh nghiệp được phép xuất bản

- Tên đầy đủ: Công ty TNHH Thiết Bị Công Nghệ Hưng Phát.
- Thương hiệu: HƯNG PHÁT TECH.
- Điện thoại: 0937100368 và 0357985073.
- Địa chỉ: B7-02 Khu Đô Thị Phú Mỹ Lộc, Phường Tam Quan, Tỉnh Gia Lai.
- Tên miền dự kiến: hungphattech.net.

Không bổ sung email, mã số thuế, chứng nhận, thời gian bảo hành, số liệu dự án, đánh giá khách hàng, đối tác hoặc cam kết chưa được doanh nghiệp xác nhận.

## 4. Hướng thị giác

Sử dụng phương án đã duyệt: **Showroom công nghệ mạnh mẽ**.

Hướng màu sắc và nhịp bố cục lấy cảm hứng từ `hagsolar.vn`: header tối, tiêu đề cô đọng có độ tương phản cao, section được đánh số/định danh rõ, vùng dự án hoặc sản phẩm ưu tiên hình ảnh lớn và CTA nổi bật. Chỉ học cách tổ chức thị giác; không sao chép logo HAG Solar, câu chữ, hình ảnh, số liệu, tên dự án, đối tác, thông số hoặc cam kết.

- Màu nền chính: `#0B0F12`.
- Bề mặt tối phụ: `#171C21`.
- Màu nhấn và CTA: `#FFC400`.
- Chữ chính: `#FFFFFF`.
- Chữ phụ trên nền tối: `#B8BEC7`.
- Khu danh sách sản phẩm dùng nền sáng trung tính để tăng khả năng đọc và so sánh.
- Font: Be Vietnam Pro, có fallback hệ thống hỗ trợ tiếng Việt.
- Góc bo nhỏ, đường viền rõ, khoảng trắng có chủ đích; tránh hiệu ứng trang trí nặng.
- Không có slideshow tự chạy. Chuyển động nhẹ phải tôn trọng `prefers-reduced-motion`.

Logo giai đoạn local là logo chữ “HƯNG PHÁT TECH”, được tách thành component để thay thế dễ dàng.

## 5. Kiến trúc thông tin và định tuyến

Sử dụng Next.js App Router với các trang:

- `/`: Trang chủ.
- `/gioi-thieu`: Giới thiệu.
- `/giai-phap`: Giải pháp và dịch vụ.
- `/san-pham`: Danh sách sản phẩm.
- `/san-pham/[slug]`: Chi tiết sản phẩm.
- `/danh-muc/dien-mat-troi`: Điện mặt trời.
- `/danh-muc/camera-giam-sat`: Camera giám sát.
- `/danh-muc/laptop-pc`: Laptop và PC.
- `/danh-muc/khoa-cua-thong-minh`: Khóa cửa thông minh.
- `/du-an`: Trang dự án; bản local dùng tiêu đề “Dự án thực tế (cần bổ sung)” và không liệt kê công trình giả.
- `/kien-thuc`: Kiến thức công nghệ.
- `/lien-he`: Liên hệ.

Có trang `not-found`, trạng thái tải cho các tuyến động và error boundary cấp ứng dụng.

## 6. Cấu trúc trang chủ

1. Thanh đầu trang và header bám trên:
   - Logo chữ.
   - Điều hướng desktop và menu mobile.
   - Nút gọi `0937 100 368`.
2. Hero:
   - Tiêu đề “GIẢI PHÁP CÔNG NGHỆ CHO NGÔI NHÀ & DOANH NGHIỆP”.
   - Mô tả chính xác: “Khám phá giải pháp điện mặt trời, camera giám sát, laptop, PC và khóa thông minh cùng Hưng Phát Tech.”
   - CTA “Nhận tư vấn” và “Khám phá sản phẩm”.
   - Ảnh minh họa thiết bị có quyền sử dụng, không giả làm ảnh dự án thật.
3. Bốn thẻ danh mục lớn.
4. Nhóm giải pháp theo đối tượng: gia đình, cửa hàng, văn phòng, doanh nghiệp.
5. Sản phẩm nổi bật.
6. Giới thiệu ngắn về Hưng Phát.
7. Khu vực dự án chỉ hiển thị khung “Cần bổ sung ảnh và nội dung dự án thực tế”; không dùng thẻ dự án giả, số liệu giả hoặc metadata ngụ ý đã thực hiện công trình.
8. Quy trình đề xuất có đúng bốn bước “Tiếp nhận nhu cầu → Tư vấn cấu hình/khảo sát khi cần → Báo giá → Triển khai và bàn giao”, kèm nhãn luôn nhìn thấy “Nội dung đề xuất, cần doanh nghiệp xác nhận trước khi xuất bản”.
9. Bài viết kiến thức minh họa.
10. Biểu mẫu liên hệ thử nghiệm.
11. Footer chứa đúng tên công ty, hai số điện thoại và địa chỉ.

## 7. Dữ liệu và component

Tách dữ liệu khỏi giao diện:

- `src/config/company.ts`: thông tin doanh nghiệp và trạng thái xuất bản.
- `src/data/categories.ts`: bốn danh mục.
- `src/data/products.demo.ts`: 8–12 sản phẩm minh họa.
- `src/data/projects.demo.ts`: khung dự án minh họa, không nhận là công trình thật.
- `src/data/articles.demo.ts`: bài viết mẫu.
- `src/types/content.ts`: kiểu dữ liệu dùng chung.

Các component chính:

- Header, mobile navigation, footer, logo chữ.
- Hero, category grid, audience solutions, project placeholder, process section.
- Product grid, product card, search/filter/sort controls, empty state.
- Product gallery, specification list, related products.
- Contact form, floating mobile call actions.
- Disclosure badge cho nội dung minh họa hoặc cần xác nhận.

## 8. Sản phẩm và bộ lọc

Dữ liệu local gồm 12 sản phẩm, chia đều bốn nhóm. Mọi sản phẩm mẫu phải có:

- Trường `isDemo: true`.
- Tên, slug, danh mục, thương hiệu minh họa nếu có; thương hiệu mẫu không được hiểu là thương hiệu Hưng Phát đang phân phối.
- Ảnh minh họa hợp lệ.
- Một số đặc điểm tổng quát, tránh thông số định lượng chưa xác minh.
- Giá trị giá là `null`, hiển thị “Liên hệ báo giá”.

Mỗi thẻ sản phẩm, trang chi tiết và danh sách liên quan phải hiển thị rõ nhãn “Sản phẩm minh họa trong bản local”. Nếu có thương hiệu mẫu, giao diện phải ghi rõ “Thương hiệu minh họa, chưa xác nhận phân phối”. Không hiển thị trạng thái còn hàng, bảo hành, giá, khuyến mại hoặc thông số định lượng chưa xác minh.

Bộ lọc chạy phía client:

- Tìm theo tên không phân biệt hoa thường.
- Lọc danh mục.
- Lọc thương hiệu chỉ từ dữ liệu hiện có.
- Sắp xếp tên A–Z hoặc Z–A.
- Không có sắp xếp giá khi dữ liệu giá chưa đầy đủ.
- Khi không có kết quả, hiển thị thông báo và nút xóa bộ lọc.

## 9. Biểu mẫu liên hệ

Trường dữ liệu:

- Họ tên.
- Số điện thoại.
- Nhóm sản phẩm quan tâm.
- Nội dung.

Quy tắc:

- Họ tên và số điện thoại bắt buộc.
- Số điện thoại chỉ nhận định dạng hợp lý, hiển thị lỗi cạnh trường.
- Nhãn, mô tả lỗi và focus state hỗ trợ bàn phím và trình đọc màn hình.
- Submit hợp lệ chỉ chuyển sang trạng thái “Bản thử nghiệm: thông tin chưa được gửi tới doanh nghiệp”.
- Không hiển thị “Đã gửi thành công”.
- Không lưu local storage, không ghi tệp, không gọi API và không log dữ liệu nhập.

## 10. Liên hệ và bản đồ

- Nút gọi dùng đúng `tel:0937100368` và `tel:0357985073`.
- Thanh liên hệ nổi trên điện thoại nằm trong safe area và không che nội dung.
- Không hiển thị Zalo khi chưa có đường dẫn tài khoản chính thức.
- Liên kết bản đồ sử dụng truy vấn địa chỉ dạng URL tìm kiếm; không gán tọa độ.

## 11. SEO và dữ liệu có cấu trúc

- Metadata riêng cho các nhóm trang.
- Open Graph dùng tên, mô tả và ảnh thương hiệu minh họa local; bản local không khai báo canonical hoặc URL tuyệt đối thuộc `hungphattech.net`.
- JSON-LD loại `LocalBusiness` chỉ chứa tên, điện thoại và địa chỉ đã cung cấp. Trường `url` chỉ được thêm khi biến môi trường production đã được cấu hình và tên miền triển khai đã được xác nhận.
- Bản local dùng `robots: noindex, nofollow`.
- Không tạo thông tin chưa xác thực trong metadata hoặc schema.
- Trang dự án local dùng metadata nêu rõ nội dung đang chờ bổ sung, không khẳng định có công trình thực tế.

## 12. Ảnh và tài sản

Tệp `33333.JPG` chưa được tìm thấy trong workspace tại thời điểm lập đặc tả. Thiết kế vẫn dùng chính xác tinh thần màu sắc đã mô tả.

Ảnh sản phẩm/hero trong bản local sẽ là:

- Ảnh tự tạo dạng bitmap phù hợp với thiết bị công nghệ; hoặc
- Ảnh miễn phí có quyền sử dụng rõ ràng và được lưu/ghi nguồn phù hợp.

Không dùng ảnh công trình của đơn vị khác làm dự án Hưng Phát. Ảnh ngoài màn hình dùng lazy loading; ảnh quan trọng dùng kích thước ổn định để tránh dịch chuyển bố cục.

## 13. Trạng thái lỗi và khả năng truy cập

- Điều hướng bằng bàn phím, focus visible rõ ràng.
- Tương phản chữ đạt mức đọc tốt trên nền đen/vàng.
- Menu mobile có nhãn truy cập, đóng bằng Escape và không khóa sai focus.
- 404 cung cấp đường về trang chủ và sản phẩm.
- Error boundary giải thích lỗi kỹ thuật, không giả trạng thái thành công.
- Không có liên kết rỗng hoặc nút giả.

## 14. Kiểm thử

Kiểm thử tự động tập trung vào hành vi có rủi ro:

- Hàm tìm kiếm, lọc và sắp xếp.
- Quy tắc validation biểu mẫu.
- Hiển thị “Liên hệ báo giá” khi giá rỗng.
- Empty state và xóa bộ lọc.
- Nhãn minh họa xuất hiện trên mọi thẻ, trang chi tiết, sản phẩm liên quan và trang danh mục.
- Form hợp lệ chỉ hiển thị thông báo thử nghiệm; không có chuỗi “Đã gửi thành công”.
- Không có gọi mạng, local storage hoặc logging chứa dữ liệu form.
- JSON-LD chỉ chứa danh sách trường doanh nghiệp được phép và không có `url` ở local.
- Metadata `noindex, nofollow` áp dụng cho mọi tuyến.

Kiểm thử trình duyệt:

- Trang chủ và tất cả tuyến chính trả về nội dung.
- Menu mobile mở/đóng.
- Nút gọi có đúng `tel:`.
- Form không gửi dữ liệu ra ngoài.
- Nhãn demo vẫn nhìn thấy trên mobile và desktop.
- Trang dự án không có công trình hoặc số liệu giả.
- Trang loading, error và 404 hiển thị đúng hành động phục hồi.
- Menu và form thao tác được bằng bàn phím; focus visible không bị che.
- Kiểm tra tương phản các cặp màu chính và chữ trên nút vàng.
- Không tràn ngang tại mobile, tablet và desktop.
- Ảnh hiển thị, không méo/vỡ.

Kiểm tra kỹ thuật cuối:

- TypeScript.
- ESLint.
- Unit/integration tests.
- Production build.
- Smoke test bằng trình duyệt trên máy chủ local.

## 15. Giới hạn và nội dung cần bổ sung

Trước khi xuất bản chính thức, doanh nghiệp cần cung cấp hoặc xác nhận:

- Logo chính thức.
- Ảnh sản phẩm và thông số sản phẩm thực tế.
- Thương hiệu đang phân phối.
- Giá bán nếu muốn công khai.
- Ảnh và nội dung dự án thật.
- Nội dung quy trình tư vấn.
- Đường dẫn Zalo chính thức nếu muốn hiển thị.
- Ảnh Open Graph chính thức.
- Cơ chế tiếp nhận biểu mẫu nếu muốn nhận yêu cầu online.

Website tham khảo `congnghequynhon.com` không thể truy cập từ môi trường này do lỗi phân giải tên miền tại thời điểm kiểm tra. Cấu trúc được thiết kế độc lập theo yêu cầu đã duyệt, không sao chép nội dung hoặc tài sản thương hiệu.

`hagsolar.vn` truy cập được tại thời điểm kiểm tra. Website Hưng Phát chỉ lấy cảm hứng từ hệ thống màu tối, nhịp bố cục và cách phân cấp điều hướng; toàn bộ nội dung và nhận diện vẫn là của HƯNG PHÁT TECH.
