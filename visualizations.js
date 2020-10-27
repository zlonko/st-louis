let dataset, svg
let incomeSizeScale, incomeXScale, categoryColorScale, categoryColorScale2
let simulation, nodes
let categoryLegend, categoryLegend2, incomeLegend
let stlouis

const categories = ['St. Louis City','St. Louis County']
const categories2 = ['< 30% People of Color','> 30% People of Color', '> 50% People of Color']
const categories3 = ['< 13% Black','> 13% Black','> 50% Black']

const categoriesXY = {'St. Louis City': [50, 500, 31913, 311273, 53.0, 46.3, 144255, 63.2, 0],
                    'St. Louis County': [500, 500, 30100, 998684, 31.2, 23.7, 237047, 79.4, 15]
                    }

const margin = {left: 200, top: 80, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom


// Read the data

Promise.all([
    d3.csv('https://raw.githubusercontent.com/tblainek/st-louis/master/data/dataset.csv', function(d){
        return {
            Tract: d.TRACT,
            County: d.COUNTY_NAME,
            Population: +d.ACS_N_TOTAL_POP,
            Income: +d.ACS_MED_INCOME,
            Black: +d.N_BLACK,
            PctBlack: +d.PCT_BLACK,
            NotWhite: +d.N_NOT_WHITE,
            PctNotWhite: +d.PCT_NOT_WHITE, 
            Poverty: +d.N_POVERTY_STAT,
            PctPoverty: +d.PCT_POVERTY_STAT,
            HistCol: +d.bucket_idx,
            Midpoint: +d.midpoint,
            MapCoordinates: d.coords
        };
    }),
    d3.csv('https://raw.githubusercontent.com/tblainek/st-louis/master/data/populationchange.csv', function(d){
        return {
            Year: +d.YEAR,
            PopCity: +d.ST_LOUIS_CITY,
            PopCounty: +d.ST_LOUIS_COUNTY
        };
    }),
]).then(data => {
    dataset = data[0]
    populationchange = data[1]
    console.log(dataset)
    console.log(populationchange)
    createScales()
    setTimeout(drawInitial(), 100)
})


const colors = ['#6d49d6', '#e85a4f']
const colors2 = ['#d6d6d2', '#b06fa5', '#802d72']
const colors3 = ['#d6d6d2', '#b06fa5', '#802d72']


//Create all the scales and save to global variables

function createScales(){

    incomeSizeScale = d3.scaleLinear(d3.extent(dataset, d => d.Income), [3,22])
    incomeXScale = d3.scaleLinear(d3.extent(dataset, d => d.Income), [margin.left, margin.left + width+250])
    incomeYScale = d3.scaleLinear([0, 85000], [margin.top + height, margin.top])

    categoryColorScale = d3.scaleOrdinal(categories, colors)
    categoryColorScale2 = d3.scaleOrdinal(categories2, colors2)
    categoryColorScale3 = d3.scaleOrdinal(categories3, colors3)

    popScale = d3.scaleLinear(d3.extent(dataset, d => d.Population), [margin.left + 120, margin.left + width - 50])
    popSizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.Population), [3,22])
    
    pctNWScale = d3.scaleLinear(d3.extent(dataset, d => d.PctNotWhite), [margin.left + 120, margin.left + width - 50])
    pctNWSizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.PctNotWhite), [3,22])

    pctBlackScale = d3.scaleLinear(d3.extent(dataset, d => d.PctBlack), [margin.left + 120, margin.left + width - 50])
    pctBlackXScale = d3.scaleLinear(d3.extent(dataset, d => d.PctBlack), [margin.left, margin.left + width])
    pctBlackSizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.PctBlack), [3,22])
    
    pctPovertyYScale = d3.scaleLinear([0, 1], [margin.top + height, margin.top])
    pctPovertyScale = d3.scaleLinear(d3.extent(dataset, d => d.PctPoverty), [margin.left + 120, margin.left + width - 50])
    pctPovertySizeScale = d3.scaleLinear(d3.extent(dataset, d=> d.PctPoverty), [3,22])
    
    histXScale = d3.scaleLinear(d3.extent(dataset, d => d.Midpoint), [margin.left, margin.left + width])
    histYScale = d3.scaleLinear(d3.extent(dataset, d => d.HistCol), [margin.top + height, margin.top])

    lineXScale = d3.scaleLinear(d3.extent(populationchange, p => p.Year), [margin.left, margin.left + width])
    lineYScale = d3.scaleLinear([0, 1000000], [margin.top + height, margin.top])
}


// Create legend keys appearing in article text

function createLegend(x, y){
    let svg = d3.select('#categorylegend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
                        .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
                        .shapePadding(10)
                        .scale(categoryColorScale)
    
    d3.select('.categoryLegend')
        .call(categoryLegend)
}

function createLegenda(x, y){
    let svg = d3.select('#categorylegenda')

    svg.append('g')
        .attr('class', 'categoryLegenda')
        .attr('transform', `translate(${x},${y})`)

    categoryLegenda = d3.legendColor()
                        .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
                        .shapePadding(10)
                        .scale(categoryColorScale)
    
    d3.select('.categoryLegenda')
        .call(categoryLegenda)
}

function createLegend2(x, y){
    let svg = d3.select('#categorylegend2')

    svg.append('g')
        .attr('class', 'categoryLegend2')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend2 = d3.legendColor()
                        .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
                        .shapePadding(10)
                        .scale(categoryColorScale2)
    
    d3.select('.categoryLegend2')
        .call(categoryLegend2)
}

function createLegend3(x, y){
    let svg = d3.select('#categorylegend3')

    svg.append('g')
        .attr('class', 'categoryLegend3')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend3 = d3.legendColor()
                        .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
                        .shapePadding(10)
                        .scale(categoryColorScale3)
    
    d3.select('.categoryLegend3')
        .call(categoryLegend3)
}

function createLegend4(x, y){
    let svg = d3.select('#categorylegend4')

    svg.append('g')
        .attr('class', 'categoryLegend4')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend4 = d3.legendColor()
                        .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
                        .shapePadding(10)
                        .scale(categoryColorScale3)
    
    d3.select('.categoryLegend4')
        .call(categoryLegend4)
}

function createLegend5(x, y){
    let svg = d3.select('#categorylegend5')

    svg.append('g')
        .attr('class', 'categoryLegend5')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend5 = d3.legendColor()
                        .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
                        .shapePadding(10)
                        .scale(categoryColorScale3)
    
    d3.select('.categoryLegend5')
        .call(categoryLegend5)
}



// Set up conditional colors

// Function to color bubbles by % people of color

function colorByPctNWFill(d, i){
    if (d.PctNotWhite > 0.50){
        return '#802d72'
    } else if (d.PctNotWhite > 0.33) {
        return '#b06fa5'
    } else {
        return '#ccccc8'
    }
}

// Function to color bubbles by % Black residents

function colorByPctBlackFill(d, i){
    if (d.PctBlack > 0.50){
        return '#802d72'
    } else if (d.PctBlack > 0.13) {
        return '#b06fa5'
    } else {
        return '#ccccc8'
    }
}


function drawInitial(){

    let svg = d3.select("#viz")
                    .append('svg')
                    .attr("viewBox", `0 0 1200 1000`)
                    // .attr('width', 1000)
                    // .attr('height', 950)
                    .attr('opacity', 1)

    simulation = d3.forceSimulation(dataset)

    // Define each tick of simulation

    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    simulation.stop()

    // Select all circles 

    nodes = svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
            .attr('fill', '#919191')
            .attr('r', 1)
            .attr('cx', (d, i) => 550)
            .attr('cy', (d, i) => 500)
            .attr('opacity', 1)
    
    // Mouseover and mouseout events for circles

    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    function mouseOver(d, i){

        console.log('hi')
        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')
            
        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Tract:</strong> ${d.Tract} 
                <br> <strong>Area:</strong> ${d.County}
                <br> <strong>Population:</strong> ${d3.format(",.2r")(d.Population)}
                <br> <strong>People of Color:</strong> ${Math.round(d.PctNotWhite*100)}%
                <br> <strong>Black:</strong> ${Math.round(d.PctBlack*100)}%
                <br> <strong>Median Income:</strong> $${d3.format(",.2r")(d.Income)}
                <br> <strong>Poverty Rate:</strong> ${Math.round(d.PctPoverty*100)}%`)
    }
    
    function mouseOut(d, i){
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 0)
    }
    
    // Initialize rectangles and type

    svg.selectAll('.cat-rect')
        .data(categories).enter()
        .append('rect')
            .attr('class', 'cat-rect')
            .attr('x', d => categoriesXY[d][0] + 1000)
            .attr('y', d => categoriesXY[d][1] + 0)
            .attr('width', 220)
            .attr('height', 30)
            .attr('opacity', 0)
            .attr('fill', '#a5a8c2')

    svg.selectAll('.lab-text')
        .data(categories).enter()
        .append('text')
        .attr('class', 'lab-text')
        .attr('opacity', 0)
        .raise()

    svg.selectAll('.lab-text')
        .text(d => `Average: $${d3.format(",.2r")(categoriesXY[d][2])}`)
        .attr('x', d => categoriesXY[d][0] + 200 + 1000)
        .attr('y', d => categoriesXY[d][1] - 500)
        .attr('font-family', 'Noto Serif')
        .attr('font-size', '18px')
        .attr('font-weight', 700)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')       

    svg.selectAll('.lab-text')
            .on('mouseover', function(d, i){
                d3.select(this)
                    .text(d)
            })
            .on('mouseout', function(d, i){
                d3.select(this)
                    .text(d => `Average: $${d3.format(",.2r")(categoriesXY[d][2])}`)
            })


    // Best fit line for scatter plot

    const bestFitLine = [{x: 0, y: 43238}, {x: 1, y: 17543}]
    const lineFunction = d3.line()
                            .x(d => pctBlackXScale(d.x))
                            .y(d => incomeYScale(d.y))


    // Axes for Scatter Plot

    svg.append('path')
        .transition('best-fit-line').duration(430)
            .attr('class', 'best-fit')
            .attr('d', lineFunction(bestFitLine))
            .attr('stroke', 'grey')
            .attr('stroke-dasharray', 6.2)
            .attr('opacity', 0)
            .attr('stroke-width', 3)

    let scatterxAxis = d3.axisBottom(pctBlackXScale).tickFormat(d3.format('.0%'))
    let scatteryAxis = d3.axisLeft(incomeYScale).tickSize([width]).tickFormat(d3.format('$,'))

    svg.append('g')
        .call(scatterxAxis)
        .attr('class', 'scatter-x')
        .attr('opacity', 0)
        .attr('transform', `translate(0, ${height + margin.top})`)
        .call(g => g.select('.domain')
            .remove())
        
    
    svg.append('g')
        .call(scatteryAxis)
        .attr('class', 'scatter-y')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left - 20 + width}, 0)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)


    let histXAxis = d3.axisBottom(histXScale).tickFormat(d3.format('$,'))
    svg.append('g')
        .attr('class', 'hist-axis')
        .attr('transform', `translate(0, ${height + margin.top + 10})`)
        .attr('opacity', 0)
        .call(histXAxis)


    // Axes for Clump
    let povertyXAxis = d3.axisBottom(pctPovertyScale)

    svg.append('g')
        .attr('class', 'poverty-axis')
        .attr('transform', 'translate(0, 700)')
        .attr('opacity', 0)
        .call(povertyXAxis)
    
   let povertyYAxis = d3.axisLeft(pctPovertyScale).tickSize([width]).tickFormat(d3.format('.0%'))

    svg.append('g')
        .call(povertyYAxis)
        .attr('class', 'poverty-y-axis')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left - 20 + width}, -100)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.3)
            .attr('stroke-dasharray', 2.5)


    // Add line chart components
    let populationXAxis = d3.axisBottom().scale(lineXScale).tickFormat(d3.format('.4'))
    let populationYAxis = d3.axisLeft().scale(lineYScale).tickSize([width])

    svg.append('g')
        .call(populationXAxis)
        .attr('class', 'population-x')
        .attr('transform', `translate(0, ${height + margin.top})`)
        .call(g => g.select('.domain')
            .remove())
    
    svg.append('g')
        .call(populationYAxis)
        .attr('class', 'population-y')
        .attr('transform', `translate(${margin.left - 20 + width}, 0)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)
    
    var lineCity = d3.line()
        .x(function(d) { return lineXScale(d.Year); })
        .y(function(d) { return lineYScale(d.PopCity); })

    var lineCounty = d3.line()
        .x(function(d) { return lineXScale(d.Year); })
        .y(function(d) { return lineYScale(d.PopCounty); })

    lineXScale.domain(d3.extent(populationchange, function(d) { return d.Year; }));
    lineYScale.domain([0, d3.max(populationchange, function(d) {
        return Math.max(d.PopCity, d.PopCounty); })])

    svg.append('path')
        .call(lineCity)
        .data([populationchange])
        .attr('class', 'line1')
        .attr('stroke', '#6d49d6')
        .attr('d', lineCity)

    svg.append('path')
        .call(lineCounty)
        .data([populationchange])
        .attr('class', 'line2')
        .style('stroke', '#e85a4f')
        .attr('d', lineCounty)
        .attr('stroke-opacity',1)

    svg.append('text')
        .attr('font-family', 'Noto Serif')
        .attr('font-size', '18px')
        .attr('font-weight', 700)
        .attr('x',840)
        .attr('y',530)
        .style('fill', '#6d49d6')
        .text('St. Louis City')
        .attr('class','linelabel1')
  
    svg.append('text')
        .attr('font-family', 'Noto Serif')
        .attr('font-size', '18px')
        .attr('font-weight', 700)
        .attr('x',740)
        .attr('y',175)
        .style('fill', '#e85a4f')
        .text('St. Louis County')
        .attr('class','linelabel2')

}


// Set opacity to 0 for each section's elements when scrolling out
// Later, when a new section is reached, opacity of that section's elements is set to 1

function clean(chartType){
    let svg = d3.select('#viz').select('svg')
    if (chartType !== "isFirst"){
        svg.select('.linelabel1').transition().attr('opacity', 0)
        svg.select('.linelabel2').transition().attr('opacity', 0)
        svg.select('.line1').transition().attr('opacity', 0)
        svg.select('.line2').transition().attr('opacity', 0)
        svg.select('.population-x').transition().attr('opacity', 0)
        svg.select('.population-y').transition().attr('opacity', 0)
    }
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.best-fit').transition().duration(200).attr('opacity', 0)
    }
    if (chartType !== "isMultiples"){
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isHist"){
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble"){
        svg.select('.population-axis').transition().attr('opacity', 0)
        svg.select('.poverty-axis').transition().attr('opacity', 0)
        svg.select('.poverty-y-axis').transition().attr('opacity', 0)
    }
}


// Draw the initial line chart and start up circles

function drawPopulationTrend(){

    simulation.stop()
    
    let svg = d3.select("#viz")
                    .select('svg')
                    .attr("viewBox", `0 0 1200 1000`)
                    // .attr('width', 1000)
                    // .attr('height', 950)
    
    clean('isFirst')
    
    svg.selectAll('circle')
        .transition().duration(500).delay(100)
        .attr('fill', '#eae7dc')
        .attr('r', 1)
        .attr('cx', 1)
        .attr('cy', 1)

    svg.select('.population-x')
        .transition()
        .attr('opacity', 1)

    svg.select('.population-y')
        .transition()
        .attr('opacity', 1)

    svg.select('.line1')
        .transition()
        .attr('opacity', 1)

    svg.select('.line2')
        .transition()
        .attr('opacity', 1)
    
    svg.select('.linelabel1')
        .transition()
        .attr('opacity', 1)

    svg.select('.linelabel2')
        .transition()
        .attr('opacity', 1)

}


// Compare Total Populations of City and County

function drawTotalPopulation(){
    
    let svg = d3.select("#viz").select('svg').attr("viewBox", `0 0 1200 1000`)
    
    clean('isMultiples')

    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => categoriesXY[d][0] + 90)
        .attr('y', d => categoriesXY[d][1] + 230)
        

    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        // .text(d => `A: $${d3.format(",.2r")(categoriesXY[d][2])}`)
        .text(d => `Population: ${d3.format(",")(categoriesXY[d][3])}`)
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 250)
        .attr('opacity', 1)

    svg.selectAll('.lab-text')
        .on('mouseover', function(d, i){
            d3.select(this)
                .text(d)
        })
        .on('mouseout', function(d, i){
            d3.select(this)
                .text(d => `Population: ${d3.format(",")(categoriesXY[d][3])}`)
        })
    
    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r', d => popSizeScale(d.Population))
        .attr('fill', d => categoryColorScale(d.County))

    simulation  
        .force('charge', d3.forceManyBody().strength([3]))
        .force('forceX', d3.forceX(d => categoriesXY[d.County][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.County][1] - 50))
        .force('collide', d3.forceCollide(d => popSizeScale(d.Population) + 3))
        .alphaDecay([0.02])

    simulation.alpha(0.9).restart()
    
    createLegend(20, 50)
}


// Income vs. County Histogram

function drawHistogram(){
    let svg = d3.select('#viz').select('svg').attr("viewBox", `0 0 1200 1000`)

    clean('isHist')

    simulation.stop()

    svg.selectAll('circle')
        .transition().duration(600).delay((d, i) => i * 2).ease(d3.easeBack)
            .attr('r', 5)
            .attr('cx', d => histXScale(d.Midpoint) + categoriesXY[d.County][8])
            .attr('cy', d => histYScale(d.HistCol))
            .attr('fill', d => categoryColorScale(d.County))

    svg.selectAll('.hist-axis')
        .transition()
        .attr('opacity', 0.7)
        .selectAll('.domain')
        .attr('opacity', 1)

    svg.selectAll('.lab-text')
        .on('mouseout', )

    createLegenda(20,50)
}


// Compare Non-White Populations in City and County

function drawNWPopulation(){
    let svg = d3.select("#viz").select('svg').attr("viewBox", `0 0 1200 1000`)

    clean('isMultiples')

    simulation.alpha(0.9).restart()

    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `People of Color: ${d3.format(",.2r")(categoriesXY[d][4])}%`)
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 250)
        .attr('opacity', 1)

    svg.selectAll('.lab-text')
        .on('mouseover', function(d, i){
            d3.select(this)
                .text(d)
        })
        .on('mouseout', function(d, i){
            d3.select(this)
                .text(d => `People of Color: ${d3.format(",.2r")(categoriesXY[d][4])}%`)
        })

    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
    .attr('opacity', 0.2)
    .attr('x', d => categoriesXY[d][0] + 90)
    .attr('y', d => categoriesXY[d][1] + 230)

    simulation  
        .force('charge', d3.forceManyBody().strength([3]))
        .force('forceX', d3.forceX(d => categoriesXY[d.County][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.County][1] - 50))
        .force('collide', d3.forceCollide(d => popSizeScale(d.Population) + 3))
        .alphaDecay([0.02])

    svg.selectAll('circle')
    .transition().duration(400).delay((d, i) => i * 4)
    .attr('r', d => popSizeScale(d.Population))
    .attr('fill', colorByPctNWFill)

    createLegend2(20,50)
}


// Compare Black Populations in City and County

function drawBlackPopulation(){
    let svg = d3.select("#viz").select('svg').attr("viewBox", `0 0 1200 1000`)

    clean('isMultiples')
    simulation.stop()
    simulation.alpha(0.9).restart()
    
    svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
        .text(d => `Black Residents: ${d3.format(",.2r")(categoriesXY[d][5])}%`)
        .attr('x', d => categoriesXY[d][0] + 200)   
        .attr('y', d => categoriesXY[d][1] + 250)
        .attr('opacity', 1)

    svg.selectAll('.lab-text')
        .on('mouseover', function(d, i){
            d3.select(this)
                .text(d)
        })
        .on('mouseout', function(d, i){
            d3.select(this)
                .text(d => `Black Residents: ${d3.format(",.2r")(categoriesXY[d][5])}%`)
        })

    svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
        .attr('opacity', 0.2)
        .attr('x', d => categoriesXY[d][0] + 90)
        .attr('y', d => categoriesXY[d][1] + 230)

    simulation  
        .force('charge', d3.forceManyBody().strength([3]))
        .force('forceX', d3.forceX(d => categoriesXY[d.County][0] + 200))
        .force('forceY', d3.forceY(d => categoriesXY[d.County][1] - 50))
        .force('collide', d3.forceCollide(d => popSizeScale(d.Population) + 3))
        .alphaDecay([0.02])

    svg.selectAll('circle')
        .transition().duration(400).delay((d, i) => i * 4)
        .attr('r', d => popSizeScale(d.Population))
        .attr('fill', colorByPctBlackFill)

    createLegend3(20,50)
}


// Scatter plot and line of best fit

function drawScatter(){
    simulation.stop()
    
    let svg = d3.select("#viz").select("svg").attr("viewBox", `0 0 1200 1000`)
    clean('isScatter')

    svg.selectAll('.scatter-x')
        .transition()
        .attr('opacity', 0.7)
        .selectAll('.domain')
        .attr('opacity', 1)

    svg.selectAll('.scatter-y')
        .transition()
        .attr('opacity', 0.7)
        .selectAll('.domain')
        .attr('opacity', 1)

    svg.selectAll('circle')
        .transition().duration(800).ease(d3.easeBack)
        .attr('cx', d => pctBlackXScale(d.PctBlack))
        .attr('cy', d => incomeYScale(d.Income))
    
    svg.selectAll('circle').transition(1600)
        .attr('fill', colorByPctBlackFill)
        .attr('r', 4)

    svg.select('.best-fit').transition().duration(300)
        .attr('opacity', 0.5)
   
    createLegend4(20,50)
}


// Clump chart depicting % poverty level

function drawPoverty(){

    let svg = d3.select('#viz').select('svg').attr("viewBox", `0 0 1200 1000`)

    clean('isBubble')

    simulation
        .force('forceX', d3.forceY(d => pctPovertyScale(d.PctPoverty)-50))
        .force('forceY', d3.forceX(550))
        .force('collide', d3.forceCollide(d => popSizeScale(d.Population)+1))
        .alpha(0.8).alphaDecay(0.05).restart()

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 4)
        .attr('r', d => popScale(d.Population)*0.02)
        .attr('fill', colorByPctBlackFill)


    // Show % poverty axis (remember to include domain)
    svg.select('.poverty-y-axis').attr('opacity', 0.5).selectAll('.domain').attr('opacity', 1)

    createLegend5(20,50)
}

// Clump chart depicting % poverty level, but colored by City or County

function drawPoverty2(){

    let svg = d3.select('#viz').select('svg').attr("viewBox", `0 0 1200 1000`)

    clean('isBubble')

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 4)
        .attr('r', d => popScale(d.Population)*0.02)
        .attr('fill', d => categoryColorScale(d.County))

    // Show % poverty axis
    svg.select('.poverty-y-axis').attr('opacity', 0.5).selectAll('.domain').attr('opacity', 1)

}


// All tracts together

// function drawConclusion(){
//     clean('none')

//     let svg = d3.select('#viz').select('svg')
//     svg.selectAll('circle')
//         .transition()
//         .attr('r', d => popSizeScale(d.Population)*1.5)
//         .attr('fill', d => categoryColorScale(d.County))

//     simulation 
//         .force('forceX', d3.forceX(550))
//         .force('forceY', d3.forceY(550))
//         .force('collide', d3.forceCollide(d => popSizeScale(d.Population) * 1.8))
//         .force('charge', d3.forceManyBody().strength([3]))
//         .alpha(0.6).alphaDecay(0.05).restart()
        
// }


// All charts to be called on scroll

let activationFunctions = [
    drawPopulationTrend,
    drawTotalPopulation,
    drawHistogram,
    drawNWPopulation,
    drawBlackPopulation,
    drawScatter,
    drawPoverty,
    drawPoverty2
]


// Scrolling function creates new chart using index

let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})