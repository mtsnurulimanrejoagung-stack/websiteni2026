// IndexedDB Helper untuk mengambil gambar dari database lokal
const DB_NAME = "MtsNurulImanDB";
const STORE_NAME = "mediaStore";
const DB_VERSION = 1;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function getImageFromDB(key) {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Error reading image from DB:", e);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu Toggle (Tombol Hamburger)
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    if (menuBtn && navbar) {
        menuBtn.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    // Dropdown Handling (Desktop Hover & Mobile Click)
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggleLink = dropdown.querySelector(':scope > a');

        // Khusus Desktop: Buka saat kursor masuk, tutup saat kursor keluar
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 992) {
                dropdown.classList.add('active');
            }
        });
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 992) {
                dropdown.classList.remove('active');
            }
        });

        // Klik pada induk dropdown (HP/Tablet)
        toggleLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault(); 
                e.stopPropagation(); // Mencegah bentrok dengan perintah tutup menu umum
                dropdown.classList.toggle('active');
            }
        });
    });

    // OTOMATIS MENUTUP MENU UTAMA SAAT LINK TUJUAN DIKLIK
    const allNavLinks = document.querySelectorAll('.navbar a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Jika yang diklik adalah tombol dropdown utama di mobile, abaikan agar sub-menu bisa terbuka
            if (window.innerWidth <= 992 && this.parentElement.classList.contains('dropdown')) {
                return;
            }
            
            // Tutup navbar mobile dan semua dropdown jika mengklik sub-menu atau link biasa
            if (navbar) navbar.classList.remove('active');
            dropdowns.forEach(d => d.classList.remove('active'));
        });
    });

    // Tabs Switcher (Berita & Galeri)
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const target = document.getElementById(btn.getAttribute("data-tab"));
            if (target) target.classList.add("active");
        });
    });

    // Load Dynamic News & Gallery
    loadPublicNews();
    loadPublicGallery();

    // Contact form submit simulation
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Pesan Anda berhasil dikirim! Terima kasih telah menghubungi MTsS Nurul Iman Rejo Agung.");
            contactForm.reset();
        });
    }
});

// Render Berita Publik (Hanya yang status === 'published')
async function loadPublicNews() {
    const container = document.getElementById("news-container");
    if (!container) return;

    const newsList = JSON.parse(localStorage.getItem("mts_news")) || [];
    const publishedNews = newsList.filter(item => item.status === "published");

    if (publishedNews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>Belum ada berita yang dipublikasikan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    for (const item of publishedNews) {
        let imgSrc = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop";
        if (item.imageKey) {
            const dbImg = await getImageFromDB(item.imageKey);
            if (dbImg) imgSrc = dbImg;
        }

        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.title}" class="news-img">
            <div class="news-body">
                <div class="news-meta"><i class="far fa-calendar-alt"></i> ${item.date} | <span>${item.category}</span></div>
                <h3>${item.title}</h3>
                <p>${item.content.substring(0, 100)}...</p>
            </div>
        `;
        container.appendChild(card);
    }
}

// Render Galeri Publik
async function loadPublicGallery() {
    const container = document.getElementById("gallery-container");
    if (!container) return;

    const galleryList = JSON.parse(localStorage.getItem("mts_gallery")) || [];

    if (galleryList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>Belum ada foto galeri yang diunggah.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    for (const item of galleryList) {
        let imgSrc = "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop";
        if (item.imageKey) {
            const dbImg = await getImageFromDB(item.imageKey);
            if (dbImg) imgSrc = dbImg;
        }

        const card = document.createElement("div");
        card.className = "gallery-card";
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.title}" class="gallery-img">
            <div class="gallery-body">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `;
        container.appendChild(card);
    }
}