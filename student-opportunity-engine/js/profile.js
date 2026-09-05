// profile.js

const profileModule = {
    init: () => {
        window.components.renderSidebar('sidebar-container');
        window.components.renderHeader('header-container');

        // Scrollspy-like nav
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
                throw new Error("Empty profile data");
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
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
        if (form.elements['bio']) form.elements['bio'].value = data.bio || '';
        
        // Education
        if (form.elements['education']) form.elements['education'].value = data.educationLevel || '';
        if (form.elements['careerGoal']) form.elements['careerGoal'].value = data.careerGoal || '';
        if (form.elements['interests']) form.elements['interests'].value = (data.interests || []).join(', ');
        
        // Preferences
        if (form.elements['preferredMode']) form.elements['preferredMode'].value = data.preferredMode || 'any';
        if (form.elements['preferredLocation']) form.elements['preferredLocation'].value = data.preferredLocation || '';
    },

    handleSave: async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('save-btn');
        btn.disabled = true;
        btn.innerText = 'Saving...';
        
        const form = document.getElementById('profile-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Transform interests into array
        if (data.interests) {
            data.interests = data.interests.split(',').map(s => s.trim()).filter(Boolean);
        }

        try {
            await window.api.updateProfile(data);
            window.components.showToast('success', 'Profile updated successfully');
        } catch (error) {
            console.error("Failed to save profile:", error);
            window.components.showToast('error', 'Failed to save changes. Please try again.');
        } finally {
            btn.disabled = false;
            btn.innerText = 'Save Changes';
        }
    }
};

document.addEventListener('DOMContentLoaded', profileModule.init);
