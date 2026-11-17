// Mengambil data berita & galeri dari file data.json
async function fetchSiteData() {
    try {
        const response = await fetch("data.json?t=" + Date.now());
        if (!response.ok) throw new Error("Gagal mengambil data.json");
        return await response.json();
    } catch (error) {
        console.error("Error loading data.json:", error);
        return { news: [], gallery: [] };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu Toggle
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    if (menuBtn && navbar) {
        menuBtn.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    // Dropdown Handling
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggleLink = dropdown.querySelector(':scope > a');
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 992) dropdown.classList.add('active');
        });
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 992) dropdown.classList.remove('active');
        });
        toggleLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            }
        });
    });

    const allNavLinks = document.querySelectorAll('.navbar a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992 && this.parentElement.classList.contains('dropdown')) return;
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

    // Muat Berita & Galeri dari data.json
    loadPublicContent();
});

async function loadPublicContent() {
    const data = await fetchSiteData();
    renderPublicNews(data.news || []);
    renderPublicGallery(data.gallery || []);
}

function renderPublicNews(newsList) {
    const container = document.getElementById("news-container");
    if (!container) return;

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
        const imgSrc = item.image || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop";

        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <img src="${imgSrc}" alt="${item.title}" class="news-img">
            <div class="news-body">
                <div class="news-meta"><i class="far fa-calendar-alt"></i> ${item.date} | <span>${item.category}</span></div>
                <h3>${item.title}</h3>
                <p>${item.content.substring(0, 90)}...</p>
                <a href="read.html?id=${item.id}" style="display: inline-block; margin-top: 12px; color: var(--blue); font-weight: 600; font-size: 13px; text-decoration: none;">
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

function renderPublicGallery(galleryList) {
    const container = document.getElementById("gallery-container");
    if (!container) return;

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
        const imgSrc = item.image || "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop";

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
    const phoneNumber = "6285273496299";

    const text = encodeURIComponent(
        `*Pesan Baru dari Website Madrasah*\n\n` +
        `👤 *Nama:* ${name}\n\n` +
        `💬 *Pesan:* \n${message}`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
}
