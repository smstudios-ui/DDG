// admin.js - Advanced Dashboard Controller

// Hardcoded credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginOverlay = document.getElementById('login-overlay');
    const loginBtn = document.getElementById('login-btn');
    const loginMsg = document.getElementById('login-msg');
    
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const logoutBtn = document.getElementById('logout-btn');

    let editingProjectId = null;

    // Initialization
    async function init() {
        if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            loginOverlay.classList.add('hidden');
            await updateStats();
            await renderProjects();
            await renderMessages();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
    init();

    // Authentication
    const passwordInput = document.getElementById('admin-password');
    const togglePassword = document.getElementById('toggle-password');

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    loginBtn.addEventListener('click', () => {
        const u = document.getElementById('admin-username').value.trim();
        const p = document.getElementById('admin-password').value.trim();
        
        if (u.toLowerCase() === ADMIN_USER && p === ADMIN_PASS) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            gsap.to(loginOverlay, { opacity: 0, duration: 0.5, onComplete: () => {
                loginOverlay.classList.add('hidden');
                updateStats();
                renderProjects();
                renderMessages();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }});
        } else {
            loginMsg.textContent = 'INCORRECT: Use "admin" and "password123"';
            loginMsg.style.opacity = '1';
            gsap.fromTo(loginMsg, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.reload();
    });

    // Tab Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            if (!tabId) return;

            // Update UI
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(tab => {
                tab.classList.add('hidden');
                if (tab.id === `tab-${tabId}`) {
                    tab.classList.remove('hidden');
                    gsap.from(tab, { opacity: 0, y: 10, duration: 0.4 });
                }
            });

            if (tabId === 'projects') renderProjects();
            if (tabId === 'overview') updateStats();
            if (tabId === 'partners') renderPartners();
            if (tabId === 'messages') renderMessages();
        });
    });

    // Statistics Utility
    async function updateStats() {
        try {
            const res = await fetch(`${API_URL}/projects`);
            const works = await res.json();
            const totalEl = document.getElementById('stats-total-works');
            const lastDateEl = document.getElementById('stats-last-date');
            
            if (totalEl) totalEl.textContent = works.length;
            if (lastDateEl && works.length > 0) {
                const lastWork = works[0]; // Sorted by -createdAt
                if (lastWork.createdAt) {
                    lastDateEl.textContent = new Date(lastWork.createdAt).toLocaleDateString();
                }
            }
        } catch (err) {
            console.error('Error updating stats:', err);
        }
    }

    async function renderPartners() {
        const list = document.getElementById('partners-list');
        if (!list) return;
        
        try {
            const res = await fetch(`${API_URL}/partners`);
            const partners = await res.json();
            
            list.innerHTML = partners.length ? '' : '<tr><td colspan="4" style="text-align:center; padding: 2rem; color:#666;">No dynamic partners found.</td></tr>';
            
            partners.forEach((partner) => {
                const row = document.createElement('tr');
                const previewContent = partner.image ? `<img src="${partner.image}" class="partner-img" style="width:50px; height:50px;">` : `LOGO <span>${partner.char}</span>`;
                row.innerHTML = `
                    <td><div class="partner-card" style="padding: 10px; font-size: 0.8rem; animation:none; transform:scale(0.8); width:60px; height:60px;">${previewContent}</div></td>
                    <td style="font-weight:600;">${partner.name}</td>
                    <td style="color:var(--primary-color); font-weight:bold;">${partner.char || 'IMAGE'}</td>
                    <td>
                        <button class="btn-delete" data-id="${partner._id}">REMOVE</button>
                    </td>
                `;
                list.appendChild(row);
            });

            // Delete Logic
            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('Are you sure you want to remove this partner?')) {
                        await fetch(`${API_URL}/partners/${id}`, { method: 'DELETE' });
                        renderPartners();
                    }
                });
            });
        } catch (err) {
            console.error('Error rendering partners:', err);
        }
    }

    // Projects Management
    async function renderProjects() {
        const list = document.getElementById('projects-list');
        if (!list) return;
        
        try {
            const res = await fetch(`${API_URL}/projects`);
            const works = await res.json();
            
            list.innerHTML = works.length ? '' : '<tr><td colspan="5" style="text-align:center; padding: 3rem; color:#666;">No dynamic projects found.</td></tr>';
            
            works.forEach((work) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${work.image}" class="work-thumb" onerror="this.src='https://placehold.co/100/111/fff?text=IMG'"></td>
                    <td style="font-weight:600;">${work.title}</td>
                    <td style="color:#888;">${work.category}</td>
                    <td style="font-weight:600;">${work.views || 0}</td>
                    <td>
                        <button class="btn-edit" data-id="${work._id}" style="background:transparent; border:1px solid #444; color:#fff; padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-right:5px;">EDIT</button>
                        <button class="btn-delete-work" data-id="${work._id}" style="background:transparent; border:1px solid #444; color:#888; padding:0.5rem 1rem; border-radius:8px; cursor:pointer;">DELETE</button>
                    </td>
                `;
                list.appendChild(row);
            });

            // Edit Logic
            list.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const work = works.find(p => p._id === id);
                    if (work) {
                        editingProjectId = id;
                        document.getElementById('work-title').value = work.title;
                        document.getElementById('work-category').value = work.category;
                        document.getElementById('work-image').value = work.image;
                        document.getElementById('work-description').value = work.description || '';
                        document.getElementById('work-page-content').value = work.pageContent || '';
                        document.getElementById('media-type').value = work.mediaType || 'image';
                        
                        document.getElementById('add-work-btn').textContent = 'UPDATE PROJECT';
                        
                        // Switch to Add Tab
                        document.querySelector('[data-tab="add-new"]').click();
                    }
                });
            });

            // Delete Logic
            list.querySelectorAll('.btn-delete-work').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this project?')) {
                        await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
                        renderProjects();
                        updateStats();
                    }
                });
            });
        } catch (err) {
            console.error('Error rendering projects:', err);
        }
    }

    // Helper to format Image URLs (Direct drive support)
    function formatImageUrl(url) {
        if (!url) return '';
        const driveUrl = url.trim();
        if (driveUrl.includes('drive.google.com')) {
            let fileId = '';
            if (driveUrl.includes('/file/d/')) {
                fileId = driveUrl.split('/file/d/')[1].split('/')[0].split('?')[0];
            } else if (driveUrl.includes('id=')) {
                const parts = driveUrl.split('id=')[1];
                fileId = parts.split('&')[0].split('#')[0];
            }
            if (fileId) {
                return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
            }
        }
        return driveUrl;
    }

    // Helper for YouTube ID extraction
    function getYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Handle Image Upload to Base64
    let uploadedImageData = '';
    const fileInput = document.getElementById('work-file');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedImageData = event.target.result;
                    document.getElementById('work-image').value = 'Local File Selected';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const addWorkBtn = document.getElementById('add-work-btn');
    const addMsg = document.getElementById('add-msg');

    addWorkBtn.addEventListener('click', async () => {
        const fields = {
            title: document.getElementById('work-title'),
            category: document.getElementById('work-category'),
            image: document.getElementById('work-image'),
            desc: document.getElementById('work-description'),
            mediaType: document.getElementById('media-type'),
            pageContent: document.getElementById('work-page-content')
        };

        if (!fields.title.value || !fields.category.value || (!fields.image.value && !uploadedImageData)) {
            addMsg.style.color = '#ff0000';
            addMsg.textContent = 'CRITICAL: TITLE, CATEGORY, AND MEDIA REQUIRED';
            return;
        }

        let finalMedia = fields.image.value;
        if (uploadedImageData && fields.image.value === 'Local File Selected') {
            finalMedia = uploadedImageData;
        }

        const type = fields.mediaType.value;
        let ytId = '';
        if (type === 'youtube') {
            ytId = getYouTubeId(finalMedia);
            if (ytId) {
                finalMedia = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
            }
        } else {
            finalMedia = formatImageUrl(finalMedia.trim());
        }

        const newWork = {
            title: fields.title.value,
            category: fields.category.value,
            image: finalMedia,
            description: fields.desc.value,
            mediaType: type,
            youtubeId: ytId,
            pageContent: fields.pageContent.value
        };

        try {
            const url = editingProjectId ? `${API_URL}/projects/${editingProjectId}` : `${API_URL}/projects`;
            const method = editingProjectId ? 'PUT' : 'POST';

            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWork)
            });

            addMsg.style.color = '#4caf50';
            addMsg.textContent = editingProjectId ? 'PROJECT UPDATED SUCCESSFULLY' : 'PROJECT ARCHIVED SUCCESSFULLY';
            
            // Reset state
            editingProjectId = null;
            addWorkBtn.textContent = 'PUBLISH TO ARCHIVE';

            // Clear fields
            Object.values(fields).forEach(f => { if(f) f.value = ''; });
            uploadedImageData = '';
            if(fileInput) fileInput.value = '';
            
            setTimeout(() => { addMsg.textContent = ''; }, 3000);
            renderProjects();
            updateStats();
        } catch (err) {
            console.error('Error saving project:', err);
            addMsg.textContent = 'ERROR SAVING TO DATABASE';
        }
    });

    // Partner Registration
    const addPartnerBtn = document.getElementById('add-partner-btn');
    const partnerMsg = document.getElementById('partner-msg');
    const partnerFileInput = document.getElementById('partner-file');
    let uploadedPartnerImage = '';

    if (partnerFileInput) {
        partnerFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => { uploadedPartnerImage = event.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (addPartnerBtn) {
        addPartnerBtn.addEventListener('click', async () => {
            const name = document.getElementById('partner-name').value.trim();
            const char = document.getElementById('partner-char').value.trim().toUpperCase();
            const url = document.getElementById('partner-url').value.trim() || '#';

            if (!name || (!char && !uploadedPartnerImage)) {
                partnerMsg.style.color = '#ff0000';
                partnerMsg.textContent = 'ERROR: NAME AND (CHAR OR IMAGE) REQUIRED';
                return;
            }

            const newPartner = {
                name: name,
                char: char,
                image: uploadedPartnerImage,
                url: url
            };

            try {
                await fetch(`${API_URL}/partners`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPartner)
                });

                partnerMsg.style.color = '#4caf50';
                partnerMsg.textContent = 'PARTNER REGISTERED SUCCESSFULLY';
                
                document.getElementById('partner-name').value = '';
                document.getElementById('partner-char').value = '';
                document.getElementById('partner-url').value = '';
                if(partnerFileInput) partnerFileInput.value = '';
                uploadedPartnerImage = '';
                renderPartners();
                
                setTimeout(() => { partnerMsg.textContent = ''; }, 3000);
            } catch (err) {
                console.error('Error adding partner:', err);
            }
        });
    }

    // --- Hero Image (Works Slider) Management ---
    const heroImageUrlInput = document.getElementById('hero-image-url');
    const heroImageFileInput = document.getElementById('hero-image-file');
    const addSlideBtn = document.getElementById('add-slide-btn');
    const heroMsg = document.getElementById('hero-msg');

    async function renderHeroSlides() {
        const list = document.getElementById('hero-slides-list');
        if (!list) return;
        
        try {
            const res = await fetch(`${API_URL}/hero-banners`);
            const slides = await res.json();
            
            list.innerHTML = slides.length ? '' : '<tr><td colspan="3" style="text-align:center; padding: 2rem; color:#666;">No slides added yet.</td></tr>';
            
            slides.forEach((slide) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${slide.url}" style="width:80px; height:50px; object-fit:cover; border-radius:8px;"></td>
                    <td style="font-weight:600;">${slide.title}</td>
                    <td>
                        <button class="btn-delete" data-id="${slide._id}">REMOVE</button>
                    </td>
                `;
                list.appendChild(row);
            });

            // Delete Logic
            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('Are you sure you want to remove this slide?')) {
                        await fetch(`${API_URL}/hero-banners/${id}`, { method: 'DELETE' });
                        renderHeroSlides();
                    }
                });
            });
        } catch (err) {
            console.error('Error rendering hero slides:', err);
        }
    }

    const bulkPreviewContainer = document.getElementById('hero-bulk-previews');
    const addBulkBtn = document.getElementById('add-bulk-btn');
    let bulkImages = [];

    if (heroImageFileInput) {
        heroImageFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            bulkImages = [];
            if (bulkPreviewContainer) bulkPreviewContainer.innerHTML = '';
            
            if (files.length > 0) {
                if (addBulkBtn) addBulkBtn.style.display = 'block';
                
                files.forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const originalData = event.target.result;
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const max_width = 1600;
                            if (width > max_width) {
                                height *= max_width / width;
                                width = max_width;
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                            
                            bulkImages.push({
                                url: compressedData,
                                title: file.name.split('.')[0]
                            });
                            
                            const div = document.createElement('div');
                            div.style = 'aspect-ratio: 1; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #111;';
                            div.innerHTML = `<img src="${compressedData}" style="width:100%; height:100%; object-fit:cover;">`;
                            if (bulkPreviewContainer) bulkPreviewContainer.appendChild(div);
                        };
                        img.src = originalData;
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
    }

    if (addBulkBtn) {
        addBulkBtn.addEventListener('click', async () => {
            if (bulkImages.length === 0) return;
            const globalTitle = document.getElementById('hero-slide-title').value.trim();
            const globalTag = document.getElementById('hero-slide-tag').value.trim();
            
            try {
                for (const img of bulkImages) {
                    await fetch(`${API_URL}/hero-banners`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: globalTitle || img.title.toUpperCase(),
                            tag: globalTag || 'GALLERY',
                            url: img.url
                        })
                    });
                }
                heroMsg.style.color = '#4caf50';
                heroMsg.textContent = 'BULK UPLOAD SUCCESSFUL';
                bulkImages = [];
                if (bulkPreviewContainer) bulkPreviewContainer.innerHTML = '';
                renderHeroSlides();
            } catch (err) { console.error(err); }
        });
    }

    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', async () => {
            const title = document.getElementById('hero-slide-title').value.trim();
            const tag = document.getElementById('hero-slide-tag').value.trim();
            const urlVal = heroImageUrlInput.value.trim();

            if (!urlVal) return;

            try {
                await fetch(`${API_URL}/hero-banners`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title || 'NEW SLIDE',
                        tag: tag || 'FEATURED',
                        url: formatImageUrl(urlVal)
                    })
                });
                renderHeroSlides();
            } catch (err) { console.error(err); }
        });
    }

    // Inbox Logic
    async function renderMessages() {
        const list = document.getElementById('messages-list');
        if (!list) return;

        try {
            const res = await fetch(`${API_URL}/messages`);
            const messages = await res.json();
            list.innerHTML = messages.length ? '' : '<tr><td colspan="4" style="text-align:center; padding:2rem; color:#666;">Inbox is empty.</td></tr>';

            messages.forEach(msg => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="color:#666">${new Date(msg.createdAt).toLocaleDateString()}</td>
                    <td style="font-weight:900">${msg.name} <br> <span style="font-size:0.7rem; color:#888">${msg.email}</span></td>
                    <td style="color:#eee">${msg.subject}</td>
                    <td>
                        <button class="btn-view-msg" data-msg='${JSON.stringify(msg)}' style="background:var(--accent); border:none; color:#fff; padding:0.5rem 1rem; border-radius:8px; cursor:pointer;">VIEW</button>
                        <button class="btn-delete-msg" data-id="${msg._id}" style="background:transparent; border:1px solid #444; color:#888; padding:0.5rem 1rem; border-radius:8px; cursor:pointer;">DELETE</button>
                    </td>
                `;
                list.appendChild(tr);
            });

            // Listeners
            document.querySelectorAll('.btn-view-msg').forEach(btn => {
                btn.addEventListener('click', () => {
                    const msg = JSON.parse(btn.getAttribute('data-msg'));
                    alert(`FROM: ${msg.name} (${msg.email})\nSUBJECT: ${msg.subject}\n\nMESSAGE:\n${msg.message}`);
                });
            });

            document.querySelectorAll('.btn-delete-msg').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Delete this message?')) {
                        await fetch(`${API_URL}/messages/${btn.getAttribute('data-id')}`, { method: 'DELETE' });
                        renderMessages();
                    }
                });
            });
        } catch (err) { console.error(err); }
    }
});
