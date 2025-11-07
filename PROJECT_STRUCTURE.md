# Hệ thống Kiểm tra Đồ án Sinh viên 🎓

Hệ thống quản lý và kiểm tra đồ án sinh viên với tính năng phát hiện trùng lặp. Giao diện hiện đại với màu cam chủ đạo.

## 🚀 Tính năng

### Đã hoàn thành:
- ✅ Đăng nhập / Đăng ký với giao diện màu cam
- ✅ Phân quyền (Mentor / Sinh viên)
- ✅ Protected Routes (Bảo vệ các route cần đăng nhập)
- ✅ Navbar hiện đại với điều hướng
- ✅ Homepage với dashboard và quick actions
- ✅ Trang Nộp đề tài (Submit) - Cho sinh viên
- ✅ Trang Duyệt đề tài (Review) - Cho mentor
- ✅ Trang Lịch đồ án (Schedule) - Calendar view
- ✅ Giao diện hiển thị danh sách đồ án
- ✅ Hiển thị độ trùng lặp với circular progress
- ✅ Quản lý trạng thái (Chờ duyệt / Đã duyệt / Từ chối)
- ✅ Drag & drop file upload
- ✅ Responsive design

### Sẽ phát triển:
- 🔄 API Backend integration
- 🔄 Thuật toán kiểm tra trùng lặp (Plagiarism detection)
- 🔄 Chi tiết đồ án với comments
- 🔄 Hệ thống notification realtime
- 🔄 Export reports
- 🔄 Analytics dashboard

## 📁 Cấu trúc dự án

```
src/
├── assets/                     # Static assets (images, icons)
├── components/
│   ├── Layout.tsx              # Layout wrapper với Navbar
│   ├── Navbar.tsx              # Navigation bar
│   ├── ProtectedRoute.tsx      # Component bảo vệ route cần auth
│   ├── RoleBasedRoute.tsx      # Component phân quyền theo role
│   └── ui/                     # Shadcn/ui components
├── contexts/
│   └── AuthContext.tsx         # Context quản lý authentication
├── hooks/
│   └── use-toast.ts            # Toast notification hook
├── interfaces/
│   └── index.ts                # TypeScript interfaces & types
├── lib/
│   └── utils.ts                # Utility functions
├── pages/
│   ├── auth/                   # 🔐 Authentication pages
│   │   ├── LoginPage.tsx       # Trang đăng nhập
│   │   ├── RegisterPage.tsx    # Trang đăng ký
│   │   └── index.ts            # Exports
│   ├── admin/                  # 👨‍💼 Admin pages
│   │   ├── AdminPage.tsx       # Duyệt đề tài cuối cùng
│   │   ├── AllProposalsPage.tsx # Xem tất cả proposals
│   │   └── index.ts            # Exports
│   ├── mentor/                 # 👨‍🏫 Mentor/Lecturer pages
│   │   ├── HomePage.tsx        # Dashboard cho mentor
│   │   ├── SubmitPage.tsx      # Nộp đề tài
│   │   ├── MentorResourcesPage.tsx # Tài nguyên
│   │   ├── SchedulePage.tsx    # Lịch đồ án
│   │   └── index.ts            # Exports
│   ├── shared/                 # 🔄 Shared pages (all roles)
│   │   ├── ProposalHistoryPage.tsx # Xem lịch sử proposal
│   │   └── index.ts            # Exports
│   └── index.ts                # Main export file
├── services/
│   ├── api.ts                  # API client & endpoints
│   └── authService.ts          # Authentication service
├── stores/
│   └── exampleStore.ts         # State management (nếu cần)
├── App.tsx                     # Main App với routing
└── main.tsx                    # Entry point
```

## 🛠️ Công nghệ sử dụng

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📦 Cài đặt và Chạy

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Chạy development server:
```bash
npm run dev
```

### 3. Truy cập:
Mở trình duyệt tại: `http://localhost:5173`

## 🔐 Thông tin đăng nhập test

Hiện tại hệ thống sử dụng mock data, bạn có thể đăng nhập với bất kỳ email/password nào.

**Ví dụ:**
- Email: `mentor@example.com` / `student@example.com`
- Password: `123456`

## 🎯 Luồng sử dụng

### Với Sinh viên:
1. Đăng ký tài khoản với vai trò "Sinh viên"
2. Đăng nhập vào hệ thống
3. Xem dashboard với tổng quan đồ án
4. Chọn "Nộp đề tài" từ navbar hoặc quick actions
5. Điền thông tin và upload file đồ án (drag & drop hoặc chọn file)
6. Xem trạng thái đồ án (Chờ duyệt / Đã duyệt / Từ chối)
7. Xem độ trùng lặp của đồ án
8. Quản lý lịch trình trong "Lịch đồ án"

### Với Mentor:
1. Đăng ký tài khoản với vai trò "Mentor"
2. Đăng nhập vào hệ thống
3. Xem dashboard với số liệu thống kê
4. Chọn "Duyệt đề tài" từ navbar
5. Xem danh sách đề tài theo trạng thái (filter)
6. Kiểm tra độ trùng lặp với circular progress indicator
7. Xem chi tiết đề tài trong modal
8. Duyệt hoặc từ chối đồ án
9. Quản lý lịch họp với sinh viên

## 📱 Responsive Design

Giao diện được thiết kế responsive, hoạt động tốt trên:
- 📱 Mobile
- 💻 Tablet
- 🖥️ Desktop

## 🎨 UI/UX Features

### Màu sắc:
- 🟠 **Màu cam chủ đạo** (Orange 500-600) - Brand color
- Gradient backgrounds đẹp mắt
- Border accents với màu cam

### Components:
- **Navbar**: Logo SBA + 3 menu chính + User info + Logout
- **Cards**: Shadow effects với border-top màu cam
- **Buttons**: Gradient orange với hover effects
- **Badges**: Color-coded status indicators
- **Circular Progress**: Hiển thị độ trùng lặp
- **Calendar**: Interactive calendar view
- **Modal**: Chi tiết đề tài với overlay
- **Drag & Drop**: Upload area với visual feedback

### Interactions:
- Loading states
- Error handling & validation
- Form validation
- Hover effects & transitions
- Scale animations trên buttons
- Responsive design (Mobile/Tablet/Desktop)

## 🔜 Các bước tiếp theo

1. **Backend API Integration:**
   - Tạo backend API với Node.js/Express
   - Database (MongoDB/PostgreSQL)
   - JWT Authentication

2. **Upload & Storage:**
   - File upload functionality
   - Cloud storage (AWS S3/Firebase)
   - File type validation

3. **Plagiarism Detection:**
   - Thuật toán so sánh code
   - Text similarity algorithms
   - Integration với tools như MOSS

4. **Advanced Features:**
   - Email notifications
   - Real-time updates
   - Advanced filtering & search
   - Analytics dashboard
   - Export reports

## 📝 Notes

- Hiện tại authentication data được lưu trong localStorage
- Mock data được sử dụng cho danh sách đồ án
- Cần thay thế bằng API calls thực tế trong production

---

**Created with ❤️ for SBA Capstone Project**
