/*
 * ====================== تهيئة SMTP ======================
 * عشان البريد يشتغل من المتصفح مباشرة من غير سيرفر
 *
 * الخطوات:
 * 1- فعّلي التحقق بخطوتين في Google Account بتاعك
 *    https://myaccount.google.com/security
 * 2- اعملي App Password (ابحثي في Google عن "App Passwords")
 * 3- اختاري Mail > Device وانسخي الـ16 حرف
 * 4- حطيهم تحت في PASSWORD
 * ===================================================== */

const SMTP_CONFIG = {
  HOST: "smtp.gmail.com",
  PORT: 587,
  USERNAME: "eltaroon1082000@gmail.com",
  PASSWORD: "njdrmflswjvcvmmy",
};

const RECEIVER_EMAIL = "eltaroon1082000@gmail.com";

/* ===== Send Email via SMTP.js ===== */
async function sendEmail(messageText, urgent = false) {
  const subject = urgent
    ? "🔴 [مهم] همسة - رسالة مستعجلة"
    : "💜 همسة - رسالة من قلب";

  const body = `
    <div dir="rtl" style="font-family:Tahoma,Arial;padding:20px">
      <h2 style="color:#d4819a">💜 همسة</h2>
      <p style="color:#666;font-size:14px">${urgent ? "🔴 رسالة مهمة - مستعجلة" : "رسالة عادية"}</p>
      <hr style="border:0;border-top:1px solid #f0e0e6">
      <p style="font-size:16px;color:#3d2c33;line-height:1.9">${messageText}</p>
      <hr style="border:0;border-top:1px solid #f0e0e6">
      <p style="color:#999;font-size:12px">🕐 ${new Date().toLocaleString("ar-EG")}</p>
    </div>
  `;

  // لو المفاتيح فاضية → ورّي المستخدم التعليمات
  if (!SMTP_CONFIG.USERNAME || SMTP_CONFIG.USERNAME === "بريدك@gmail.com") {
    Swal.close();
    await Swal.fire({
      icon: "info",
      title: "يلزم تهيئة البريد",
      html: `<div style="text-align:right;line-height:2">
        <p>عشان يشتغل الإيميل، افتحي ملف<br>
        <code>js/main.js</code> وحطي:</p>
        <ol style="padding-right:20px">
          <li>بريدك في <code>USERNAME</code></li>
          <li>App Password في <code>PASSWORD</code></li>
        </ol>
        <p style="font-size:13px;color:#999">
          ⭐ لازم تفعلي التحقق بخطوتين في Google<br>
          وبعدين Generate App Password من<br>
          <a href="https://myaccount.google.com/apppasswords" target="_blank" style="color:#d4819a">
            myaccount.google.com/apppasswords
          </a>
        </p>
      </div>`,
      confirmButtonText: "فهمت 🫡",
      confirmButtonColor: "#d4819a",
    });
    return;
  }

  showSendingProgress();

  try {
    const response = await Email.send({
      SecureToken: "", // مش محتاجين secure token (بنستخدم مباشر)
      Host: SMTP_CONFIG.HOST,
      Port: SMTP_CONFIG.PORT,
      Username: SMTP_CONFIG.USERNAME,
      Password: SMTP_CONFIG.PASSWORD,
      To: RECEIVER_EMAIL,
      From: SMTP_CONFIG.USERNAME,
      Subject: subject,
      Body: body,
    });

    Swal.close();

    if (response === "OK") {
      await Swal.fire({
        icon: "success",
        title: "تم الإرسال ✅",
        text: "رسالتك وصلت لشريكك .. هو هيفهم ♥",
        confirmButtonText: "تسلم ❤️",
        confirmButtonColor: "#d4819a",
        timer: 4000,
        timerProgressBar: true,
      });
    } else {
      throw new Error(response || "Send failed");
    }
  } catch (error) {
    console.error("SMTP Error:", error);
    Swal.close();

    const subjectEnc = encodeURIComponent(
      urgent ? "🔴 [مهم] همسة - رسالة مستعجلة" : "💜 همسة - رسالة",
    );
    const bodyEnc = encodeURIComponent(messageText);
    const mailtoHref = `mailto:${RECEIVER_EMAIL}?subject=${subjectEnc}&body=${bodyEnc}`;

    await Swal.fire({
      icon: "error",
      title: "فشل الإرسال 😢",
      html: `<div style="text-align:right">
        <p>ممكن كلمة سر التطبيق غلط أو البريد مش مضبوط.</p>
        <p>جربي البديل:</p>
        <a href="${mailtoHref}" class="btn btn-custom-msg" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;margin:8px 0">
          <i class="fas fa-envelope"></i> افتحي Gmail يدوي
        </a>
      </div>`,
      confirmButtonText: "حاضر",
      confirmButtonColor: "#d4819a",
    });
  }
}

/* ===== Card Clicks ===== */
document.querySelectorAll(".msg-card").forEach((card) => {
  card.addEventListener("click", function () {
    const message = this.dataset.message;

    Swal.fire({
      icon: "question",
      title: "تأكدي من رسالتك؟",
      html: `<div style="font-size:1.2rem;font-weight:600;color:#3d2c33;margin:10px 0;">"${message}"</div>`,
      showCancelButton: true,
      confirmButtonText: "أيوه، أبعتها 🤍",
      cancelButtonText: "لا، مش دلوقتي",
      confirmButtonColor: "#d4819a",
      cancelButtonColor: "#ccc",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) sendEmail(message, false);
    });
  });
});

/* ===== Custom Message ===== */
document
  .getElementById("sendCustomBtn")
  ?.addEventListener("click", function () {
    const textarea = document.getElementById("customMessageInput");
    const urgentCheck = document.getElementById("urgentCheck");
    const message = textarea.value.trim();

    if (!message) {
      Swal.fire({
        icon: "info",
        title: "اكتبي رسالتك",
        text: "في box مكتوب فيه رسالتك الأول",
        confirmButtonText: "تمام",
        confirmButtonColor: "#d4819a",
      });
      return;
    }

    Swal.fire({
      icon: "question",
      title: "تأكدي من رسالتك؟",
      html: `<div style="font-size:1.1rem;color:#3d2c33;margin:10px 0;">"${message}"</div>`,
      showCancelButton: true,
      confirmButtonText: "أبعتها 🤍",
      cancelButtonText: "تعديل",
      confirmButtonColor: "#d4819a",
      cancelButtonColor: "#ccc",
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("customModal"),
      );
      if (modal) modal.hide();
      sendEmail(message, urgentCheck.checked);
      textarea.value = "";
      urgentCheck.checked = false;
    });
  });

/* ===== Clear modal on close ===== */
document
  .getElementById("customModal")
  ?.addEventListener("hidden.bs.modal", function () {
    document.getElementById("customMessageInput").value = "";
    document.getElementById("urgentCheck").checked = false;
  });

/* ===== Sending Progress ===== */
function showSendingProgress() {
  Swal.fire({
    title: "بايعة الرسالة 💌",
    html: "ثواني وهتكون في إيميل شريكك 🕊️",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
}

/* ===== Back to Top ===== */
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () =>
  backToTop.classList.toggle("show", window.scrollY > 500),
);
backToTop?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* ===== Escape closes modals ===== */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.querySelector(".modal.show");
    if (modal) bootstrap.Modal.getInstance(modal)?.hide();
  }
});

/* ===== Console ===== */
console.log(
  "%c💜 همسة %cمش عارفة تقوليها … بس هو هيفهم",
  "font-size:24px; font-weight:bold; color:#d4819a;",
  "font-size:14px; color:#5c4a51;",
);
