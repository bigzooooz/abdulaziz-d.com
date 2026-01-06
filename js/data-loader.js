/*
 * Data Loader - Loads and populates page content from data.json
 */

(function($) {
    "use strict";

    let siteData = null;

    // Load JSON data
    function loadData() {
        return $.getJSON('data.json')
            .done(function(data) {
                siteData = data;
                populatePage();
            })
            .fail(function(jqxhr, textStatus, error) {
                console.error('Error loading data.json:', textStatus, error);
            });
    }

    // Populate all page sections
    function populatePage() {
        if (!siteData) return;

        populateHeader();
        populateHome();
        populateAbout();
        populateResume();
        populateClients();
        populateTools();
        populateHonors();
        updateMetaTags();
    }

    // Populate header section
    function populateHeader() {
        const data = siteData.siteMeta;
        
        // Header titles
        $('.header-titles h2').text(data.owner.name);
        $('.header-titles h4').text(data.subtitle);

        // Social links
        const socialLinks = $('.social-links ul');
        socialLinks.empty();
        
        if (data.social.linkedin) {
            socialLinks.append(`<li><a href="${data.social.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a></li>`);
        }
        if (data.social.twitter) {
            socialLinks.append(`<li><a href="${data.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a></li>`);
        }
        if (data.social.github) {
            socialLinks.append(`<li><a href="${data.social.github}" target="_blank"><i class="fab fa-github"></i></a></li>`);
        }

        // Update CVE link in menu if it exists
        if (data.social.cve) {
            $('a[href*="CVE"]').attr('href', data.social.cve);
        }

        // Header badges
        const headerButtons = $('.header-buttons');
        headerButtons.empty();
        
        siteData.badges.forEach(function(badge) {
            // Add specific classes for badges
            const isGuinness = badge.name && badge.name.toLowerCase().includes('guinness');
            const isEJPT = badge.name && badge.name.toLowerCase().includes('ejpt');
            const isICCA = badge.name && badge.name.toLowerCase().includes('icca');
            
            let badgeClass = 'ine-badge';
            if (isGuinness) badgeClass += ' guinness-badge';
            if (isEJPT) badgeClass += ' ejpt-badge';
            if (isICCA) badgeClass += ' icca-badge';
            
            if (badge.url) {
                // Check if it's an internal link (starts with #)
                const targetAttr = badge.url.startsWith('#') ? '' : 'target="_blank"';
                headerButtons.append(`<a class="${badgeClass}" ${targetAttr} href="${badge.url}"><img src="${badge.image}" alt="${badge.name}" /></a>`);
            } else {
                let imgClass = '';
                if (isGuinness) imgClass += 'guinness-badge';
                headerButtons.append(`<img class="${imgClass}" src="${badge.image}" alt="${badge.name}" />`);
            }
        });
    }

    // Populate home section
    function populateHome() {
        const data = siteData.siteMeta;
        
        // Home title (h1 for SEO)
        $('.title-block h1').text(data.owner.name);

        // Roles carousel
        const carousel = $('.text-rotation');
        // Destroy existing carousel if it exists
        if (carousel.data('owl.carousel')) {
            carousel.trigger('destroy.owl.carousel');
        }
        carousel.empty();
        
        siteData.about.roles.forEach(function(role) {
            carousel.append(`<div class="item"><div class="sp-subtitle">< ${role} /></div></div>`);
        });

        // Reinitialize carousel after content is loaded
        setTimeout(function() {
            $('.text-rotation').owlCarousel({
                loop: true,
                dots: false,
                nav: false,
                margin: 0,
                items: 1,
                autoplay: true,
                autoplayHoverPause: false,
                autoplayTimeout: 3800,
                animateOut: 'animated-section-scaleDown',
                animateIn: 'animated-section-scaleUp'
            });
        }, 200);
    }

    // Populate about section
    function populateAbout() {
        const data = siteData.about;
        const contact = siteData.contact;

        // About summary (plain text for now - internal links can be added manually if needed)
        $('section[data-id="about-me"] .col-xs-12.col-sm-7 p').text(data.summary);

        // Contact info
        $('section[data-id="about-me"] .info-list .value').each(function() {
            const title = $(this).siblings('.title').text();
            if (title === 'Residence') {
                $(this).text(contact.location);
            } else if (title === 'Email') {
                $(this).html(`<a href="mailto:${contact.email}">${contact.email}</a>`);
            } else if (title === 'Phone') {
                $(this).html(`<a href="tel:${contact.phone.replace(/\s/g, '')}">${contact.phone}</a>`);
            }
        });

        // Services
        const servicesRow = $('section[data-id="about-me"] .row').eq(1);
        servicesRow.empty();
        
        // Split services into two columns (2 per column)
        const servicesPerColumn = 2;
        const totalColumns = Math.ceil(data.services.length / servicesPerColumn);
        
        for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
            const startIndex = colIndex * servicesPerColumn;
            const endIndex = Math.min(startIndex + servicesPerColumn, data.services.length);
            const columnServices = data.services.slice(startIndex, endIndex);
            
            let columnHTML = '<div class="col-xs-12 col-sm-6"><div class="col-inner"><div class="info-list-w-icon">';
            
            columnServices.forEach(function(service) {
                let icon = 'lnr-code';
                if (service.title === 'Web Servers') icon = 'lnr-apartment';
                else if (service.title === 'Bug Hunting') icon = 'lnr-bug';
                else if (service.title === 'Technical Consultancy') icon = 'lnr-question-circle';
                
                columnHTML += `
                    <div class="info-block-w-icon">
                        <div class="ci-icon">
                            <i class="lnr ${icon}"></i>
                        </div>
                        <div class="ci-text">
                            <h4>${service.title}</h4>
                            <p>${service.description}</p>
                        </div>
                    </div>
                `;
            });
            
            columnHTML += '</div></div></div>';
            servicesRow.append(columnHTML);
        }

        // Testimonials
        const testimonialsContainer = $('.testimonials.owl-carousel');
        testimonialsContainer.empty();
        
        data.testimonials.forEach(function(testimonial) {
            testimonialsContainer.append(`
                <div class="testimonial">
                    <div class="img"></div>
                    <div class="text">
                        <p>${testimonial.text}</p>
                    </div>
                    <div class="author-info">
                        <h4 class="author">${testimonial.author}</h4>
                        <h5 class="company">${testimonial.position}</h5>
                        <div class="icon">
                            <i class="fas fa-quote-right"></i>
                        </div>
                    </div>
                </div>
            `);
        });

        // Reinitialize testimonials carousel
        setTimeout(function() {
            const testimonialsCarousel = $(".testimonials.owl-carousel");
            // Destroy existing carousel if it exists
            if (testimonialsCarousel.data('owl.carousel')) {
                testimonialsCarousel.trigger('destroy.owl.carousel');
            }
            testimonialsCarousel.owlCarousel({
                nav: true,
                items: 3,
                loop: false,
                navText: false,
                autoHeight: true,
                margin: 25,
                responsive: {
                    0: { items: 1 },
                    480: { items: 1 },
                    768: { items: 2 },
                    1200: { items: 2 }
                }
            });
        }, 200);
    }

    // Populate resume section
    function populateResume() {
        // Experience timeline
        const timeline = $('.timeline');
        timeline.empty();
        
        siteData.experience.forEach(function(exp) {
            timeline.append(`
                <div class="timeline-item clearfix">
                    <div class="left-part">
                        <h5 class="item-period">${exp.period}</h5>
                        <span class="item-company">${exp.company}</span>
                    </div>
                    <div class="divider"></div>
                    <div class="right-part">
                        <h4 class="item-title">${exp.role}</h4>
                    </div>
                </div>
            `);
        });

        // Skills
        const skillsContainer = $('.skills-info');
        skillsContainer.empty();
        
        siteData.skills.technical.forEach(function(skill, index) {
            const skillNum = index + 1; // Starting from skill-1
            skillsContainer.append(`
                <div class="skill clearfix">
                    <h4>${skill.name}</h4>
                    <div class="skill-value">${skill.level}%</div>
                </div>
                <div class="skill-container skill-${skillNum}">
                    <div class="skill-percentage" style="width: ${skill.level}%"></div>
                </div>
            `);
        });

        // Knowledges
        const knowledgesList = $('.knowledges');
        knowledgesList.empty();
        
        siteData.skills.knowledges.forEach(function(knowledge) {
            knowledgesList.append(`<li>${knowledge}</li>`);
        });

        // Certificates
        const certificatesContainer = $('section[data-id="resume"] .row').last();
        certificatesContainer.empty();
        
        siteData.certifications.forEach(function(cert) {
            const credIdHTML = cert.credentialId ? `<div class="certi-id"><span>Cred ID: ${cert.credentialId}</span></div>` : '';
            certificatesContainer.append(`
                <div class="col-xs-12 col-sm-6">
                    <div class="certificate-item clearfix">
                        <div class="certi-logo">
                            <img src="${cert.badgeUrl}" alt="logo" />
                        </div>
                        <div class="certi-content">
                            <div class="certi-title">
                                <h4>${cert.name}</h4>
                            </div>
                            ${credIdHTML}
                            <div class="certi-date">
                                <span>${cert.date}</span>
                            </div>
                            <div class="certi-company">
                                <span>${cert.issuer}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // Populate clients section
    function populateClients() {
        const clientsContainer = $('section[data-id="clients"] .blog-masonry');
        clientsContainer.empty();
        
        siteData.clients.forEach(function(client) {
            const tagHTML = client.tag ? `<div class="category"><a>${client.tag}</a></div>` : '';
            clientsContainer.append(`
                <div class="item post-1">
                    <div class="blog-card">
                        <div class="media-block">
                            ${tagHTML}
                            <a href="${client.projectUrl}" class="ajax-page-load">
                                <img src="${client.image}" class="size-blog-masonry-image-two-c" alt="${client.name}" title="${client.name}" />
                                <div class="mask"></div>
                            </a>
                        </div>
                        <div class="post-info">
                            <a href="${client.projectUrl}" class="ajax-page-load">
                                <h4 class="blog-item-title">${client.name}</h4>
                            </a>
                        </div>
                    </div>
                </div>
            `);
        });

        // Reinitialize masonry after images load
        clientsContainer.imagesLoaded(function() {
            if (clientsContainer.data('masonry')) {
                clientsContainer.masonry('destroy');
            }
            clientsContainer.masonry();
        });
    }

    // Populate tools section
    function populateTools() {
        const toolsContainer = $('section[data-id="tools"] .blog-masonry');
        toolsContainer.empty();
        
        siteData.projectsAndTools.forEach(function(tool) {
            toolsContainer.append(`
                <div class="item post-1">
                    <div class="blog-card">
                        <div class="media-block">
                            <div class="category">
                                <a>${tool.language}</a>
                            </div>
                            <a href="${tool.repository}">
                                <img src="${tool.image}" class="size-blog-masonry-image-two-c" alt="${tool.name}" title="" />
                                <div class="mask"></div>
                            </a>
                        </div>
                        <div class="post-info">
                            <a href="${tool.repository}">
                                <h4 class="blog-item-title">${tool.name}</h4>
                            </a>
                            ${tool.description ? `<p class="tool-description">${tool.description}</p>` : ''}
                        </div>
                    </div>
                </div>
            `);
        });

        // Reinitialize masonry after images load
        toolsContainer.imagesLoaded(function() {
            if (toolsContainer.data('masonry')) {
                toolsContainer.masonry('destroy');
            }
            toolsContainer.masonry();
        });
    }

    // Populate honors section
    function populateHonors() {
        const honorsContainer = $('section[data-id="honors"] .row');
        honorsContainer.empty();
        
        if (!siteData.honorsAndAwards || siteData.honorsAndAwards.length === 0) {
            return;
        }
        
        siteData.honorsAndAwards.forEach(function(honor) {
            const linkHTML = honor.link ? `<div class="honor-link"><a href="${honor.link}" target="_blank">View Details</a></div>` : '';
            
            honorsContainer.append(`
                <div class="col-xs-12 col-sm-12">
                    <div class="certificate-item clearfix honor-item">
                        <div class="certi-logo">
                            <img src="${honor.image || 'img/main_photo.png'}" alt="${honor.title}" />
                        </div>
                        <div class="certi-content">
                            <div class="certi-title">
                                <h4>${honor.title}</h4>
                            </div>
                            <div class="certi-company">
                                <span>${honor.issuer}</span>
                            </div>
                            <div class="certi-date">
                                <span>${honor.date || honor.year}</span>
                            </div>
                            ${honor.description ? `<div class="honor-description"><p>${honor.description}</p></div>` : ''}
                            ${linkHTML}
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // Update meta tags
    function updateMetaTags() {
        const data = siteData.siteMeta;
        const knowledges = siteData.knowledges || [];
        
        // Update title
        const pageTitle = `${data.owner.name} - ${data.subtitle}`;
        document.title = pageTitle;
        
        // Update meta description
        $('meta[name="description"]').attr('content', data.description);
        
        // Update meta keywords (join array)
        const keywordsStr = Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords;
        $('meta[name="keywords"]').attr('content', keywordsStr);
        
        // Update Open Graph tags
        $('meta[property="og:url"]').attr('content', data.url);
        $('meta[property="og:title"]').attr('content', `${data.owner.name} | ${data.subtitle}`);
        $('meta[property="og:description"]').attr('content', data.description);
        $('meta[property="og:image"]').attr('content', data.image);
        
        // Update Twitter tags
        $('meta[property="twitter:url"]').attr('content', data.url);
        $('meta[property="twitter:title"]').attr('content', `${data.owner.name} | ${data.subtitle}`);
        $('meta[property="twitter:description"]').attr('content', data.description);
        $('meta[property="twitter:image"]').attr('content', data.image);
        
        // Update Person structured data (JSON-LD)
        const personStructuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": data.owner.name,
            "alternateName": data.owner.alternateNames || [],
            "url": data.url,
            "image": data.image,
            "jobTitle": data.subtitle,
            "sameAs": [
                data.social.linkedin,
                data.social.twitter,
                data.social.github
            ].filter(Boolean), // Remove empty values
            "knowsAbout": knowledges,
            "description": data.description,
            "email": data.owner.email,
            "telephone": data.owner.phone,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": data.owner.location
            }
        };
        
        // Update WebSite structured data (JSON-LD)
        const websiteStructuredData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": data.owner.name + " - Portfolio",
            "url": data.url,
            "description": data.description,
            "author": {
                "@type": "Person",
                "name": data.owner.name
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": data.url + "/#clients"
                },
                "query-input": "required name=search_term_string"
            }
        };
        
        $('#structured-data-person').text(JSON.stringify(personStructuredData, null, 2));
        $('#structured-data-website').text(JSON.stringify(websiteStructuredData, null, 2));
    }

    // Initialize immediately when script loads
    // This ensures data is loaded before main.js initializes carousels
    $(function() {
        loadData();
    });

    // Make functions available globally for debugging
    window.siteDataLoader = {
        loadData: loadData,
        populatePage: populatePage,
        getData: function() { return siteData; }
    };

})(jQuery);

