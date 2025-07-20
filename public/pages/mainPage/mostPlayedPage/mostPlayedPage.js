import { getMostPlayedData } from "../../../logic/utils.js";

export function renderMostPlayedPage(parent){
    const parentId = "#" + parent.id;
    const dataset = getMostPlayedData();

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);
    
}

class ScatterPlot{
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
}