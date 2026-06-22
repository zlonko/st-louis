function scroller(){
    let container = d3.select('body')
    let dispatch = d3.dispatch('active', 'progress', 'inactive');
    let sections = d3.selectAll('.step')
    let sectionPositions
   
    let currentIndex = -1
    let scrollOffset = 0;

    function scroll(){
        d3.select(window)
            .on('scroll.scroller', position)
            .on('resize.scroller', resize)

        resize();

        let timer = d3.timer(function() {
            position();
            timer.stop();
        });
    }

    function updateScrollOffset() {
        const hero = document.querySelector('.hero');
        scrollOffset = hero ? hero.offsetTop + hero.offsetHeight : 0;
    }

    function resize(){
        updateScrollOffset();
        sectionPositions = [];
        let startPos;
    
        sections.each(function(d, i) {
            let top = this.getBoundingClientRect().top;
        
            if (i === 0 ){
                startPos = top;
            }
            sectionPositions.push(top - startPos)
        });
    }

    function position() {
        updateScrollOffset();

        const pastHero = window.pageYOffset >= scrollOffset - 50;
        document.body.classList.toggle('scrollytelling-active', pastHero);

        if (!pastHero) {
            if (currentIndex !== -1) {
                dispatch.call('inactive', this);
                currentIndex = -1;
            }
            return;
        }

        let pos = window.pageYOffset - 300 - scrollOffset;
        let sectionIndex = d3.bisect(sectionPositions, pos);
        sectionIndex = Math.min(sections.size()-1, sectionIndex);
    
        if (currentIndex !== sectionIndex){
            dispatch.call('active', this, sectionIndex);
            currentIndex = sectionIndex;
        }
    
        let prevIndex = Math.max(sectionIndex - 1, 0);
        let prevTop = sectionPositions[prevIndex]
        let progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
        dispatch.call('progress', this, currentIndex, progress)
    }

    scroll.container = function(value) {
        if (arguments.legth === 0){
            return container
        } 
        container = value 
        return scroll 
    }

    scroll.on = function(action, callback){
        dispatch.on(action, callback)
    };

    return scroll;
}

