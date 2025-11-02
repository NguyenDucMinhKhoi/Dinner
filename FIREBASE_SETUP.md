# 🔥 Firebase Phone Authentication Setup

## ✅ Đã hoàn thành:

1. ✅ Cài đặt Firebase SDK (`firebase` package)
2. ✅ Tạo Firebase config trong `src/api/firebase.ts`
3. ✅ Implement Firebase Phone Auth trong `src/api/firebase-otp.ts`
4. ✅ Cập nhật UI để support reCAPTCHA
5. ✅ Thêm Firebase credentials vào `.env.development`

---

## 🚀 Bước tiếp theo - Enable Phone Authentication:

### **Bước 1: Truy cập Firebase Console**

1. Mở: https://console.firebase.google.com/project/dinner-a1ec0/authentication/providers
2. Đăng nhập với tài khoản Google của bạn

### **Bước 2: Enable Phone Authentication**

1. Trong tab **"Sign-in method"**
2. Tìm **"Phone"** trong danh sách providers
3. Click vào **"Phone"**
4. Toggle **"Enable"** → ON
5. Click **"Save"**

### **Bước 3: Test trên Web**

```bash
# Run app on web
npx expo start

# Press 'w' to open in browser
```

**Lưu ý:**

- Phone Auth với reCAPTCHA **chỉ hoạt động trên web**
- Trên React Native/Expo mobile cần sử dụng **Firebase Cloud Functions** (phức tạp hơn)

---

## 📱 Cách hoạt động:

### **1. Send OTP:**

```typescript
await sendOtp("+84765362207");
```

- Firebase hiển thị invisible reCAPTCHA
- Sau khi verify reCAPTCHA → gửi SMS thật
- User nhận OTP qua điện thoại

### **2. Verify OTP:**

```typescript
await verifyOtp("+84765362207", "123456");
```

- Verify mã OTP với Firebase
- Nếu đúng → trả về Firebase user
- Sau đó tạo Supabase session

---

## ⚠️ Giới hạn Firebase Phone Auth:

### **Free Tier (Spark Plan):**

- ✅ **10,000 verifications/tháng** - MIỄN PHÍ
- ✅ Unlimited phone numbers
- ✅ Worldwide SMS support

### **Paid Tier (Blaze Plan):**

- 💰 **$0.06/verification** sau 10K
- Cần thêm billing account

---

## 🌍 Test với số điện thoại Việt Nam:

```typescript
// Số VN phải có format E.164
"+84765362207"; // ✅ Đúng
"0765362207"; // ❌ Sai (thiếu +84)
"+84 765 362 207"; // ❌ Sai (có khoảng trắng)
```

---

## 🔧 Development vs Production:

### **Development (Web):**

- reCAPTCHA verification
- Real SMS qua Firebase
- Test với số điện thoại thật

### **Production (Mobile):**

- **Cần Firebase Cloud Functions** hoặc
- **Sử dụng service khác** (Twilio, etc.)

---

## 📝 Next Steps:

1. **Enable Phone Auth** trong Firebase Console (theo hướng dẫn trên)
2. **Test trên web browser** (`npx expo start` → press `w`)
3. **Nhập số điện thoại** → Send OTP
4. **Kiểm tra SMS** trên điện thoại
5. **Nhập OTP** → Verify thành công!

---

## ❓ Troubleshooting:

### Lỗi: "reCAPTCHA container not found"

- **Nguyên nhân:** Chưa tạo container trong DOM
- **Giải pháp:** Container đã được tạo tự động trong `phone-signup.tsx` và `phone-login.tsx`

### Lỗi: "Phone authentication is not enabled"

- **Nguyên nhân:** Chưa enable Phone Auth trong Firebase Console
- **Giải pháp:** Follow **Bước 2** ở trên

### Lỗi: "Invalid phone number"

- **Nguyên nhân:** Số điện thoại không đúng format E.164
- **Giải pháp:** Phải có `+84` ở đầu, không có khoảng trắng

### SMS không gửi về

- **Nguyên nhân:**
  - Số điện thoại không hợp lệ
  - Vượt quá 10K verifications/tháng (free tier)
  - Network issue
- **Giải pháp:** Kiểm tra Firebase Console logs

---

## 🎉 Kết luận:

Bạn đã setup xong **Firebase Phone Authentication**!

Chỉ cần **enable Phone Auth trong Firebase Console** và test thôi! 🚀
