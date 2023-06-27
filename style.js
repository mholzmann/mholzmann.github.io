function resetSlideScrolling(slide) {
    slide.classList.remove('scrollable-slide');
}

function handleSlideScrolling(slide) {
    if (slide.scrollHeight > 715) {
        slide.classList.add('scrollable-slide');
    }
}

Reveal.addEventListener('ready', function (event) {
    handleSlideScrolling(event.currentSlide);
});

Reveal.addEventListener('slidechanged', function (event) {
    if (event.previousSlide) {
        resetSlideScrolling(event.previousSlide);
    }
    handleSlideScrolling(event.currentSlide);
});

function scroll(offset) {
    const slide = document.querySelector('.scrollable-slide');
    slide.scroll({ top: slide.scrollTop + offset, behavior: "smooth" });
}

function changeFontSize(offset) {
    console.log('hello');
    const r = document.querySelector(':root');
    let fontSize = parseInt(getComputedStyle(r).getPropertyValue('--r-main-font-size'));
    fontSize += offset;
    r.style.setProperty('--r-main-font-size', fontSize+'px');
    if (Reveal.isFirstSlide()) {
        Reveal.right();    
        Reveal.left();
    } else {
        Reveal.left();    
        Reveal.right(); 
    }
}