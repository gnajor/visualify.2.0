import { getMostPlayedData } from "../../../logic/utils.js";

export function renderMostPlayedPage(parent){
    const parentId = "#" + parent.id;
    const dataset = getMostPlayedData();

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);

    const spiral = new Spiral(`${parentId} .${diagramContainer.className}`, dataset.artists.long_term);
}


class Spiral{
    constructor(parentSelector, dataset){
        this.parent = d3.select(parentSelector);
        this.dataset = dataset.slice(0, 25).reverse();

        this.wSvg = 1200;
        this.hSvg = 800;
        this.cy = this.hSvg / 2.5;
        this.cx = this.wSvg / 1.8;
        this.b = 45;
        this.init();

    }

    init(){
        this.svg = this.parent.append("svg")
            .attr("transform", "")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .attr("width", "100%")
            .attr("height", "auto")
            .classed("spiral-chart", true)

        this.prepScales();
        this.prepDataset();
        this.render();
    }

    prepScales(){
        const endRadius = 30;
        const startRadius = 80;
        
        const ranking = this.dataset.map(item => item.ranking);
        const minRanking = d3.min(ranking);
        const maxRanking = d3.max(ranking);

        this.rScale = d3.scaleLinear()
            .domain([minRanking, maxRanking]) //1 - 50
            .range([startRadius, endRadius])  //65 - 25
    }

    prepDataset(){
        this.dataset = this.dataset.map((item, i) => {
            const {image, name, popularity, ranking} = item;
            
            const θ = i * 0.3 + 2.5;
            const r = this.b * θ;  

            return {
                image,
                name,
                popularity,
                ranking,
                x: this.cx + r * Math.cos(θ),
                y: this.cy + r * Math.sin(θ),
                r: this.rScale(ranking)
            }
        })
    }

    render(){
        const defs = this.svg.append("defs");
        const imageContainer = this.svg.append("g").classed("image-container", true);

        this.dataset.forEach((d, i) => {
            defs.append("clipPath")
                .attr("id", `clip-${i}`)
                .append("circle")
                    .attr("cx", d.x)
                    .attr("cy", d.y)
                    .attr("r", d.r)
        });

        this.svg.selectAll("image")
            .data(this.dataset)
            .enter()
            .append("image")
                .attr("href", d => d.image)
                .attr("x", d => d.x - d.r)
                .attr("y", d => d.y - d.r)
                .attr("width", d => d.r * 2)
                .attr("height", d => d.r * 2)
                .attr("clip-path", (d, i) => `url(#clip-${i})`)
                .attr("preserveAspectRatio", "xMidYMid slice")
                .attr("id", (d, i) => "image-" + i);


        imageContainer.selectAll("circle")
            .data(this.dataset)
            .enter()
            .append("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => d.r)
                .attr("stroke", "var(--dark-grey)")
                .attr("stroke-width", "4")
                .attr("fill", "none")
                .attr("id", (d, i) => "image-" + i);
        }
}

/* const svg = d3.select(parentId).select(".diagram-container").append("svg")
    .style("transform", "rotate(90deg)")
    .attr("viewBox", "0 0 800 1000")
    .attr("width", "100%")
    .attr("height", "auto")

const cx = 350;
const cy = 500;
const b = 30;

const circles = Array.from({ length: 30 }, (_, i) => {
  const θ = i * 0.3;
  const r = b * θ;
  return {
    x: cx + r * Math.cos(θ),
    y: cy + r * Math.sin(θ),
    r: 20
  };
});

svg.selectAll("circle")
    .data(circles)
    .enter()
    .append("circle")
    .attr("stroke", "gray")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", (d, i) => d.r + i * 2)  //5 * 1 /3.5
    .attr("fill", "purple");
} */




/* class ScatterPlot{
    constructor(parentSelector, dataset){
        this.parent = d3.select(parentSelector);
        this.dataset = dataset;

        this.margin = {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
        }

        this.wSvg = 900;
        this.hSvg = 500;
        this.wViz = this.wSvg - this.margin.left - this.margin.right;
        this.hViz = this.hSvg - this.margin.bottom - this.margin.top;

        this.radius = 5;

        this.init();
    }

    init(){
        this.svg = this.parent.append("svg")
            .attr("width", this.wSvg)
            .attr("height", this.hSvg)
            .classed("scatter-plot", true)

        this.graphGroup = this.svg.append("g");
        this.axisGroup = this.svg.append("g");
    }

    prepScales(){
        const maxAmount = this.dataset.length;

        this.xScale = d3.scaleLinear()
            .domain([0, maxAmount])
            .range([this.margin.left, this.wViz + this.margin.right]);

        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.margin.top + this.hViz, this.margin.bottom]);
    }
} */



/* 
const svg = d3.select(parentId).select(".diagram-container").append("svg")
    .style("transform", "rotate(90deg)")
    .attr("viewBox", "0 0 800 1000")
    .attr("width", "100%")
    .attr("height", "auto")

const cx = 350;
const cy = 500;
const b = 30;

const circles = Array.from({ length: 50 }, (_, i) => {
  const θ = i * 0.3;
  const r = b * θ;
  return {
    x: cx + r * Math.cos(θ),
    y: cy + r * Math.sin(θ),
    r: 4
  };
});

svg.selectAll("circle")
    .data(circles)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", (d, i) => d.r * i / 3.5)  //5 * 1 /3.5
    .attr("fill", "purple");
}

*/