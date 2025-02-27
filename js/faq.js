
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                question.parentElement.classList.toggle('active');
                console.log('Clicked FAQ item');
            });
        });
    });
