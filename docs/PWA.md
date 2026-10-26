# Monee PWA — dùng trên iPhone không cần Apple Developer

## Trạng thái

Code và lệnh build PWA đã được bổ sung. Chưa deploy website, đăng ký hosting, tạo tài khoản hoặc cấp tên miền. `dist/` là bản build được tạo trên máy, không phải URL công khai. Không thay SQLite native hay xóa dữ liệu Expo Go.

## Chạy trên máy tính

```powershell
npm ci
npm run build:web
npm run preview:web
```

Mở `http://localhost:4173`. Bản production preview mới cài service worker; `npx expo start --web` chỉ dành cho lập trình, không phải bản cài offline. HTTP localhost là ngoại lệ dùng để test; mở IP LAN bằng HTTP trên iPhone không đủ để cài offline. Dùng URL HTTPS khi triển khai thật.

## Đưa lên hosting HTTPS

Có thể upload thư mục `dist/` bằng **Cloudflare Pages Direct Upload**. Trong dashboard của tài khoản của bạn, tạo Pages project theo luồng Direct Upload, chọn tên project và upload nội dung `dist/`. Chưa cần domain riêng. Quyền tài khoản, gói sử dụng và giới hạn hosting do bạn kiểm tra trước khi publish.

- Luôn chạy `npm run build:web`, không chỉ chạy `expo export`: bước sau export tạo icon, hoàn thiện HTML và tạo `sw.js` với danh sách tệp đúng bản build.
- Upload cả `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, `_expo/`, `assets/`, `favicon.ico` và `_headers` ở gốc website. Không đặt app dưới một subpath: bản này dùng scope `/`.
- Host phải trả MIME `application/wasm` cho `.wasm`, JavaScript cho `.js`, và trả `index.html` cho đường dẫn app như `/accounts` khi file tĩnh không tồn tại. Cloudflare Pages có SPA fallback khi không có `404.html` ở gốc. Không rewrite asset/WASM bị thiếu thành HTML.
- `_headers` có chính sách không cache dài cho `sw.js` và HTML. Nếu dùng host khác, cấu hình tương đương. Cơ chế SQLite + IndexedDB không yêu cầu header COOP/COEP.
- Chỉ upload tài nguyên app. **Không đưa file backup, `.env`, khóa, dữ liệu người dùng, SQLite cá nhân hoặc thư mục source/test lên hosting.** Không deploy `test-results/`.
- Không đổi origin/domain tùy tiện: dữ liệu trình duyệt gắn với origin. Muốn chuyển domain phải xuất/nhập backup trước; domain mới sẽ có kho dữ liệu riêng.

Tài liệu: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [headers](https://developers.cloudflare.com/pages/configuration/headers/), [SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Cài trên iPhone

1. Mở URL HTTPS trong Safari thông thường, không dùng tab riêng tư hoặc trình duyệt trong ứng dụng chat.
2. Chọn Chia sẻ → Thêm vào màn hình chính → Mở dưới dạng ứng dụng nếu có.
3. Mở Monee từ icon mới. Vào Ví → Sao lưu & cài ứng dụng.
4. Giữ mạng đến khi trạng thái là **Sẵn sàng offline**. Lần đầu chưa tải xong thì chưa dùng offline được.
5. Thử bật chế độ máy bay, đóng/mở lại và kiểm tra đọc/ghi dữ liệu. Kiểm tra này vẫn cần làm trên iPhone thật trước khi dùng làm sổ tiền chính.

Safari, PWA cài riêng, Expo Go và app native có thể có các vùng lưu trữ khác nhau. Xuất từ nơi đang có dữ liệu rồi nhập vào nơi muốn sử dụng. Cài icon trước, chọn một nơi dùng hằng ngày; không giả định Safari và icon luôn dùng chung dữ liệu.

## Cách lưu và bảo vệ dữ liệu

- Native vẫn dùng `expo-sqlite`, file `monee.db`; schema v4 thêm mã ngân hàng/ví tùy chọn và giữ nguyên dữ liệu cũ.
- Web dùng SQLite WASM (`sql.js`, chỉ bundle vào web) và lưu ảnh DB vào IndexedDB `monee-finance` / store `snapshots` / key `finance`. Dùng cùng schema, migration và repository, không viết lại phép tính tiền.
- Một thao tác chỉ thành công sau khi transaction IndexedDB báo `complete`. Nếu SQL hoặc ghi bộ nhớ lỗi, ảnh DB trước đó được phục hồi trong phiên hiện tại và bản lưu cũ vẫn còn. Không có fallback “lưu tạm thành công” khi bộ nhớ trình duyệt lỗi.
- Có kiểm tra revision trong cùng transaction IndexedDB. Tab cũ không ghi đè được dữ liệu mới của tab khác; app yêu cầu tải lại. Khi thấy cảnh báo, giữ nội dung chưa lưu rồi reload, không bấm lưu lặp lại.
- Bản ảnh SQLite được xuất đầy đủ mỗi lần ghi. Phù hợp dữ liệu cá nhân; chưa tối ưu cho lịch sử cực lớn hoặc nhiều người cùng ghi. Không có đồng bộ account/server.
- Web yêu cầu IndexedDB và WebAssembly; nếu không hỗ trợ hoặc không mở được DB, app hiển thị hướng dẫn, không tự reset.
- “Yêu cầu giữ dữ liệu” gọi API lưu trữ bền vững nếu có, không đảm bảo trình duyệt cấp quyền. Xóa dữ liệu website, đổi origin, gỡ app hoặc hệ điều hành dọn dữ liệu vẫn có thể làm mất lịch sử. **Backup ngoài app là bắt buộc.**

## Sao lưu và khôi phục

- Ví → Sao lưu & cài ứng dụng → Xuất bản sao lưu. Web tải JSON; native/Expo Go mở bảng chia sẻ để lưu vào Tệp/iCloud. Hủy bảng chia sẻ không có nghĩa đã lưu backup.
- File không mã hóa, chứa số dư/tên ví/lịch sử; chỉ lưu ở nơi riêng tư. Không chứa mật khẩu, OTP, token, tài khoản đăng nhập hay device ID.
- Backup v1 chỉ giữ dữ liệu tài chính đang hoạt động, kỳ lương và số dư gốc; không phải bản sao toàn bộ trạng thái đồng bộ/tombstone. Các ví khôi phục ở trạng thái local. Hồ sơ đang liên kết đồng bộ không được restore theo luồng local này.
- Chọn tệp → kiểm tra ngày/số lượng → đọc cảnh báo → xác nhận đã giữ bản sao hiện tại → Xác nhận thay thế dữ liệu. Chỉ lúc xác nhận mới xóa/thay dữ liệu local trong một transaction; không chạm ngân hàng hay hồ sơ khác.
- File sai phiên bản, hơn 10 MB, trùng ID, tham chiếu ví không tồn tại hoặc số dư không khớp bị từ chối. Sau restore, tải lại báo cáo. Chưa có nút hoàn tác nếu không giữ bản sao trước đó.

## Offline và cập nhật

Service worker chỉ cache danh sách asset của bản build. Không cache API, request ghi, URL ngoài origin hay file backup. Tất cả asset phải tải thành công mới kích hoạt bản offline. Khi update, giữ shell mới và shell trước đó; không xóa IndexedDB.

Không tự `skipWaiting` hoặc reload khi bạn đang nhập. Vào màn Sao lưu & cài ứng dụng để chủ động cập nhật. Cần mạng để kiểm tra/tải bản mới; các giao dịch đang lưu trên máy không cần mạng.

## Kiểm thử

```powershell
npm test
npx tsc --noEmit
npx expo lint
npx expo-doctor
npm run build:web
npx playwright install chromium webkit
npm run test:pwa
```

Nếu đã tải browser ở đường dẫn khác, đặt `PLAYWRIGHT_BROWSERS_PATH` tương ứng. Playwright dùng port 4174 và profile tách biệt, chỉ dữ liệu giả. Kiểm tra bundle native bằng `npx expo export --platform ios --output-dir dist-ios`.

Test trình duyệt không thay thế cài Home Screen và thử đóng/mở, máy bay, thiếu dung lượng, tải/chọn tệp trong Safari trên iPhone thật. Trước khi deploy phải kiểm tra origin HTTPS, MIME WASM, cache headers và deep link trên host thực tế.

Các dependency mới: `sql.js` + type phục vụ DB web; `expo-file-system`, `expo-sharing`, `expo-document-picker` phục vụ backup native; Playwright phục vụ kiểm thử trình duyệt. Không có backend hay dịch vụ trả phí được tạo.
