document.addEventListener('DOMContentLoaded', () => {
    let portfolioData = {}; // Global variable to store fetched data

    // --- Theme Toggle Logic ---
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Function to set theme
    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-theme');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            body.classList.remove('light-theme');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
        localStorage.setItem('theme', theme); // Save preference
    }

    // Check saved theme preference on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Optional: Default to dark theme if no preference found (or check system preference)
        setTheme('dark');
        // You could also check system preference:
        // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        //     setTheme('light');
        // } else {
        //     setTheme('dark');
        // }
    }

    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });
    // --- End Theme Toggle Logic ---


    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            portfolioData = data;
            populatePersonalInfo(portfolioData.personal_info);
            populateAboutMe(portfolioData.personal_info.about_me);
            populateSkills(portfolioData.skills);
            populateExperience(portfolioData.experience);
            populateProjectCards(portfolioData.projects);
            populateEducation(portfolioData.education);
            populateContactSection(portfolioData.personal_info);
            updateFooterYear();
            setupNavbar();
        })
        .catch(error => {
            console.error('Error fetching portfolio data:', error);
            document.getElementById('profile-img').alt = 'Profile picture failed to load.';
            document.getElementById('user-name').textContent = 'Mohamed Rashad (Data Error)';
            document.getElementById('user-title').textContent = 'Please try again later.';
            document.getElementById('about-me-text').textContent = 'Failed to load About Me section.';
            document.getElementById('technical-skills-progress-container').innerHTML = '<p style="text-align: center; color: red;">Failed to load technical skills.</p>';
            document.getElementById('experience-container').innerHTML = '<p style="text-align: center; color: red;">Failed to load experience data.</p>';
            document.getElementById('projects-container').innerHTML = '<p style="text-align: center; color: red;">Failed to load project data.</p>';
            document.getElementById('education-container').innerHTML = '<p style="text-align: center; color: red;">Failed to load education data.</p>';
            document.querySelector('.contact-content').innerHTML = '<p style="text-align: center; color: red;">Failed to load contact info.</p>';
        });

    function populatePersonalInfo(info) {
        document.getElementById('profile-img').src = info.profile_image;
        document.getElementById('user-name').textContent = info.name;
        document.getElementById('user-title').textContent = info.title;
        document.getElementById('cv-download-btn').href = info.cv_download;
    }

    function populateAboutMe(aboutText) {
        document.getElementById('about-me-text').textContent = aboutText;
    }

    function populateSkills(skills) {
        const technicalSkillsContainer = document.getElementById('technical-skills-progress-container');
        technicalSkillsContainer.innerHTML = '';

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const skillObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.progress-bar-fill');
                    const level = progressBar.dataset.level;
                    progressBar.style.width = `${level}%`;
                    progressBar.classList.add('filled');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        skills.technical_skills.forEach(skill => {
            const skillItemDiv = document.createElement('div');
            skillItemDiv.classList.add('skill-progress-item');

            skillItemDiv.innerHTML = `
                <div class="skill-name-level">
                    <span>${skill.name}</span>
                    <span>${skill.level}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" data-level="${skill.level}"></div>
                </div>
            `;
            technicalSkillsContainer.appendChild(skillItemDiv);
            skillObserver.observe(skillItemDiv);
        });
    }

    function populateExperience(experience) {
        const experienceContainer = document.getElementById('experience-container');
        experienceContainer.innerHTML = '';

        experience.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('experience-entry');
            entryDiv.setAttribute('data-aos', 'fade-up');
            entryDiv.setAttribute('data-aos-delay', (index * 150).toString());

            const contentAlignmentClass = index % 2 === 0 ? 'align-right' : 'align-left';

            entryDiv.innerHTML = `
                <div class="experience-entry-dot"></div>
                <div class="experience-content ${contentAlignmentClass}">
                    <h3>${entry.title}</h3>
                    <h4>${entry.company} - ${entry.location}</h4>
                    <span class="date-range">${entry.date_range}</span>
                    <ul>
                        ${entry.description_points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            `;
            experienceContainer.appendChild(entryDiv);
        });
    }

    function populateProjectCards(projects) {
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = '';

        projects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');
            projectCard.setAttribute('data-aos', 'fade-up');
            projectCard.setAttribute('data-aos-delay', (index * 100).toString());

            projectCard.innerHTML = `
                <img src="${project.cover_image}" alt="${project.name} Cover" class="project-card-image" loading="lazy">
                <div class="project-card-content">
                    <h3>${project.name}</h3>
                    <p>${project.short_description}</p>
                </div>
            `;
            projectCard.dataset.projectIndex = index;
            projectCard.addEventListener('click', () => openProjectDetailModal(portfolioData.projects[index]));

            projectsContainer.appendChild(projectCard);
        });
    }

    function populateEducation(education) {
        const educationContainer = document.getElementById('education-container');
        educationContainer.innerHTML = '';

        education.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('education-entry');
            entryDiv.setAttribute('data-aos', 'fade-up');
            entryDiv.setAttribute('data-aos-delay', (index * 150).toString());

            entryDiv.innerHTML = `
                <h3>${entry.degree}</h3>
                <h4>${entry.institution}</h4>
                <span class="date-range">${entry.date_range}</span>
            `;
            educationContainer.appendChild(entryDiv);
        });
    }

    function populateContactSection(info) {
        document.getElementById('contact-phone').textContent = info.contact.phone;
        document.getElementById('contact-email').href = `mailto:${info.contact.email}`;
        document.getElementById('contact-email').textContent = info.contact.email;

        document.getElementById('send-email-btn').href = `mailto:${info.contact.email}`;

        const contactSocialLinksContainer = document.getElementById('contact-social-links-container');
        contactSocialLinksContainer.innerHTML = '';
        info.social_links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            let iconClass = '';
            switch (link.platform.toLowerCase()) {
                case 'github':
                    iconClass = 'fab fa-github';
                    break;
                case 'linkedin':
                    iconClass = 'fab fa-linkedin';
                    break;
                default:
                    iconClass = 'fas fa-link';
            }
            a.innerHTML = `<i class="${iconClass}"></i>`;
            contactSocialLinksContainer.appendChild(a);
        });
    }

    function updateFooterYear() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }

    function setupNavbar() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    const projectDetailModal = document.getElementById('projectDetailModal');
    const projectModalClose = document.querySelector('.project-modal-close');

    function openProjectDetailModal(project) {
        document.getElementById('modalProjectName').textContent = project.name;
        document.getElementById('modalProjectCover').src = project.cover_image;
        document.getElementById('modalProjectDescription').textContent = project.description;

        const featuresContainer = projectDetailModal.querySelector('#modalProjectFeatures ul');
        featuresContainer.innerHTML = project.features.map(feature => `<li>${feature}</li>`).join('');
        document.getElementById('modalProjectFeatures').style.display = project.features.length > 0 ? 'block' : 'none';

        const technologiesContainer = projectDetailModal.querySelector('#modalProjectTechnologies ul');
        technologiesContainer.innerHTML = project.technologies_used.map(tech => `<li>${tech}</li>`).join('');
        document.getElementById('modalProjectTechnologies').style.display = project.technologies_used.length > 0 ? 'block' : 'none';

        const linksContainer = projectDetailModal.querySelector('#modalProjectLinks .project-links');
        linksContainer.innerHTML = project.links.map(link => `
            <a href="${link.url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">${link.type}</a>
        `).join('');
        document.getElementById('modalProjectLinks').style.display = project.links.length > 0 ? 'block' : 'none';

        const mediaGrid = projectDetailModal.querySelector('#modalProjectMedia .project-media-grid');
        mediaGrid.innerHTML = project.media.map(mediaItem => `
            ${(mediaItem.type === 'screenshot' || mediaItem.type === 'gif') ?
                `<img src="${mediaItem.url}" alt="${project.name} ${mediaItem.type}" class="media-item" data-src="${mediaItem.url}" data-type="${mediaItem.type}" loading="lazy">` :
                `<video src="${mediaItem.url}" class="media-item" controls preload="metadata" data-src="${mediaItem.url}" data-type="${mediaItem.type}" loading="lazy"></video>`
            }
        `).join('');
        document.getElementById('modalProjectMedia').style.display = project.media.length > 0 ? 'block' : 'none';

        projectDetailModal.style.display = 'block';
        document.body.classList.add('modal-open');

        setupMediaModalListeners();
    }

    projectModalClose.addEventListener('click', () => {
        projectDetailModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        projectDetailModal.querySelectorAll('video').forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    });

    projectDetailModal.addEventListener('click', (e) => {
        if (e.target === projectDetailModal) {
            projectDetailModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            projectDetailModal.querySelectorAll('video').forEach(video => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });

    const mediaModal = document.getElementById('mediaModal');
    const modalMediaImage = document.getElementById('modalMediaImage');
    const modalMediaVideo = document.getElementById('modalMediaVideo');
    const mediaModalClose = document.querySelector('.media-modal-close');

    function setupMediaModalListeners() {
        document.querySelectorAll('.media-item').forEach(item => {
            item.removeEventListener('click', handleMediaItemClick);
        });
        document.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', handleMediaItemClick);
        });
    }

    function handleMediaItemClick() {
        const src = this.getAttribute('data-src');
        const type = this.getAttribute('data-type');

        if (type === 'screenshot' || type === 'gif') {
            modalMediaImage.src = src;
            modalMediaImage.style.display = 'block';
            modalMediaVideo.style.display = 'none';
        } else if (type === 'demo_video') {
            modalMediaVideo.src = src;
            modalMediaVideo.style.display = 'block';
            modalMediaImage.style.display = 'none';
            modalMediaVideo.load();
            modalMediaVideo.play();
        }
        mediaModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    mediaModalClose.addEventListener('click', () => {
        mediaModal.style.display = 'none';
        modalMediaVideo.pause();
        modalMediaVideo.currentTime = 0;
        if (projectDetailModal.style.display !== 'block') {
            document.body.classList.remove('modal-open');
        }
    });

    mediaModal.addEventListener('click', (e) => {
        if (e.target === mediaModal) {
            mediaModal.style.display = 'none';
            modalMediaVideo.pause();
            modalMediaVideo.currentTime = 0;
            if (projectDetailModal.style.display !== 'block') {
                document.body.classList.remove('modal-open');
            }
        }
    });
});