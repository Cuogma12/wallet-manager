# Kiểm thử ngân sách thật

## Phạm vi

Hạn mức theo danh mục/tháng, cộng chi thực tế từ tất cả ví, hoạt động offline. Cảnh báo trong app ở 80% / 100% / vượt 100%, không có push notification. Không tự lặp lại hoặc chuyển dư sang tháng sau. DB v5 và backup v2; vẫn nhận backup v1 với cảnh báo xóa hạn mức.

## Tự động

- `npm test`: migration v4 → v5, rollback/retry, CRUD, trùng hạn mức và thao tác đồng thời, profile khác, tombstone, tháng theo giờ máy, tính tiền chính xác, sửa/xóa khoản chi, backup v1/v2 và reset/restore atomic.
- `npm run test:pwa`: Chromium + WebKit, màn rộng 320px, thêm/sửa/xóa, hủy xóa, lỗi số tiền/trùng danh mục, đổi tháng, 80/100/120%, giữ số dư, reload/offline và khôi phục ngân sách từ file tải về.
- `npx tsc --noEmit`, `npx expo lint`, `npm run build:web`, export iOS.

## Thủ công trên iPhone thật (chưa thực hiện)

- [ ] Xuất backup trước khi cập nhật app cũ. Migration giữ nguyên ví, lịch sử và số dư; tab Ngân sách chưa có hạn mức mẫu.
- [ ] Tạo hạn mức Ăn uống 100.000; nhập 80.000/100.000/120.000 tổng chi để kiểm tra trạng thái, phần còn lại/vượt và thanh tiến độ không tràn.
- [ ] Thu nhập/chuyển tiền/dữ liệu mẫu không cộng vào chi ngân sách. Khoản chi danh mục chưa đặt hạn mức hiển thị riêng.
- [ ] Sửa khoản chi (tiền/danh mục/ngày), chuyển tháng, xóa giao dịch: hạn mức tương ứng cập nhật; không cần tạo lại.
- [ ] Thử trùng danh mục/tháng, số 0/âm/thập phân/quá lớn; nhập `3.000.000` hợp lệ. Bấm lưu nhanh không tạo trùng.
- [ ] Đổi tháng bằng nút, không tự sao chép hạn mức. Đang nhập hoặc xác nhận xóa thì khóa chuyển tháng.
- [ ] Bàn phím mở không đẩy input ra ngoài màn hình; cuộn tới Lưu/Hủy. Nút sửa/xóa dễ chạm, có nhãn đọc màn hình.
- [ ] Hủy sửa/xóa không thay dữ liệu. Xóa hạn mức không xóa khoản chi hoặc thay số dư; khoản chi sang nhóm chưa có hạn mức.
- [ ] Cài PWA, chờ sẵn sàng offline rồi bật máy bay, tạo/sửa/xóa, đóng/mở lại: dữ liệu vẫn còn.
- [ ] Xuất backup v2, thay hạn mức rồi nhập lại: kiểm tra số lượng, xác nhận riêng, khôi phục đúng ID/hạn mức/tháng. Tệp sai không làm mất dữ liệu.
- [ ] Chọn backup v1: có cảnh báo không chứa ngân sách. Hủy giữ nguyên; xác nhận thay thế xóa hạn mức hiện tại theo cảnh báo.
- [ ] Reset toàn bộ có cảnh báo xóa ngân sách; hủy không thay dữ liệu. Chỉ xác nhận trên hồ sơ test đã sao lưu.

Không dùng dữ liệu tiền thật cho test reset/restore. Test trình duyệt và export bundle không thay thế kiểm thử thiết bị thật.
