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

        toggleLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault(); 
                e.stopPropagation(); 
                dropdown.classList.toggle('active');
            }
        });
    });

    // Otomatis menutup menu utama saat link diklik
    const allNavLinks = document.querySelectorAll('.navbar a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 992 && this.parentElement.classList.contains('dropdown')) {
                return;
            }
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

// Render Berita Publik (Membatasi 3 teratas di beranda, menampilkan semua di berita.html)
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

    const isArchivePage = window.location.pathname.includes("berita.html");
    const displayedNews = isArchivePage ? publishedNews : publishedNews.slice(0, 3);

    container.innerHTML = "";
    for (const item of displayedNews) {
        let imgSrc = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop";
        if (item.imageKey) {
            const dbImg = await getImageFromDB(item.imageKey);
            if (dbImg) {
                imgSrc = URL.createObjectURL(dbImg);
            }
        }

        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.title}" class="news-img">
            <div class="news-body">
                <div class="news-meta"><i class="far fa-calendar-alt"></i> ${item.date} | <span>${item.category}</span></div>
                <h3>${item.title}</h3>
                <p>${item.content.substring(0, 90)}...</p>
                <a href="read.html?id=${item.id}" target="_blank" style="display: inline-block; margin-top: 12px; color: var(--blue); font-weight: 600; font-size: 13px; text-decoration: none;">
                    Baca Selengkapnya <i class="fas fa-arrow-right" style="font-size: 11px;"></i>
                </a>
            </div>
        `;
        container.appendChild(card);
    }

    if (!isArchivePage && publishedNews.length > 0) {
        let btnContainer = document.getElementById("lihat-semua-container");
        if (!btnContainer) {
            btnContainer = document.createElement("div");
            btnContainer.id = "lihat-semua-container";
            btnContainer.style.cssText = "grid-column: 1 / -1; text-align: center; margin-top: 35px;";
            btnContainer.innerHTML = `
                <a href="berita.html" class="btn-primary" style="display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 14px;">
                    Lihat Semua Berita & Pengumuman <i class="fas fa-arrow-right" style="margin-left: 6px;"></i>
                </a>
            `;
            container.parentElement.appendChild(btnContainer);
        }
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
            if (dbImg) {
                imgSrc = URL.createObjectURL(dbImg);
            }
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

function sendWhatsApp(event) {
    event.preventDefault();
    const name = document.getElementById('sender-name').value;
    const message = document.getElementById('sender-message').value;

    // Masukkan nomor WhatsApp Admin (Gunakan format 62 di depan, contoh: 6281234567890)
    const phoneNumber = "6285273496299"; 

    // Format teks pesan yang akan otomatis terkirim
    const text = encodeURIComponent(
        `*Pesan Baru dari Website Madrasah*\n\n` +
        `👤 *Nama:* ${name}\n\n` +
        `💬 *Pesan:* \n${message}`
    );

    // Membuka WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
}