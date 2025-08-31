import { Selector } from "../../../components/header/selector/selector.js";
import { getGenreData } from "../../../logic/utils.js";

export function renderGenresPage(parent){
    const dataset = getGenreData(); 

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);

    const bubbleChart = new BubbleChart(diagramContainer, dataset["short_term"]);

    const selectorInstance = Selector.getSelectorByPageId(parent.id);
    selectorInstance.event((event) => {
        bubbleChart.changeData(dataset[event.target.value]);
    }); 
}

class BubbleChart{
    constructor(parent, dataset){
        this.parent = d3.select(parent);
        this.dataset = dataset;

        this.hSvg = 600;
        this.wSvg = 1200;
        this.padding = 5;

        this.maxSize = 60;
        this.minSize = 10;
        this.hoverSize = this.maxSize * 1.25;
        
        this.transitionDelay = 50;
        this.transitionDuration = 800;

        this.colors = [
            "#E3CCFF",
            "#D2AFFF",
            "#AD74F6",
            "#9745FF"
        ];

        this.init();
    }

    init(){
        this.svg = this.parent.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .classed("bubble-chart", true)  

        this.prepScales();
        this.render();
        this.bindListeners();
    }

    prepScales(){
        const customInterpolator = (t) => {
            return d3.interpolateRgb("rgba(196, 155, 250, 1)", "rgba(142, 56, 255, 1)")(t);
        }

        this.color = d3.scaleSequential()
            .domain([
                d3.min(this.dataset, d => d.value),
                d3.max(this.dataset, d => d.value)])
            .interpolator(customInterpolator);

        const r = d3.scaleSqrt()
            .domain([0, d3.max(this.dataset, d => d.value)])
            .range([this.minSize, this.maxSize]);

        const nodes = this.dataset.map(d => ({
            ...d,
            r: r(d.value)
        }));

        const sim = d3.forceSimulation(nodes)
            .force("x", d3.forceX(this.wSvg/2).strength(0.02))
            .force("y", d3.forceY(this.hSvg/2).strength(0.15))
            .force("collide", d3.forceCollide(d => d.r + 2))
            .stop();

        for (let i=0; i < this.dataset.length * 10; i++) sim.tick();

        this.root = {
            descendants: () => nodes.map(n => ({
            data: n,  
            x: n.x,
            y: n.y,
            r: n.r
            }))
        };
    }

    render(){
        const bubbles = this.svg.append("g")
            .classed("bubble-container", true)
            .attr("transform", `translate(${this.wSvg/8}, ${-this.hSvg/20})`)
            .selectAll("g")
                .data(this.root.descendants)
                .enter()
                .append("g")
                    .classed("bubble", true)
                    .attr("transform", d => `translate(${d.x + this.padding}, ${d.y + this.padding})`)

        bubbles.append("circle")
            .attr("r", d => d.r)
            .attr("stroke", "black")
            .attr("stroke-width",  1)
            .attr("fill", d => this.color(d.data.value))
            .attr("id", d => d.data.genre)

        const genreLabel = bubbles.append("text")
            .text((d) => this.formatGenreStr(d.data.genre))
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .attr("fill", "black")
            .style('font-size', d => Math.min(2 * d.r / d.data.genre.length, d.r / 2) + "px");  
    }

    bindListeners(){
        const hoverSize = this.hoverSize;
        const colorScale = this.color;

        this.svg.selectAll(".bubble").on("mouseenter", function(event, d){
            const circle = d3.select(this).raise().select("circle")

           /*  d3.select("body").classed("change", true); */
         
            circle.interrupt();
            d3.select(this).select("text").interrupt();

            circle.transition().duration(200).ease(d3.easeBackOut)
                .attr("r", hoverSize)

            circle.attr("fill", d => colorScale(d.data.value))
            circle.style("filter", "contrast(200%)") /*  "hue-rotate(-125deg)"*/

            d3.select(this).select("text")
                .attr("fill", "black")
                .transition().duration(200).ease(d3.easeBackOut)
                .style('font-size', d => Math.min(3 * hoverSize / d.data.genre.length, hoverSize / 3) + "px");
        });

        this.svg.selectAll(".bubble").on("mouseleave", function (event, d) {
            /* d3.select("body").classed("change", false); */

            d3.select(this).select("circle")
                .transition().duration(200)
                .attr("r", d => d.r) 
                .transition().duration(600)
                .style("filter", "contrast(100%) brightness(100%)")
                .attr("fill", d => colorScale(d.data.value))


            d3.select(this).select("text")
                .transition().duration(200)
                .style('font-size', d => Math.min(2 * d.r / d.data.genre.length, d.r / 2) + "px")  
                .transition().duration(600)
                .attr("fill", "black")
        });
    }

    changeData(dataset){
        this.dataset = dataset;
        this.prepScales();

        const nodes = this.svg.select(".bubble-container").selectAll(".bubble")
            .data(this.root.descendants, d => d.data.genre)

        const bubbles = nodes.enter().append("g")
            .attr('class', 'bubble')
            .attr('transform', d => `translate(${d.x + this.padding}, ${d.y + this.padding})`);

        bubbles.append("circle")
            .attr("r", 0)
            .transition()
            .ease(d3.easeElasticOut )
            .duration(this.transitionDuration)
            .delay((d, i) => i * this.transitionDelay) 
            .attr("r", d => d.r)
            .attr("stroke", "black")
            .attr("stroke-width",  1)
            .attr("fill", d => this.color(d.data.value))

        const genreLabel = bubbles.append("text")
            .text((d) => this.formatGenreStr(d.data.genre))
            .attr("text-anchor", "middle")
            .attr("font-size", 0)
            .attr("dy", "0.3em")
            .attr("fill", "black")
            .transition()
            .delay((d, i) => i * this.transitionDelay)
            .ease(d3.easeElasticOut)
            .duration(this.transitionDuration)
            .style('font-size', d => Math.min(2 * d.r / d.data.genre.length, d.r / 2) + "px"); 

        const bubbleUpdate = nodes
            .transition().duration(750)
            .attr('transform', d => `translate(${d.x + this.padding}, ${d.y + this.padding})`);

        bubbleUpdate.select('circle')
            .attr('r', d => d.r)
            .attr("fill", d => this.color(d.data.value))

        bubbleUpdate.select('text')
            .text(d => this.formatGenreStr(d.data.genre))
            .style('font-size', d => Math.min(2 * d.r / d.data.genre.length, d.r / 2) + "px");

        nodes.exit().remove();
        this.bindListeners();
    }

    formatGenreStr(str){
        const firstChar = str[0];
        const remainingLetters = str.substring(1)
        const firstCharCap = firstChar.toUpperCase();

        return firstCharCap + remainingLetters;
    }
}
