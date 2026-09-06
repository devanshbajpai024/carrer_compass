// profile.js

const profileModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        const navItems = document.querySelectorAll('.profile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navItems.forEach(n => n.classList.remove('active'));
                e.target.classList.add('active');
                const targetId = `section-${e.target.dataset.target}`;
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        document.getElementById('profile-form').addEventListener('submit', profileModule.handleSave);
        document.getElementById('cancel-btn').addEventListener('click', () => {
            window.location.reload();
        });

        profileModule.loadData();
    },

    loadData: async () => {
        const loader = document.getElementById('profile-loader');
        const form = document.getElementById('profile-form');
        const errorContainer = document.getElementById('profile-error-container');

        loader.classList.remove('hidden');
        form.classList.add('hidden');
        errorContainer.classList.add('hidden');

        try {
            const data = await window.api.getProfile();

            if (data) {
                profileModule.populateForm(data);
                loader.classList.add('hidden');
                form.classList.remove('hidden');
            } else {
                throw new Error('Empty profile data');
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            loader.classList.add('hidden');
            errorContainer.classList.remove('hidden');
            window.components.renderErrorState('profile-error-container', 'Unable to load profile data', profileModule.loadData);
        }
    },

    populateForm: (data) => {
        const form = document.getElementById('profile-form');

        // Personal
        if (form.elements['name']) form.elements['name'].value = data.name || '';
        if (form.elements['email']) form.elements['email'].value = data.email || '';

        // Education — backend stores as nested object { degree, branch, college, year, cgpa }
        const edu = data.education || {};
        if (form.elements['degree']) form.elements['degree'].value = edu.degree || '';
        if (form.elements['branch']) form.elements['branch'].value = edu.branch || '';
        if (form.elements['college']) form.elements['college'].value = edu.college || '';
        if (form.elements['year']) form.elements['year'].value = edu.year || '';
        if (form.elements['cgpa']) form.elements['cgpa'].value = edu.cgpa || '';

        // Career & Interests — careerGoals is an array, interests is an array
        if (form.elements['careerGoal']) form.elements['careerGoal'].value = (data.careerGoals || []).join(', ');
        if (form.elements['interests']) form.elements['interests'].value = (data.interests || []).join(', ');

        // Preferences
        const prefs = data.preferences || {};
        if (form.elements['preferredMode']) {
            form.elements['preferredMode'].value = prefs.remote ? 'remote' : 'any';
        }
    },

    handleSave: async (e) => {
        e.preventDefault();

        const btn = document.getElementById('save-btn');
        btn.disabled = true;
        btn.innerText = 'Saving...';

        const form = document.getElementById('profile-form');

        // Build properly shaped payload matching backend User schema
        const payload = {
            name: form.elements['name'] ? form.elements['name'].value.trim() : undefined,
            education: {
                degree: form.elements['degree'] ? form.elements['degree'].value.trim() : '',
                branch: form.elements['branch'] ? form.elements['branch'].value.trim() : '',
                college: form.elements['college'] ? form.elements['college'].value.trim() : '',
                year: form.elements['year'] ? Number(form.elements['year'].value) || undefined : undefined,
                cgpa: form.elements['cgpa'] ? parseFloat(form.elements['cgpa'].value) || undefined : undefined
            },
            // careerGoals is an array
            careerGoals: form.elements['careerGoal']
                ? form.elements['careerGoal'].value.split(',').map(s => s.trim()).filter(Boolean)
                : undefined,
            // interests is an array
            interests: form.elements['interests']
                ? form.elements['interests'].value.split(',').map(s => s.trim()).filter(Boolean)
                : undefined,
            preferences: {
                remote: form.elements['preferredMode']
                    ? form.elements['preferredMode'].value === 'remote'
                    : false
            }
        };

        try {
            await window.api.updateProfile(payload);
            window.components.showToast('success', 'Profile updated successfully');
        } catch (error) {
            console.error('Failed to save profile:', error);
            window.components.showToast('error', 'Failed to save changes: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Save Changes';
        }
    }
};

document.addEventListener('DOMContentLoaded', profileModule.init);
