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

function saveImageToDB(key, file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const db = await openDatabase();
                const transaction = db.transaction(STORE_NAME, "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                store.put(e.target.result, key);
                transaction.oncomplete = () => resolve(key);
                transaction.onerror = () => reject(transaction.error);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function getImageFromDB(key) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (e) {
            reject(e);
        }
    });
}

function deleteImageFromDB(key) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            store.delete(key);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        } catch (e) {
            reject(e);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Check Session
    const isLoggedIn = sessionStorage.getItem("mts_admin_logged");
    if (isLoggedIn === "true") {
        showDashboard();
    }

    // Login Form Handler
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();

        // Kredensial Admin Sederhana
        if (user === "admin" && pass === "mtsnuruliman2026") {
            sessionStorage.setItem("mts_admin_logged", "true");
            showDashboard();
        } else {
            loginError.style.display = "block";
        }
    });

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("mts_admin_logged");
        location.reload();
    });

    // Sidebar Navigation
    const menuLinks = document.querySelectorAll(".sidebar-menu .menu-link");
    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove("active"));
            document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

            link.classList.add("active");
            const target = document.getElementById(link.getAttribute("data-section"));
            if (target) target.classList.add("active");

            refreshDashboardData();
        });
    });

    // News Image Preview
    const newsImageInput = document.getElementById("newsImage");
    const newsImgPreview = document.getElementById("newsImgPreview");
    newsImageInput.addEventListener("change", (e) => {
        newsImgPreview.innerHTML = "";
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = document.createElement("img");
                img.src = ev.target.result;
                newsImgPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    // Gallery Images Preview
    const galleryImagesInput = document.getElementById("galleryImages");
    const galleryImgPreview = document.getElementById("galleryImgPreview");
    galleryImagesInput.addEventListener("change", (e) => {
        galleryImgPreview.innerHTML = "";
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = document.createElement("img");
                img.src = ev.target.result;
                galleryImgPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // News Form Submit (Publish)
    const newsForm = document.getElementById("newsForm");
    newsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveNews("published");
    });

    // Save Draft Button
    const saveDraftBtn = document.getElementById("saveDraftBtn");
    saveDraftBtn.addEventListener("click", async () => {
        await saveNews("draft");
    });

    // Gallery Form Submit
    const galleryForm = document.getElementById("galleryForm");
    galleryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("galleryTitle").value;
        const desc = document.getElementById("galleryDesc").value;
        const files = document.getElementById("galleryImages").files;

        if (files.length === 0) {
            alert("Pilih minimal satu gambar!");
            return;
        }

        let galleryList = JSON.parse(localStorage.getItem("mts_gallery")) || [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageKey = "gal_" + Date.now() + "_" + i;
            await saveImageToDB(imageKey, file);

            galleryList.unshift({
                id: "gal_" + Date.now() + "_" + i,
                title: title,
                description: desc,
                imageKey: imageKey,
                createdAt: new Date().toISOString()
            });
        }

        localStorage.setItem("mts_gallery", JSON.stringify(galleryList));
        alert("Galeri berhasil diunggah!");
        galleryForm.reset();
        galleryImgPreview.innerHTML = "";
        refreshDashboardData();
    });

    // Set default date for news today
    const today = new Date().toISOString().split("T")[0];
    const newsDateInput = document.getElementById("newsDate");
    if (newsDateInput) newsDateInput.value = today;
});

function showDashboard() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboardScreen").style.display = "flex";
    refreshDashboardData();
}

// Save or Update News function
async function saveNews(status) {
    const id = document.getElementById("newsId").value;
    const title = document.getElementById("newsTitle").value;
    const date = document.getElementById("newsDate").value;
    const category = document.getElementById("newsCategory").value;
    const content = document.getElementById("newsContent").value;
    const imageInput = document.getElementById("newsImage");

    if (!title || !date || !content) {
        alert("Harap isi semua kolom wajib!");
        return;
    }

    let newsList = JSON.parse(localStorage.getItem("mts_news")) || [];
    let imageKey = "";

    if (id) {
        // Edit existing
        const existing = newsList.find(n => n.id === id);
        if (existing) imageKey = existing.imageKey;
    }

    if (imageInput.files[0]) {
        imageKey = "news_" + Date.now();
        await saveImageToDB(imageKey, imageInput.files[0]);
    }

    if (id) {
        newsList = newsList.map(item => {
            if (item.id === id) {
                return {
                    id, title, date, category, content,
                    imageKey: imageKey || item.imageKey,
                    status
                };
            }
            return item;
        });
        document.getElementById("newsId").value = "";
    } else {
        const newItem = {
            id: "news_" + Date.now(),
            title, date, category, content,
            imageKey: imageKey || "",
            status,
            createdAt: new Date().toISOString()
        };
        newsList.unshift(newItem);
    }

    localStorage.setItem("mts_news", JSON.stringify(newsList));
    alert(status === "published" ? "Berita berhasil dipublikasikan!" : "Berita disimpan sebagai draft!");
    document.getElementById("newsForm").reset();
    document.getElementById("newsImgPreview").innerHTML = "";
    
    // Reset date to today
    document.getElementById("newsDate").value = new Date().toISOString().split("T")[0];
    refreshDashboardData();
}

// Refresh Dashboard Data & Tables
async function refreshDashboardData() {
    const newsList = JSON.parse(localStorage.getItem("mts_news")) || [];
    const galleryList = JSON.parse(localStorage.getItem("mts_gallery")) || [];

    // Stats
    document.getElementById("statNewsCount").innerText = newsList.length;
    document.getElementById("statGalleryCount").innerText = galleryList.length;

    // News Table
    const newsTableBody = document.getElementById("adminNewsTableBody");
    if (newsTableBody) {
        newsTableBody.innerHTML = "";
        if (newsList.length === 0) {
            newsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94A3B8;">Belum ada berita.</td></tr>`;
        } else {
            newsList.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${item.title}</strong></td>
                    <td>${item.category}</td>
                    <td>${item.date}</td>
                    <td><span class="badge-status ${item.status}">${item.status.toUpperCase()}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon btn-edit" onclick="editNews('${item.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="deleteNews('${item.id}', '${item.imageKey}')" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                newsTableBody.appendChild(tr);
            });
        }
    }

    // Gallery Table
    const galleryTableBody = document.getElementById("adminGalleryTableBody");
    if (galleryTableBody) {
        galleryTableBody.innerHTML = "";
        if (galleryList.length === 0) {
            galleryTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94A3B8;">Belum ada foto galeri.</td></tr>`;
        } else {
            for (const item of galleryList) {
                let imgSrc = "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=200&auto=format&fit=crop";
                if (item.imageKey) {
                    const dbImg = await getImageFromDB(item.imageKey);
                    if (dbImg) imgSrc = dbImg;
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                    <td><strong>${item.title}</strong></td>
                    <td>${item.description || "-"}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon btn-delete" onclick="deleteGallery('${item.id}', '${item.imageKey}')" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                galleryTableBody.appendChild(tr);
            }
        }
    }
}

// Edit News
function editNews(id) {
    const newsList = JSON.parse(localStorage.getItem("mts_news")) || [];
    const item = newsList.find(n => n.id === id);
    if (!item) return;

    document.getElementById("newsId").value = item.id;
    document.getElementById("newsTitle").value = item.title;
    document.getElementById("newsDate").value = item.date;
    document.getElementById("newsCategory").value = item.category;
    document.getElementById("newsContent").value = item.content;

    // Switch to posting section
    document.querySelectorAll(".sidebar-menu .menu-link").forEach(l => l.classList.remove("active"));
    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

    const newsMenu = document.querySelector('[data-section="section-news"]');
    if (newsMenu) newsMenu.classList.add("active");
    document.getElementById("section-news").classList.add("active");
}

// Delete News
async function deleteNews(id, imageKey) {
    if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
        let newsList = JSON.parse(localStorage.getItem("mts_news")) || [];
        newsList = newsList.filter(n => n.id !== id);
        localStorage.setItem("mts_news", JSON.stringify(newsList));
        if (imageKey) await deleteImageFromDB(imageKey);
        refreshDashboardData();
    }
}

// Delete Gallery
async function deleteGallery(id, imageKey) {
    if (confirm("Apakah Anda yakin ingin menghapus foto galeri ini?")) {
        let galleryList = JSON.parse(localStorage.getItem("mts_gallery")) || [];
        galleryList = galleryList.filter(g => g.id !== id);
        localStorage.setItem("mts_gallery", JSON.stringify(galleryList));
        if (imageKey) await deleteImageFromDB(imageKey);
        refreshDashboardData();
    }
}