import { onSelectorChange, getSelectorValue } from "../../../components/header/selector/selector.js";
import { Switch } from "../../../components/header/switch/switch.js";
import { getMostPlayedData } from "../../../logic/utils.js";
import { formatSongs } from "../../../logic/utils.js";
import { DonutChart } from "../../../components/donutChart/donutChart.js";

export function renderMostPlayedPage(parent){
    const parentId = "#" + parent.id;
    const dataset = getMostPlayedData();

    const dataDetailsContainer = document.createElement("div");
    const diagramContainer = document.createElement("div");
    dataDetailsContainer.id = "data-details-container";
    diagramContainer.className = "diagram-container";
    parent.appendChild(dataDetailsContainer);
    parent.appendChild(diagramContainer);

    const switchInstance = Switch.getSwitchByPageId(parent.id);
    const spiral = new Spiral(`${parentId} .${diagramContainer.className}`, dataset[switchInstance.currentSwitchState][getSelectorValue()]);
    renderDataDetails(dataDetailsContainer, dataset[switchInstance.currentSwitchState][getSelectorValue()]);

    switchInstance.event(() => {
        spiral.changeData(dataset[switchInstance.currentSwitchState][getSelectorValue()]);
        renderDataDetails(dataDetailsContainer, dataset[switchInstance.currentSwitchState][getSelectorValue()]);
    });

    onSelectorChange((event) => {
        spiral.changeData(dataset[switchInstance.currentSwitchState][event.target.value]);
        renderDataDetails(dataDetailsContainer, dataset[switchInstance.currentSwitchState][event.target.value]);
    }); 
}

function renderDataDetails(parent, dataset){
    parent.innerHTML = ``;

    for(const item of dataset){
        const itemContainer = document.createElement("div");
        parent.appendChild(itemContainer);
        itemContainer.id = `item-${item.ranking}`;
        itemContainer.className = "item-details";

        const newDataset = [
            {label: "filled", value: item.popularity},
            {label: "empty", value: 100 - item.popularity} 
        ]


        itemContainer.innerHTML += `<div class="item-name-ranking">
                                        <div class="item-ranking">${item.ranking}</div>
                                        <div class="item-name">${formatSongs(item.name)}</div>
                                    </div>
                                    <div class="item-popularity">
                                        <div class="donut-chart"></div>
                                        <div class="popularity-title">Spotify Popularity</div> 
                                    </div>`;
        
        new DonutChart(
            itemContainer.querySelector(".donut-chart"), 
            newDataset, ["var(--main-green-color)", "gray"], 
            100, 
            100
        );
    }
}

class Spiral{
    constructor(parentSelector, dataset){
        this.parent = d3.select(parentSelector);
        this.dataset = dataset.slice(0, 25).reverse();
        this.min = 25;

        this.wSvg = 1200;
        this.hSvg = 900;
        this.cy = this.hSvg / 1.8;
        this.cx = this.wSvg / 1.8;
        this.b = 30;
        this.transitionDelay = 50;
        this.transitionDuration = 400;
        this.hoverSize = 80;
        this.init();
    }

    init(){
        this.svg = this.parent.append("svg")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .attr("width", "100%")
            .attr("height", "auto")
            .classed("spiral-chart", true)

        if(this.dataset.length < this.min) this.datasetTooShort();
        this.prepScales();
        this.prepDataset();
        this.renderClipPaths();
        this.render();
        this.bindListeners();
    }

    prepScales(){
        const endRadius = 25;
        const startRadius = 70;
        
        const ranking = this.dataset.map(item => item.ranking);
        const minRanking = d3.min(ranking);
        const maxRanking = d3.max(ranking);

        this.rScale = d3.scaleLinear()
            .domain([minRanking, maxRanking]) //1 - 50
            .range([startRadius, endRadius])  //65 - 25
    }

    datasetTooShort(){
        for(let i = this.dataset.length; i < this.min; i++){
            this.dataset.unshift({
                image: "../../../media/icons/not-found.svg",
                name: "not-found",
                popularity: 0,
                ranking: i + 1,
            });
        }
    }

    prepDataset(){
        this.dataset = this.dataset.map((item, i) => {
            const {image, name, popularity, ranking} = item;
            
            const θ = - (i * 0.36 + 5);
            const r = this.b * θ;

            return {
                image,
                name,
                popularity,
                ranking,
                x: this.cx + r * Math.cos(θ + 1.2),
                y: this.cy + r * Math.sin(θ + 1.2),
                r: this.rScale(ranking)
            }
        });
    }

    renderClipPaths(){
        const defs = this.svg.append("defs");
 
        this.dataset.forEach((d, i) => {
            defs.append("clipPath")
                .attr("id", `clip-${i}`)
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", d.r);
        });
    }

    render(){
        const imageGroups = this.svg.selectAll(".image-group")
            .data(this.dataset)
            .enter()
            .append("g")
                .attr("class", "image-group")
                .attr("transform", d => `translate(${d.x}, ${d.y})`);

        imageGroups.append("image")
            .attr("href", d => d.image)
            .attr("x", d => -d.r)
            .attr("y", d => -d.r)
            .attr("width", d => d.r * 2)
            .attr("height", d => d.r * 2)
            .attr("clip-path", (d, i) => `url(#clip-${i})`)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .attr("id", (d, i) => "image-" + d.ranking)
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * this.transitionDelay) 
            .duration(this.transitionDuration)
            .style("opacity", 1);

        
        imageGroups.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => d.r)
            .attr("stroke", "var(--dark-grey)")
            .attr("stroke-width", "3")
            .attr("fill", "none")
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * this.transitionDelay) 
            .duration(this.transitionDuration)
            .style("opacity", 1);
    }

    bindListeners() {
        this.svg.selectAll(".image-group").on("mouseenter", function (event, d) {
            d3.selectAll(".image-group")
                .transition().duration(200).ease(d3.easeExpOut)
                .attr("transform", d => `translate(${d.x}, ${d.y}) scale(1)`);
                

            d3.select(this)
                .transition().duration(200).ease(d3.easeExpOut)
                .attr("transform", (d, i) => {
                    return`translate(${d.x}, ${d.y}) scale(${1.25 + (d.ranking)/30})` 
                })
                

            d3.select(`#item-${d.ranking}`).classed("show", true);
                
            d3.selectAll("image").classed("gray", true);
            d3.select(this).select("image").classed("gray", false).classed("current", true);
            
            d3.select(this).select("circle")
                .transition()
                /* .duration(200).ease(d3.easeExpOut) */
                .attr("stroke-width", 0);
        });

        this.svg.selectAll(".image-group").on("mouseleave", function (event, d) {
            d3.selectAll(".image-group")
                .transition().duration(200)
                .attr("transform", d => `translate(${d.x}, ${d.y}) scale(1)`)

            d3.selectAll("image").classed("gray", false).classed("current", false);
            d3.select(`#item-${d.ranking}`).classed("show", false);

            d3.select(this)
                .select("circle")
                    .transition()
                    .attr("stroke-width", 3);
        });
    }

    changeData(dataset){
        this.dataset = dataset.slice(0, 25).reverse();
        if(this.dataset.length < this.min) this.datasetTooShort();
        this.prepDataset();

        const imageGroups = this.svg.selectAll(".image-group")
            .data(this.dataset)     
            
        imageGroups.select("image")
            .attr("href", d => d.image)
            .attr("x", d => -d.r)
            .attr("y", d => -d.r)
            .attr("width", d => d.r * 2)
            .attr("height", d => d.r * 2)
            .attr("clip-path", (d, i) => `url(#clip-${i})`)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .attr("id", (d, i) => "image-" + i)
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * this.transitionDelay) // 1 second between each
            .duration(this.transitionDuration)
            .style("opacity", 1);

        imageGroups.select("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => d.r)
            .attr("stroke", "var(--dark-grey)")
            .attr("stroke-width", "3")
            .attr("fill", "none")
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * this.transitionDelay) 
            .duration(this.transitionDuration)
            .style("opacity", 1);
    }
}