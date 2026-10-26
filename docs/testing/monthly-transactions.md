# Tổng quan theo tháng và quản lý giao dịch

## Phạm vi

Tổng quan dùng dữ liệu SQLite thật, chọn tháng, biểu đồ chi tiêu tối đa 7 ngày trong tháng. Danh sách giao dịch có cùng bộ lọc tháng, tìm kiếm và mở chi tiết. Chỉ giao dịch thu/chi nhập thủ công được sửa/xóa. Không thêm đồng bộ ngân hàng, chuyển tiền, đăng nhập hoặc ngân sách thật.

Không đổi schema v3 và không reset dữ liệu. Xóa giao dịch giữ tombstone cho đồng bộ tương lai; hiện chưa có khôi phục trong app.

## Kiểm tra tự động

- `npm test`: SQLite thật trong bộ nhớ qua adapter; kiểm tra thay đổi số dư, chuyển ví khi sửa, đổi thu/chi, xóa lặp/đồng thời, quyền sở hữu, rollback, trùng lương, số tiền sát giới hạn và báo cáo qua ranh giới tháng.
- `tests/finance-summary.test.cjs`: tháng theo lịch địa phương, tiền chuyển ví không vào tổng thu/chi, kỳ lương độc lập ngày nhận, tháng trống và ngày cuối tháng nhuận.
- `tests/transaction-form.test.cjs`: sửa tên không thay đổi thời điểm giao dịch; parse ngày và số tiền đúng.
- `npx tsc --noEmit`, `npx expo lint`, `npx expo export --platform ios`: typecheck, lint, bundle. Không thay thế kiểm thử thao tác trên iPhone.
- Có thể chạy kiểm tra fallback web bằng PowerShell: `$env:TEST_PLATFORM='web'` rồi `npm test`; sau đó `Remove-Item Env:TEST_PLATFORM`.

## Checklist iPhone / web (chưa thực hiện tự động)

- [ ] Không có dữ liệu: thu/chi/chênh lệch bằng 0; không có ngân sách 12 triệu, tỷ lệ tăng 8,4% hoặc cột biểu đồ mẫu trên Tổng quan.
- [ ] Đổi tháng qua tháng 12 → tháng 1, tháng nhuận, về tháng hiện tại. Tổng số dư hiện tại không đổi chỉ vì đổi tháng.
- [ ] Ngày trên đầu Tổng quan đúng ngày máy; quay lại app/màn sau khi qua ngày hoặc tháng mới thì cập nhật.
- [ ] Tạo ví A số dư 1.000.000, ví B số dư 2.000.000. Chi 50.000 từ A → A còn 950.000; Tổng quan và danh sách hiện đúng khoản chi.
- [ ] Chạm khoản chi từ Tổng quan hoặc tab Giao dịch: thấy số tiền, ví, danh mục, ngày, nguồn và ghi chú đúng.
- [ ] Sửa khoản chi thành 80.000 → A còn 920.000. Sửa tên/ghi chú hoặc lưu lại cùng giá trị không thay đổi số dư lần nữa.
- [ ] Đổi khoản chi 80.000 từ A sang B → A về 1.000.000, B còn 1.920.000. Đây là sửa nơi chi, không phải giao dịch chuyển tiền.
- [ ] Đổi khoản đó thành thu 100.000 tại B → B thành 2.100.000; tổng thu/chi thay đổi đúng.
- [ ] Sửa ngày sang tháng khác: khoản đó chuyển khỏi báo cáo tháng cũ, xuất hiện ở tháng mới; số dư không đổi khi chỉ sửa ngày.
- [ ] Chỉ sửa tên một giao dịch gần ranh giới ngày/tháng: thời điểm và tháng của giao dịch không bị chuyển sang giữa trưa.
- [ ] Lương của tháng trước nhưng nhận tháng này: báo cáo thu nằm ở tháng nhận. Sửa kỳ lương không đổi báo cáo nếu ngày nhận không đổi.
- [ ] Sửa lương hiện có không tự báo trùng chính nó. Chọn kỳ lương đã có ở giao dịch khác → báo lỗi, không đổi số dư. Xóa lương rồi ghi lại cùng kỳ được phép.
- [ ] Lương đã nằm trong số dư: tăng tiền lương 100.000 chỉ tăng ví 100.000; xóa sẽ trừ toàn bộ khoản lương đã ghi, đúng lời giải thích trên form.
- [ ] Nhập 0, số âm, số lẻ, tên rỗng, ngày không có thật, kỳ lương rỗng/sai hoặc ngày nhận lương tương lai: báo lỗi, không lưu.
- [ ] Bấm Xóa → Hủy: dữ liệu không đổi. Xác nhận: khoản thu được trừ khỏi ví, khoản chi được hoàn vào ví; báo cáo và danh sách cập nhật ngay.
- [ ] Bấm lưu/xóa liên tiếp: chỉ một thao tác chạy; nút/back bị khóa khi đang lưu. Đóng/mở app vẫn giữ kết quả.
- [ ] Tìm theo tên, ghi chú, tên ví, danh mục tiếng Việt; kết hợp lọc thu/chi và tháng. “Xem tất cả” từ Tổng quan mở đúng tháng, kể cả tab danh sách đã mở từ trước.
- [ ] URL tháng sai hoặc ID thiếu/đã xóa: không crash. Giao dịch nhập từ bên ngoài/chuyển tiền chỉ hiển thị chi tiết, không có sửa/xóa.
- [ ] Tháng trống hoặc 7 ngày không chi tiêu: cột bằng 0. Đầu tháng không lấy khoản chi từ tháng trước; tháng cũ hiển thị các ngày cuối tháng.
- [ ] Ngắt mạng: xem/thêm/sửa/xóa vẫn hoạt động sau khi tải bundle. Nếu đọc DB lỗi sau khi lưu: hiện cảnh báo và nút thử tải lại, không yêu cầu nhập lại để tránh cộng trùng.
- [ ] Kiểm tra bàn phím, font lớn, nhãn đọc màn hình và nút chạm tối thiểu 44pt trên iPhone. Kiểm tra xác nhận xóa cũng hoạt động trên web.

## Còn lại

Ngân sách ở tab Ngân sách vẫn là dữ liệu giao diện mẫu. Chuyển tiền thật giữa hai ví, khôi phục giao dịch đã xóa, sao lưu/import và liên kết ngân hàng chưa thuộc thay đổi này.
