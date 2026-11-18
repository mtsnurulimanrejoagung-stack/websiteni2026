import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCokgJrrjQk7YTTw2iu4-p5S6SvbCCV0g",
    authDomain: "websiteni2026.firebaseapp.com",
    projectId: "websiteni2026",
    storageBucket: "websiteni2026.firebasestorage.app",
    messagingSenderId: "596706822852",
    appId: "1:596706822852:web:febe256e797e71ca0cd791",
    measurementId: "G-Z1XKB3K9L2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    // Fungsi untuk menutup semua sub-menu dropdown (baik di laptop maupun HP)
    function closeAllDropdowns() {
        document.querySelectorAll(".dropdown").forEach(drop => {
            drop.classList.remove("open", "active");
            const sub = drop.querySelector(".dropdown-menu");
            if (sub) {
                sub.removeAttribute("style");
            }
        });
    }

    if (menuBtn && navbar) {
        // Buka/tutup menu garis tiga di HP
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navbar.classList.toggle("active");
            if (!navbar.classList.contains("active")) {
                closeAllDropdowns();
            }
        });

        // Klik pada tombol menu utama yang punya sub-menu (Profil & Akademik)
        document.querySelectorAll(".dropdown > a").forEach(toggleLink => {
            toggleLink.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const parentLi = toggleLink.parentElement;
                const subMenu = parentLi.querySelector(".dropdown-menu");
                const isAlreadyOpen = parentLi.classList.contains("open");

                closeAllDropdowns();

                if (!isAlreadyOpen && subMenu) {
                    parentLi.classList.add("open", "active");
                    subMenu.style.setProperty("display", "block", "important");
                    subMenu.style.setProperty("opacity", "1", "important");
                    subMenu.style.setProperty("visibility", "visible", "important");
                    subMenu.style.setProperty("max-height", "500px", "important");
                    subMenu.style.setProperty("transform", "translateY(0)", "important");

                    if (window.innerWidth <= 992) {
                        subMenu.style.setProperty("position", "static", "important");
                        subMenu.style.setProperty("box-shadow", "none", "important");
                        subMenu.style.setProperty("padding-left", "20px", "important");
                        subMenu.style.setProperty("width", "100%", "important");
                    }
                }
            });
        });

        // Klik pada link biasa atau link di dalam sub-menu
        navbar.querySelectorAll("a").forEach(link => {
            if (!link.parentElement.classList.contains("dropdown")) {
                link.addEventListener("click", () => {
                    closeAllDropdowns();
                    navbar.classList.remove("active");
                });
            }
        });

        // Tutup dropdown otomatis jika klik di luar area menu
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && !menuBtn.contains(e.target)) {
                closeAllDropdowns();
                navbar.classList.remove("active");
            }
        });
    }

    // Tabs Berita & Galeri
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const target = btn.getAttribute("data-tab");
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add("active");
        });
    });

    // Load Data dari Firestore
    loadPublicNews();
    loadPublicGallery();
    loadPublicPrestasi();
});

// Load Berita Publik
async function loadPublicNews() {
    const container = document.getElementById("news-container");
    if (!container) return;

    try {
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>Belum ada berita yang dipublikasikan.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        snapshot.forEach(docSnap => {
            const item = docSnap.data();
            if (item.status === "published") {
                const card = document.createElement("div");
                card.className = "card-item";
                card.style.padding = "0";
                card.style.overflow = "hidden";
                card.style.textAlign = "left";
                card.innerHTML = `
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width:100%; height:200px; object-fit:cover;">` : ''}
                    <div style="padding: 20px;">
                        <span style="font-size: 11px; font-weight:600; color:#2563EB; background:#EFF6FF; padding:4px 8px; border-radius:4px;">${item.category}</span>
                        <h3 style="font-size: 16px; margin: 10px 0 6px 0; color:#0A192F;">${item.title}</h3>
                        <p style="font-size: 12px; color:#64748B; margin-bottom: 10px;"><i class="far fa-calendar-alt"></i> ${item.date}</p>
                        <p style="font-size: 13px; color:#334155; line-height: 1.5;">${item.content.substring(0, 110)}...</p>
                    </div>
                `;
                container.appendChild(card);
            }
        });
    } catch (e) {
        console.error("Gagal memuat berita:", e);
    }
}

// Load Galeri Publik
async function loadPublicGallery() {
    const container = document.getElementById("gallery-container");
    if (!container) return;

    try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <p>Belum ada foto galeri yang diunggah.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        snapshot.forEach(docSnap => {
            const item = docSnap.data();
            const card = document.createElement("div");
            card.className = "facility-card";
            card.innerHTML = `
                ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width:100%; height:180px; object-fit:cover;">` : ''}
                <div class="facility-body">
                    <h3>${item.title}</h3>
                    <p>${item.description || ''}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error("Gagal memuat galeri:", e);
    }
}

// Load Prestasi Publik (Maksimal 3 Teratas Sesuai Urutan + Tombol Lihat Selanjutnya)
async function loadPublicPrestasi() {
    const container = document.getElementById("prestasi-container");
    const moreWrapper = document.getElementById("prestasi-more-wrapper");
    if (!container) return;

    try {
        const snapshot = await getDocs(collection(db, "prestasi"));

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>Belum ada data prestasi yang dipublikasikan.</p>
                </div>
            `;
            if (moreWrapper) moreWrapper.style.display = "none";
            return;
        }

        const items = [];
        snapshot.forEach(docSnap => items.push(docSnap.data()));

        // Urutkan berdasarkan nomor urutan (1, 2, 3, dst.), jika sama/kosong urutkan terbaru
        items.sort((a, b) => {
            const orderA = (a.order !== undefined && a.order !== null && a.order !== "") ? Number(a.order) : 9999;
            const orderB = (b.order !== undefined && b.order !== null && b.order !== "") ? Number(b.order) : 9999;
            if (orderA !== orderB) return orderA - orderB;
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        // Ambil maksimal 3 teratas untuk beranda
        const topThree = items.slice(0, 3);

        container.innerHTML = "";
        topThree.forEach(item => {
            const card = document.createElement("div");
            card.className = "info-item";
            card.innerHTML = `
                <i class="fas fa-trophy" style="color: #F59E0B;"></i>
                <div>
                    <span style="font-size: 12px; font-weight: 600; color: #2563EB; display: block; margin-bottom: 4px;">${item.level}</span>
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            container.appendChild(card);
        });

        // Tampilkan tombol "Lihat Prestasi Selanjutnya" jika total data > 3
        if (moreWrapper) {
            moreWrapper.style.display = items.length > 3 ? "block" : "none";
        }
    } catch (e) {
        console.error("Gagal memuat prestasi:", e);
    }
}

// Kirim Pesan WhatsApp
window.sendWhatsApp = function(e) {
    e.preventDefault();
    const name = document.getElementById("sender-name").value;
    const message = document.getElementById("sender-message").value;
    const phone = "6285273496299";

    const text = `Halo Admin MTsS Nurul Iman Rejo Agung,%0A%0ANama: ${name}%0APesan:%0A${message}`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
};
