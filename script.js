/* Smart Form Validator - script.js
   Features implemented:
   - Real-time validation (input & blur)
   - Form-level validation on submit (prevents invalid submissions)
   - Dark/light theme toggle persisted in localStorage
   - Autosave / load draft to localStorage (file input excluded)
   - File validation (type & max size)
   - Simple accessible success modal
   - Responsive & accessible interactions
*/

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('application-form');
    const fields = {
        first_name: document.getElementById('first_name'),
        last_name: document.getElementById('last_name'),
        email: document.getElementById('email'),
        job_role: document.getElementById('job_role'),
        address: document.getElementById('address'),
        city: document.getElementById('city'),
        pin_code: document.getElementById('pin_code'),
        date: document.getElementById('date'),
        upload: document.getElementById('upload')
    };
    const saveDraftBtn = document.getElementById('saveDraft');
    const clearDraftBtn = document.getElementById('clearDraft');
    const themeToggle = document.getElementById('themeToggle');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');

    const DRAFT_KEY = 'smartform:draft';
    const THEME_KEY = 'smartform:theme';

    // File validation config
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_MIME = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    // Helpers
    const getControl = el => el.parentElement;
    const setError = (el, msg) => {
        const ctrl = getControl(el);
        ctrl.classList.remove('success');
        ctrl.classList.add('error');
        const note = ctrl.querySelector('.error-message');
        if (note) note.innerText = msg;
    };
    const setSuccess = (el) => {
        const ctrl = getControl(el);
        ctrl.classList.remove('error');
        ctrl.classList.add('success');
        const note = ctrl.querySelector('.error-message');
        if (note) note.innerText = '';
    };

    // Validation functions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateFirstName() {
        const v = fields.first_name.value.trim();
        if (!v) { setError(fields.first_name, 'First name is required'); return false; }
        if (v.length < 2) { setError(fields.first_name, 'Enter at least 2 characters'); return false; }
        setSuccess(fields.first_name); return true;
    }
    function validateLastName() {
        const v = fields.last_name.value.trim();
        if (!v) { setError(fields.last_name, 'Last name is required'); return false; }
        if (v.length < 2) { setError(fields.last_name, 'Enter at least 2 characters'); return false; }
        setSuccess(fields.last_name); return true;
    }
    function validateEmail() {
        const v = fields.email.value.trim();
        if (!v) { setError(fields.email, 'Email is required'); return false; }
        if (!emailRegex.test(v)) { setError(fields.email, 'Provide a valid email'); return false; }
        setSuccess(fields.email); return true;
    }
    function validateJobRole() {
        const v = fields.job_role.value;
        if (!v) { setError(fields.job_role, 'Please select a job role'); return false; }
        setSuccess(fields.job_role); return true;
    }
    function validateAddress() {
        const v = fields.address.value.trim();
        if (!v) { setError(fields.address, 'Address is required'); return false; }
        if (v.length < 10) { setError(fields.address, 'Please provide a more detailed address (min 10 chars)'); return false; }
        setSuccess(fields.address); return true;
    }
    function validateCity() {
        const v = fields.city.value.trim();
        if (!v) { setError(fields.city, 'City is required'); return false; }
        setSuccess(fields.city); return true;
    }
    function validatePin() {
        const v = fields.pin_code.value.trim();
        if (!v) { setError(fields.pin_code, 'Pin code is required'); return false; }
        if (!/^\d{6}$/.test(v)) { setError(fields.pin_code, 'Pin code must be exactly 6 digits'); return false; }
        setSuccess(fields.pin_code); return true;
    }
    function validateDate() {
        const v = fields.date.value;
        if (!v) { setError(fields.date, 'Start date is required'); return false; }
        const selected = new Date(v + 'T00:00:00');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (selected < today) { setError(fields.date, 'Start date cannot be in the past'); return false; }
        setSuccess(fields.date); return true;
    }
    function validateUpload() {
        const input = fields.upload;
        const files = input.files;
        if (!files || files.length === 0) { setError(input, 'Please upload your CV (pdf/doc/jpg/png)'); return false; }
        const f = files[0];
        if (!ALLOWED_MIME.includes(f.type)) { setError(input, 'Invalid file type. Allowed: PDF/DOC/DOCX/JPG/PNG'); input.value = ''; return false; }
        if (f.size > MAX_FILE_SIZE) { setError(input, 'File too large. Max 2MB'); input.value = ''; return false; }
        setSuccess(input); return true;
    }

    function validateAll() {
        const validators = [
            validateFirstName, validateLastName, validateEmail,
            validateJobRole, validateAddress, validateCity,
            validatePin, validateDate, validateUpload
        ];
        let ok = true;
        validators.forEach(fn => { if (!fn()) ok = false; });
        return ok;
    }

    // Debounce helper
    function debounce(fn, wait = 250) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Real-time validation listeners
    fields.first_name.addEventListener('input', debounce(validateFirstName, 300));
    fields.last_name.addEventListener('input', debounce(validateLastName, 300));
    fields.email.addEventListener('input', debounce(validateEmail, 300));
    fields.job_role.addEventListener('change', validateJobRole);
    fields.address.addEventListener('input', debounce(validateAddress, 400));
    fields.city.addEventListener('input', debounce(validateCity, 300));
    fields.pin_code.addEventListener('input', debounce(validatePin, 250));

    // Feature: Input Masking for Pin Code (digits only)
    fields.pin_code.addEventListener('input', (e) => {
        // Remove any character that is not a digit
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        // Limit to 6 chars immediately
        if (e.target.value.length > 6) {
            e.target.value = e.target.value.slice(0, 6);
        }
    });

    fields.date.addEventListener('change', validateDate);
    fields.upload.addEventListener('change', validateUpload);

    // Validate on blur for accessibility
    Object.values(fields).forEach(el => el.addEventListener('blur', () => {
        const fnMap = {
            first_name: validateFirstName, last_name: validateLastName, email: validateEmail,
            job_role: validateJobRole, address: validateAddress, city: validateCity,
            pin_code: validatePin, date: validateDate, upload: validateUpload
        };
        const name = el.id;
        if (fnMap[name]) fnMap[name]();
    }));

    // Submit handling (Async with Formspree - Fixed for Free Tier + Confetti)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Run Validation
        if (!validateAll()) {
            const firstInvalid = document.querySelector('.form_control.error input, .textarea_control.error textarea, .form_control.error select, .form_control.error input[type="file"]');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // 2. Prepare to send (Loading State)
        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
            // A. Create the FormData object
            const formData = new FormData(form);

            // B. Delete the file upload field (Fix for Formspree Free Tier)
            formData.delete('upload');

            // C. Send the modified data
            // REPLACE THIS URL WITH YOUR ACTUAL FORMSPREE URL
            const response = await fetch("https://formspree.io/f/xnnevynr", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            // 4. Handle Success
            if (response.ok) {
                showModal(); // Show your success modal

                // --- 🎉 CONFETTI TRIGGER ---
                // This fires the confetti explosion!
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0b76ff', '#22c55e', '#ffffff'] // Matches your theme colors
                });

                localStorage.removeItem(DRAFT_KEY); // Clear draft
                form.reset(); // Clear the inputs

                // Remove green borders
                document.querySelectorAll('.form_control.success, .textarea_control.success').forEach(c => c.classList.remove('success'));
            } else {
                // 5. Handle Server Errors
                const data = await response.json();
                if (Object.hasOwnProperty.call(data, 'errors')) {
                    alert(data.errors.map(error => error.message).join(", "));
                } else {
                    alert("Oops! There was a problem submitting your application.");
                }
            }
        } catch (error) {
            // 6. Handle Network Errors
            alert("Network error. Please check your internet connection.");
            console.error(error);
        } finally {
            // 7. Reset Button State
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });

    // Save draft & clear draft
    function saveDraft(showFeedback = true) {
        try {
            const payload = {
                first_name: fields.first_name.value,
                last_name: fields.last_name.value,
                email: fields.email.value,
                job_role: fields.job_role.value,
                address: fields.address.value,
                city: fields.city.value,
                pin_code: fields.pin_code.value,
                date: fields.date.value,
                // file intentionally excluded for privacy/security
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
            if (showFeedback) {
                saveDraftBtn.innerText = 'Saved';
                setTimeout(() => saveDraftBtn.innerText = 'Save Draft', 1100);
            }
        } catch (err) {
            console.error('Save draft failed', err);
        }
    }

    saveDraftBtn.addEventListener('click', () => saveDraft(true));
    clearDraftBtn.addEventListener('click', () => {
        localStorage.removeItem(DRAFT_KEY);
        alert('Draft cleared');
    });

    // Autosave on input/change (throttled)
    ['input', 'change'].forEach(evt => form.addEventListener(evt, debounce(saveDraft, 900)));

    // Load draft
    (function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            Object.keys(data).forEach(k => {
                if (fields[k] && typeof fields[k].value !== 'undefined') fields[k].value = data[k];
            });
        } catch (err) {
            console.warn('Load draft failed', err);
        }
    })();

    // Theme toggle
    (function initTheme() {
        const t = localStorage.getItem(THEME_KEY);
        if (t === 'dark') {
            document.body.classList.add('dark');
            themeToggle.setAttribute('aria-pressed', 'true');
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.setAttribute('aria-pressed', 'false');
            themeToggle.textContent = '🌙';
        }
    })();

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });

    // Modal controls
    const closeBtn = document.getElementById('closeModal');
    closeBtn?.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    function showModal() {
        modal.setAttribute('aria-hidden', 'false');
        // auto close after 3s
        setTimeout(hideModal, 3000);
    }
    function hideModal() {
        modal.setAttribute('aria-hidden', 'true');
    }

}); // DOMContentLoaded end
