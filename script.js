(function () {
    function makeVisible(element, index) {
        element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
        element.classList.add('is-visible');
    }

    document.addEventListener('DOMContentLoaded', function () {
        const animated = document.querySelectorAll('.reveal-on-scroll, .article-card, .news-item');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.dataset.revealIndex || 0);
                        makeVisible(entry.target, index);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

            animated.forEach((element, index) => {
                element.classList.add('reveal-on-scroll');
                element.dataset.revealIndex = index;
                observer.observe(element);
            });
        } else {
            animated.forEach((element, index) => makeVisible(element, index));
        }

        const nav = document.querySelector('.nav');
        let lastScroll = window.scrollY;

        function updateNav() {
            if (!nav) return;
            const currentScroll = window.scrollY;
            nav.classList.toggle('is-scrolled', currentScroll > 12);

            if (currentScroll > lastScroll && currentScroll > 160) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            lastScroll = Math.max(currentScroll, 0);
        }

        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function (event) {
                const target = document.querySelector(this.getAttribute('href'));
                if (!target) return;
                event.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - 82;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            });
        });
    });
})();

function shareContent(title, url) {
    const fullUrl = new URL(url, window.location.href).href;
    const shareText = `${title}\n\n${fullUrl}`;

    if (navigator.share) {
        navigator.share({ title, text: title, url: fullUrl }).catch(() => copyToClipboard(shareText));
        return;
    }

    copyToClipboard(shareText);
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast('链接已复制到剪贴板')).catch(() => fallbackCopy(text));
        return;
    }

    fallbackCopy(text);
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('链接已复制到剪贴板');
}

function showToast(message) {
    const oldToast = document.querySelector('.share-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(() => {
        toast.classList.remove('is-visible');
        window.setTimeout(() => toast.remove(), 260);
    }, 1800);
}
