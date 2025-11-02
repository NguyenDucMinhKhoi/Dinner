# 🔧 Fix reCAPTCHA Enterprise Error

## ❌ **Lỗi gặp phải:**

```
Failed to initialize reCAPTCHA Enterprise config.
Triggering the reCAPTCHA v2 verification.
```

---

## ✅ **Đã sửa:**

### **1. Cập nhật firebase-otp.ts**

- Dùng **reCAPTCHA v2** thông thường (không phải Enterprise)
- Development mode: **visible** reCAPTCHA (dễ debug)
- Production mode: **invisible** reCAPTCHA

### **2. Cập nhật UI (phone-signup & phone-login)**

- Container reCAPTCHA được tạo ở góc phải-dưới màn hình
- Auto cleanup khi component unmount
- Z-index cao để hiển thị trên UI

### **3. Cập nhật firebase.ts**

- Thêm config để tránh lỗi reCAPTCHA Enterprise

---

## 🎯 **Cách test:**

### **Bước 1: Refresh browser**

```bash
# Trong browser, nhấn Ctrl+R hoặc Cmd+R để reload
```

### **Bước 2: Open browser console**

```bash
# Nhấn F12 để mở DevTools
# Tab Console để xem logs
```

### **Bước 3: Test send OTP**

1. Nhập số điện thoại: `+84765362207`
2. Click **"Send OTP"**
3. **Quan sát:**
   - Console log: `🔧 reCAPTCHA initialized: visible`
   - Góc phải-dưới: reCAPTCHA widget xuất hiện
   - Tick vào checkbox "I'm not a robot"
   - SMS gửi về điện thoại

### **Bước 4: Kiểm tra console logs**

**Logs thành công:**

```
🔧 reCAPTCHA initialized: visible
🔥 Firebase: Sending OTP to +84765362207
✅ reCAPTCHA verified successfully
✅ Firebase: OTP sent successfully
```

**Logs lỗi (nếu có):**

```
❌ Failed to initialize reCAPTCHA: [error details]
❌ Firebase sendOTP error: [error details]
```

---

## 🔍 **Troubleshooting:**

### **1. Lỗi: "reCAPTCHA container not found"**

**Nguyên nhân:** Container chưa được tạo trong DOM

**Giải pháp:**

- Đã fix: Container tự động tạo trong `useEffect`
- Refresh browser và thử lại

---

### **2. Lỗi: "Firebase Phone Auth not enabled"**

**Nguyên nhân:** Chưa enable Phone Auth trong Firebase Console

**Giải pháp:**

1. Truy cập: https://console.firebase.google.com/project/dinner-a1ec0/authentication/providers
2. Click **"Phone"**
3. Toggle **"Enable"** → ON
4. Click **"Save"**

---

### **3. reCAPTCHA không hiển thị**

**Nguyên nhân:** CSS hoặc z-index bị che khuất

**Giải pháp:**

- Container đã được style với `position: fixed` và `z-index: 9999`
- Kiểm tra góc phải-dưới màn hình
- Scroll xuống nếu cần

---

### **4. Lỗi: "Invalid phone number"**

**Nguyên nhân:** Format số điện thoại không đúng

**Giải pháp:**

```typescript
// ✅ Đúng
"+84765362207";

// ❌ Sai
"0765362207"; // Thiếu +84
"+84 765 362 207"; // Có khoảng trắng
"84765362207"; // Thiếu dấu +
```

---

### **5. SMS không gửi về**

**Nguyên nhân:**

- Số điện thoại không hợp lệ
- Firebase quota hết (10K/tháng)
- Network issue

**Giải pháp:**

1. Kiểm tra số điện thoại có đúng không
2. Kiểm tra Firebase Console > Usage
3. Thử số điện thoại khác

---

## 📱 **Development vs Production:**

### **Development Mode:**

```typescript
// reCAPTCHA: visible (dễ test)
size: "normal";
```

- reCAPTCHA hiển thị checkbox
- User phải tick "I'm not a robot"
- Dễ debug và test

### **Production Mode:**

```typescript
// reCAPTCHA: invisible (UX tốt)
size: "invisible";
```

- reCAPTCHA tự động verify
- Không cần user tương tác
- Chỉ hiện khi nghi ngờ bot

---

## 🎉 **Kết luận:**

Đã fix xong lỗi reCAPTCHA Enterprise! Bây giờ:

1. ✅ Dùng reCAPTCHA v2 thông thường
2. ✅ Development mode hiển thị reCAPTCHA rõ ràng
3. ✅ Production mode invisible, UX tốt
4. ✅ Auto cleanup khi unmount

**Next step:** Enable Phone Auth trong Firebase Console và test! 🚀
