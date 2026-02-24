/* ========================================
   NEXTSOUND — FRONTEND ENGINE V4
   Firebase Auth connected via backend API
   ======================================== */

const State = {
    isLoggedIn: false,
    user: null,
    currentView: 'home',
    promoConfig: null
};

const DATA = {
    quickPicks: [
        { t: 'Liked Songs', c: 'linear-gradient(135deg, #450af5, #c4efd9)' },
        { t: 'Daily Mix 1', c: '#1e3264' },
        { t: 'Discover Weekly', c: '#641e1e' },
        { t: 'Release Radar', c: '#1e6464' },
        { t: 'On Repeat', c: '#3c641e' },
        { t: 'Chill Vibes', c: '#641e5a' }
    ],
    trending: [
        { t: 'Cruel Summer', a: 'Taylor Swift', c: '#f7d08a' },
        { t: 'Paint The Town Red', a: 'Doja Cat', c: '#e63946' },
        { t: 'Greedy', a: 'Tate McRae', c: '#a8dadc' },
        { t: 'Seven', a: 'Jung Kook', c: '#457b9d' },
        { t: 'Vampire', a: 'Olivia Rodrigo', c: '#9d457b' },
        { t: 'Houdini', a: 'Dua Lipa', c: '#7b9d45' },
        { t: 'Last Night', a: 'Morgan Wallen', c: '#d5bdaf' },
        { t: 'Flowers', a: 'Miley Cyrus', c: '#fec89a' }
    ],
    artists: [
        { n: 'The Weeknd', c: '#333' },
        { n: 'Taylor Swift', c: '#ffc0cb' },
        { n: 'Drake', c: '#444' },
        { n: 'SZA', c: '#222' },
        { n: 'Bad Bunny', c: '#ff4500' },
        { n: 'Ed Sheeran', c: '#1e3264' },
        { n: 'Dua Lipa', c: '#641e1e' },
        { n: 'Justin Bieber', c: '#1e6464' }
    ],
    albums: [
        { t: 'Midnights', a: 'Taylor Swift', c: '#191970' },
        { t: 'After Hours', a: 'The Weeknd', c: '#8b0000' },
        { t: 'Utopia', a: 'Travis Scott', c: '#696969' },
        { t: 'SOS', a: 'SZA', c: '#00ced1' },
        { t: 'For All The Dogs', a: 'Drake', c: '#000' },
        { t: 'GUTS', a: 'Olivia Rodrigo', c: '#4b0082' },
        { t: 'Un Verano Sin Ti', a: 'Bad Bunny', c: '#f4a460' },
        { t: 'Starboy', a: 'The Weeknd', c: '#2f4f4f' }
    ],
    categories: [
        { t: 'Music', c: '#dc148c' },
        { t: 'Podcasts', c: '#006450' },
        { t: 'Live Events', c: '#8400e7' },
        { t: 'Made For You', c: '#1e3264' },
        { t: 'New Releases', c: '#e8115b' },
        { t: 'Pop', c: '#148a08' },
        { t: 'Hip-Hop', c: '#503750' },
        { t: 'Rock', c: '#e91429' },
        { t: 'Latin', c: '#e1118b' },
        { t: 'Dance/Electronic', c: '#d84000' }
    ],
    browseTrending: [
        { t: 'Use Me', a: 'Mavo, P.Priime', i: 'assets/use_me_cover.jpg', e: true },
        { t: 'Uzo Ano', a: 'Phyno, Flavour', i: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=400', e: false },
        { t: 'Muzz', a: 'Zaylevelten', i: 'https://images.unsplash.com/photo-1544427928-c49cdfb8194d?q=80&w=400', e: true },
        { t: 'THEY LOVE ME', a: 'ODUMODUBLVCK', i: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400', e: true },
        { t: 'Realize', a: 'Rybeena, BhadBoi OML', i: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=400', e: false },
        { t: 'City Boy', a: 'Burna Boy', i: 'https://images.unsplash.com/photo-1520127877998-122c33e8eb38?q=80&w=400', e: true },
        { t: 'Holy Ghost', a: 'Omah Lay', i: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400', e: false },
        { t: 'Ask About Me', a: 'Mohbad', i: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400', e: true }
    ]
};

const App = {
    init() {
        this.restoreSession();
        this.bindEvents();
        this.navigate(window.location.hash.replace('#', '') || 'home');
        this.updateUI();

        setTimeout(() => {
            const promo = document.getElementById('logged-out-promo');
            if (promo && !State.isLoggedIn && (!State.promoConfig || !State.promoConfig.dismissed)) {
                promo.classList.add('visible');
            }
        }, 800);
    },

    // ── Session Persistence ──────────────────────────────
    restoreSession() {
        try {
            const saved = localStorage.getItem('ns_user');
            if (saved) {
                State.user = JSON.parse(saved);
                State.isLoggedIn = true;
            }
        } catch (e) { /* ignore */ }
    },

    saveSession(user) {
        try {
            // Save user data including token
            localStorage.setItem('ns_user', JSON.stringify(user));
        } catch (e) { }
    },

    clearSession() {
        try { localStorage.removeItem('ns_user'); } catch (e) { }
    },

    // ── Event Binding ────────────────────────────────────
    bindEvents() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.router-link');
            if (link) {
                const path = link.dataset.path;
                const id = link.dataset.id;
                if (path === 'logout') { this.logout(); return; }
                this.navigate(path, true, id);
                return;
            }

            const closeBtn = e.target.closest('#close-promo');
            if (closeBtn) {
                const banner = document.getElementById('logged-out-promo');
                if (banner) {
                    banner.classList.add('promo-dismissed');
                    banner.classList.remove('visible');
                    State.promoConfig = { dismissed: true };
                }
                return;
            }
        });

        const scrollArea = document.getElementById('scroll-area');
        if (scrollArea) {
            scrollArea.addEventListener('scroll', () => {
                const header = document.querySelector('.breadcrumb-container');
                if (!header) return;
                const opacity = Math.min(scrollArea.scrollTop / 150, 1);
                header.style.backgroundColor = `rgba(18, 18, 18, ${opacity})`;
            });
        }

        window.addEventListener('popstate', (e) => {
            const path = window.location.hash.replace('#', '') || 'home';
            this.navigate(path, false, e.state ? e.state.linkData : null);
        });

        const searchInput = document.querySelector('.search-pill input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => this.navigate('search'));
        }
    },

    // ── Navigation ───────────────────────────────────────
    navigate(path, push = true, linkData = null) {
        if (!path) return;

        const mount = document.getElementById('view-mount');
        const authMount = document.getElementById('auth-mount');

        if (['signup', 'login', 'profile'].includes(path)) {
            if (path === 'profile') {
                // Profile is a main view, not an auth view
                authMount.classList.add('hidden');
                mount.innerHTML = '';
                const tpl = document.getElementById('view-profile');
                if (tpl) mount.appendChild(tpl.content.cloneNode(true));
                this.renderProfile();
            } else {
                console.log('Navigating to:', path);
                authMount.classList.remove('hidden');
                authMount.innerHTML = '';
                const tpl = document.getElementById(`view-${path}`);
                if (tpl) authMount.appendChild(tpl.content.cloneNode(true));
                this.setupAuthForms(path);
            }
        } else {
            authMount.classList.add('hidden');
            mount.innerHTML = '';
            const tpl = document.getElementById(`view-${path}`) || document.getElementById('view-home');
            if (tpl) mount.appendChild(tpl.content.cloneNode(true));

            if (path === 'home') this.renderHome();
            if (path === 'search') this.renderSearch();
            if (path === 'artist') this.renderArtist(linkData);
            if (path === 'album') this.renderAlbum(linkData);
        }

        if (push) window.history.pushState({ path, linkData }, '', `#${path}`);
        State.currentView = path;
        const scrollArea = document.getElementById('scroll-area');
        if (scrollArea) scrollArea.scrollTop = 0;
    },

    // ── Render Home ──────────────────────────────────────
    renderHome() {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');
        const greetEl = document.getElementById('greeting-text');
        if (greetEl) greetEl.textContent = greeting;

        const quick = document.getElementById('grid-quick');
        if (quick) {
            quick.innerHTML = DATA.quickPicks.map(i => `
                <div class="quick-card">
                    <div class="quick-img" style="background:${i.c}"></div>
                    <div class="quick-t">${i.t}</div>
                    <div class="quick-play">
                        <svg viewBox="0 0 24 24" width="24" fill="black"><path d="M7 6v12l10-6z"/></svg>
                    </div>
                </div>
            `).join('');
        }

        this.renderItems('grid-trending', DATA.trending);
        this.renderItems('grid-artists', DATA.artists, 'artist');
        this.renderItems('grid-albums', DATA.albums);
        this.renderItems('grid-recommended', DATA.trending);
        this.renderItems('grid-more', DATA.albums);
    },

    renderItems(id, items, type = 'squared') {
        const el = document.getElementById(id);
        if (!el) return;
        if (!items || items.length === 0) {
            el.innerHTML = '<p style="color:var(--text-secondary);padding:20px">No items found.</p>';
            return;
        }
        el.innerHTML = items.map(i => `
            <div class="card router-link ${type === 'artist' ? 'artist-c' : ''}"
                 data-path="${type === 'artist' ? 'artist' : 'album'}"
                 data-id="${i.t || i.n}">
                <div class="card-img-container">
                    <div class="card-img" style="${i.i ? `background-image:url('${i.i}');background-size:cover;` : `background:${i.c}`}"></div>
                    <div class="play-btn">
                        <svg viewBox="0 0 24 24" width="24" fill="black"><path d="M7 6v12l10-6z"/></svg>
                    </div>
                </div>
                <div class="card-t">${i.t || i.n}</div>
                <div class="card-d" style="display:flex;align-items:center;gap:4px;">
                    ${i.e ? '<span class="explicit-badge" style="margin:0">E</span>' : ''}
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${i.a || i.artist || (type === 'artist' ? 'Artist' : '')}
                    </span>
                </div>
            </div>
        `).join('');
    },

    renderSearch() {
        this.renderItems('grid-search-trending', DATA.browseTrending);
        const grid = document.getElementById('grid-categories');
        if (grid) {
            grid.innerHTML = DATA.categories.map(c => `
                <div class="category-card" style="background:${c.c}">
                    <h3>${c.t}</h3>
                    <div class="category-img"></div>
                </div>
            `).join('');
        }
    },

    renderArtist(id) {
        const nameEl = document.getElementById('artist-profile-name');
        const table = document.getElementById('artist-popular-table');
        if (nameEl) nameEl.textContent = id || 'Artist Profile';
        if (table) {
            const tracks = [
                { t: 'Popular Song 1', v: '150,456,123' },
                { t: 'Popular Song 2', v: '98,123,456' },
                { t: 'Popular Song 3', v: '75,000,000' },
                { t: 'Popular Song 4', v: '60,456,789' },
                { t: 'Popular Song 5', v: '45,001,002' }
            ];
            table.innerHTML = tracks.map((tr, idx) => `
                <tr class="track-row">
                    <td class="track-num">${idx + 1}</td>
                    <td class="track-main">
                        <div class="track-thumb"></div>
                        <div><div class="track-title">${tr.t}</div></div>
                    </td>
                    <td class="track-album" style="color:var(--text-secondary)">${tr.v} plays</td>
                    <td class="track-time">3:45</td>
                </tr>
            `).join('');
        }
    },

    renderAlbum(id) {
        const nameEl = document.getElementById('album-profile-name');
        const table = document.getElementById('album-tracks-table');
        if (nameEl) nameEl.textContent = id || 'Album Title';
        if (table) {
            const tracks = ['Track 1', 'Track 2', 'Track 3', 'Track 4', 'Track 5', 'Track 6', 'Track 7', 'Track 8'];
            table.innerHTML = tracks.map((tr, idx) => `
                <tr class="track-row">
                    <td class="track-num">${idx + 1}</td>
                    <td class="track-main"><div class="track-title">${tr}</div></td>
                    <td class="track-time">3:20</td>
                </tr>
            `).join('');
        }
    },

    // ── Render Profile ───────────────────────────────────────
    renderProfile() {
        const nameEl = document.getElementById('profile-display-name');
        const avatarEl = document.getElementById('profile-avatar');
        const playlistsEl = document.getElementById('profile-playlists-count');
        const followersEl = document.getElementById('profile-followers-count');
        const followingEl = document.getElementById('profile-following-count');

        if (State.user) {
            // Set user name
            if (nameEl) nameEl.textContent = State.user.name || 'User';
            if (avatarEl) avatarEl.textContent = (State.user.name || 'U').charAt(0).toUpperCase();

            // Set placeholder stats
            if (playlistsEl) playlistsEl.textContent = '0';
            if (followersEl) followersEl.textContent = '0';
            if (followingEl) followingEl.textContent = '0';
        } else {
            // Redirect to home if not logged in
            this.navigate('home');
        }
    },

    // ── Firebase Auth Forms ──────────────────────────────
    // ── Fetch with timeout ────────────────────────────────
    async fetchWithTimeout(url, options = {}, ms = 15000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            return res;
        } catch (err) {
            if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection and try again.');
            throw new Error('Cannot reach the server. Make sure it is running on port 5000.');
        } finally {
            clearTimeout(timer);
        }
    },

    setupAuthForms(path) {
        const form = document.querySelector('.auth-form');
        if (!form) {
            console.error('Form not found');
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted for:', path);
            this.clearAuthError();

            const btn = form.querySelector('.auth-submit');
            const originalText = btn.textContent;
            btn.textContent = 'Please wait…';
            btn.disabled = true;

            try {
                if (path === 'signup') {
                    await this.handleSignup(form);
                } else {
                    await this.handleLogin(form);
                }
            } catch (err) {
                this.showAuthError(err.message || 'Something went wrong. Please try again.');
            } finally {
                // Always re-enable button
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    },

    async handleSignup(form) {
        const email = form.querySelector('#signup-email')?.value?.trim();
        const password = form.querySelector('#signup-password')?.value;
        const name = form.querySelector('#signup-name')?.value?.trim();

        if (!email || !password) throw new Error('Email and password are required.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');

        const res = await this.fetchWithTimeout('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(this.friendlyError(data.error));

        // Check if account was created but requires email verification
        if (data.requiresVerification) {
            // Show success message and redirect to login
            this.showSignupSuccess();
            return;
        }

        // If token is returned, log in (for backward compatibility)
        if (data.token) {
            this.login({
                name: data.displayName || name || email.split('@')[0],
                email: data.email,
                uid: data.uid,
                token: data.token || null
            });
        }
    },

    showSignupSuccess() {
        // Navigate to login with success message
        this.navigate('login', true);
        // Show success message after navigation
        setTimeout(() => {
            const authMount = document.getElementById('auth-mount');
            if (authMount) {
                const successEl = document.createElement('div');
                successEl.className = 'auth-success';
                successEl.style.cssText = [
                    'background:rgba(30,215,96,0.12)',
                    'border:1px solid rgba(30,215,96,0.35)',
                    'color:#1ed760',
                    'padding:16px',
                    'border-radius:8px',
                    'font-size:0.9rem',
                    'margin-bottom:16px',
                    'text-align:center',
                    'animation:authFadeIn 0.3s ease'
                ].join(';');
                successEl.innerHTML = `
                    <strong>Account created!</strong><br>
                    Please check your email to verify your account.<br>
                    <span style="font-size:0.85rem;color:#b3b3b3">Then log in with your credentials.</span>
                `;
                const authCard = authMount.querySelector('.auth-card');
                if (authCard) {
                    authCard.insertBefore(successEl, authCard.firstChild);
                }
            }
        }, 100);
    },

    async handleLogin(form) {
        const email = form.querySelector('#login-email')?.value?.trim();
        const password = form.querySelector('#login-password')?.value;

        if (!email || !password) throw new Error('Please enter your email and password.');

        const res = await this.fetchWithTimeout('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(this.friendlyError(data.error));

        // Pass token to login function
        this.login({
            name: data.displayName || email.split('@')[0],
            email: data.email,
            uid: data.uid,
            token: data.token || null
        });
    },

    friendlyError(raw = '') {
        const map = {
            'EMAIL_EXISTS': 'An account with this email already exists.',
            'INVALID_PASSWORD': 'Incorrect password. Please try again.',
            'EMAIL_NOT_FOUND': 'No account found with that email.',
            'INVALID_EMAIL': 'Please enter a valid email address.',
            'WEAK_PASSWORD': 'Password is too weak. Use at least 8 characters.',
            'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many failed attempts. Please try again later.',
            'USER_DISABLED': 'This account has been disabled.',
            'INVALID_LOGIN_CREDENTIALS': 'Incorrect email or password.',
        };
        for (const key of Object.keys(map)) {
            if (raw.includes(key)) return map[key];
        }
        return raw || 'Something went wrong. Please try again.';
    },

    showAuthError(msg) {
        this.clearAuthError();
        const errEl = document.createElement('div');
        errEl.className = 'auth-error';
        errEl.style.cssText = [
            'background:rgba(255,50,50,0.12)',
            'border:1px solid rgba(255,80,80,0.35)',
            'color:#ff7070',
            'padding:12px 16px',
            'border-radius:8px',
            'font-size:0.85rem',
            'margin-bottom:16px',
            'text-align:left',
            'animation:authFadeIn 0.2s ease'
        ].join(';');
        errEl.textContent = msg;
        const authForm = document.querySelector('.auth-form');
        if (authForm) authForm.prepend(errEl);
    },

    clearAuthError() {
        document.querySelectorAll('.auth-error').forEach(el => el.remove());
    },

    // ── Auth State ───────────────────────────────────────
    login(user) {
        State.user = user;
        State.isLoggedIn = true;
        this.saveSession(user);
        this.updateUI();
        this.navigate('home');
    },

    logout() {
        State.user = null;
        State.isLoggedIn = false;
        this.clearSession();
        this.updateUI();
        this.navigate('home');
    },

    updateUI() {
        const authG = document.getElementById('auth-group');
        const userG = document.getElementById('user-group');
        const promo = document.getElementById('logged-out-promo');
        const player = document.getElementById('main-player');

        if (State.isLoggedIn) {
            if (authG) authG.classList.add('hidden');
            if (userG) userG.classList.remove('hidden');
            if (promo) promo.classList.add('hidden');
            if (player) player.classList.remove('hidden');
            const avatar = document.getElementById('avatar-circle');
            if (avatar && State.user?.name) avatar.textContent = State.user.name.charAt(0).toUpperCase();
        } else {
            if (authG) authG.classList.remove('hidden');
            if (userG) userG.classList.add('hidden');
            if (player) player.classList.add('hidden');
            if (promo) {
                if (State.promoConfig?.dismissed) {
                    promo.classList.add('promo-dismissed');
                    promo.classList.remove('visible');
                } else {
                    promo.classList.remove('promo-dismissed');
                }
            }
        }
    }
};

// Boot - with error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.message);
});

document.addEventListener('DOMContentLoaded', () => {
    try {
        App.init();
    } catch (err) {
        console.error('App init error:', err);
        // Show auth buttons even if there's an error
        const authG = document.getElementById('auth-group');
        if (authG) authG.classList.remove('hidden');
    }
});
