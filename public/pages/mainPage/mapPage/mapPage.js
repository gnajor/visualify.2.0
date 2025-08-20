import { getMapData } from "../../../logic/utils.js";
import { apiCom } from "../../../apiCom/apiCom.js";

export function renderMapPage(parent){
    const dataset = getMapData();

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);


    const map = new Map(diagramContainer, dataset["short_term"]);

/*     const data = await apiCom("song:get-country", {
        spotifyId: artist.id,
        artistName: artist.name
    }); */
}

class Map{
    constructor(parent, dataset){
        this.parent = d3.select(parent);
        this.dataset = dataset;

        this.hSvg = 1000;
        this.wSvg = 1500;

        this.init();
    }

    async init(){
        this.svg = this.parent.append("svg")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("viewbox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .classed("map-graph", true)

        this.prepScales();
        await this.prepData();
        this.render();
    }

    prepScales(){
        const path = d3.geoPath();
        this.projection = d3.geoMercator()
            .scale(180)
            .center([0, 20])
            .translate([this.wSvg/1.5, this.hSvg/2]);
    }

    async prepData(){
        const data = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
        this.countries = data.features;

        const index = this.countries.findIndex(country => country.properties.name === "Antarctica")

        if(index !== -1){
            this.countries.splice(index, 1);
        }
    }

    render(){
        console.log(this.countries)

        this.svg.append("g").classed("graph", true).selectAll("path")
            .data(this.countries)
            .enter()
            .append("path")
                .attr("d", d3.geoPath().projection(this.projection))
                .attr("id", d => this.formatCountryName(d.properties.name))
                .style('fill', '#383141')
                .style("stroke", "black")

    }

    formatCountryName(country){
        if(country.includes(" ")) return name.replaceAll(" ", "-");
        return country;
    }
}