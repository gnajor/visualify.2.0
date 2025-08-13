import { getGenreData } from "../../../logic/utils.js";

function renderGenresPage(parent){
    const parentId = "#" + parent.id;
    const dataset = getGenreData(); 

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);
}

class BubbleChart{
    constructor(parent, dataset){
        this.parent = d3.select(parent);
        this.dataset = dataset;

        this.hSvg = 800;
        this.wSvg = 800;
        this.padding = 5;
    }

    init(){
        this.svg = this.parent.append("svg")
            .attr("width", "100%")
            .attr("height", "auto")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .classed("bubble-chart", true)  
    }

    prepScales(){
        const pack = d3.pack().size([this.wSvg, this.hSvg]).padding(this.padding)
        const hierarchy = d3.hierarchy({children:this.dataset}).sum(d => d.value);
        this.root = pack(hierarchy); 
    }

    render(){
        this.svg.selectAll("g")
            .data(this.root.descendants().slice(1))
            .enter()
                .append("g")
                
    }
}
