import { apiCom } from "../../../apiCom/apiCom.js";
import { Selector } from "../../../components/header/selector/selector.js";
import { getMoodsChartData, formatSongs} from "../../../logic/utils.js";

export function renderMoodsPage(parent){
    const dataset = getMoodsChartData();
    const startingDataset = [
        {
            "title": "Danceability",
            "value": 0,
        }, 
        {
            "title": "Energy",
            "value": 0,
        }, 
        {
            "title": "Happy",
            "value": 0,
        }, 
        {
            "title": "Accoustic",
            "value": 0,
        }, 
        {
            "title": "Sad",
            "value": 0,
        }
    ]; 

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);

    const selectorInstance = Selector.getSelectorByPageId(parent.id);
    const radarChart = new RadarChart(diagramContainer, dataset, "short_term", startingDataset, selectorInstance);

    document.addEventListener("map:processing", (event) => {
        if(event.detail.chartId === "map"){
            selectorInstance.disable();
        }
    });

    document.addEventListener("map:done", () => {
        if(event.detail.chartId === "map"){
            selectorInstance.enable();
        }
    })

    selectorInstance.event((event) => {
        radarChart.changeData(dataset, event.target.value);
    }); 
}

class RadarChart{
    constructor(parent, dataset, range, startingDataset, selectorInstance){
        this.range = range;
        this.parent = d3.select(parent);
        this.dataset = dataset[range];
        this.startingDataset = startingDataset;
        this.selectorInstance = selectorInstance;

        this.existingData = {
            "short_term": {
                "data": [],
                "counter": undefined
            },
            "medium_term": {
                "data": [],
                "counter": undefined
            },
            "long_term": {
                "data": [],
                "counter": undefined
            }
        } 

        this.margin = {
            top: 50,
            right: 100,
            bottom: 50,
            left: 100
        }
        this.colors = {
            lilacOpacity: "#D2AFFF",
            lilac: "#D2AFFF"
        }

        this.wSvg =  850  
        this.hSvg = 800; 
        this.hViz = this.hSvg - this.margin.bottom - this.margin.top;
        this.wViz = this.wSvg - this.margin.left - this.margin.right;
        this.radius = d3.min([this.hViz, this.wViz]) / 2; 

        this.gridLevels = [0.4, 1];
        this.pieAngle = (2 * Math.PI) / this.startingDataset.length;

        this.transitionDuration = 700;

        this.init();
    }

    async init(){
        this.svg = this.parent.append("svg")
            .attr("width", this.wSvg)
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .classed("radarChart", true)

        this.graphGroup = this.svg.append("g")
            .classed("graphGroup", true)
            .attr("transform", `translate(${this.wSvg / 2},  ${this.hSvg/2})`)

        this.renderGrid();
        this.renderLabels();
        this.renderPolygonDots();
        this.renderPolygon();
        this.selectorInstance.disable();
        await this.fetchTrackFeature();
        this.selectorInstance.enable();
        document.dispatchEvent(new CustomEvent("radar:done", {detail: {chartId: "moods", firstTime: true}}));
    }

    renderGrid(){
        const circles = this.graphGroup.append("g").classed("circleGridGroup", true)
            .selectAll("circle")
            .data(this.gridLevels)
            .enter()
            .append("circle")
                .classed("gridCircle", true)
                .attr("r", (d, i, nodes) => d * this.radius)
        
        const lines = this.graphGroup.append("g").classed("lineGroup", true)
            .selectAll("line")
            .data(this.dataset)
            .enter()
            .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", (d, i, nodes) => {
                    const angle = i * this.pieAngle;
                    return this.radius * Math.sin(angle);
                })
                .attr("y2", (d, i, nodes) => {
                    const angle = i * this.pieAngle;
                    return -this.radius * Math.cos(angle);
                })
                .attr("stroke", "#ccc")
                .attr("stroke-dasharray", "9");
    }

    renderLabels(){
        this.graphGroup.append("g").classed("labelGroup", true)
            .selectAll("text")
            .data(this.startingDataset)
            .enter()
            .append("text")
                .classed("radarChartLabel", true)
                .text((d, i, nodes) => d.title)
                .attr("x", (d, i, nodes) => this.getLabelX(i, nodes))
                .attr("y", (d, i, nodes) => this.getLabelY(i, nodes));
    }

    renderPolygon(){
        const radarLine = d3.lineRadial()
            .radius((d, i) => d.value * this.radius)
            .angle((d, i) => i * this.pieAngle)
            .curve(d3.curveLinearClosed);

        this.polygon = this.graphGroup.append("g").classed("polygonGroup", true)
            .selectAll("path")
            .data([this.startingDataset])
            .enter()
            .append("path")
                .attr("class", "radarArea")
                .attr("d", radarLine);
    }

    renderPolygonDots(){
        this.polygonDots = this.graphGroup.append("g").classed("dotsGroup", true)
            .selectAll("circle")
            .data(this.startingDataset)
            .enter()
            .append("circle")
                .classed("radarCircles", true)
                .attr("cx", (d, i) => this.getDotX(d, i))
                .attr("cy", (d, i) => this.getDotY(d, i))
                .attr("r", 5);
    }

    async fetchTrackFeature(){
        for(const track of this.dataset){
            const data = await apiCom("song:get-features", {"artist": track.artist, "title": formatSongs(track.title)});
            this.formatTrackFeatures(data);
        }
    }

    formatTrackFeatures(data){
        if(data.resource !== null && data.ok){
            data = data.resource;

            for(const key in data){
                if(data[key].toString().includes("e")){
                    data[key] = 0.0001;
                }
            }

            if(this.existingData[this.range]?.counter){ 
                for(const key in data){
                    const existingData = this.existingData[this.range];
                    const obj = existingData.data.find(item => item.title === key);
                    const index = existingData.data.findIndex(item => item.title === key);

                    const sum = obj.value * existingData.counter;
                    const newSum = sum + data[key];
                    const newAvg = newSum / (existingData.counter + 1);

                    this.existingData[this.range].data[index].value = newAvg
                }
                this.existingData[this.range].counter++;
            }
            else{
                for(const key in data){
                    this.existingData[this.range].data.push({
                        "title": key,
                        "value": data[key]
                    });
                    this.existingData[this.range].counter = 1;
                }
            }
            this.updateData(this.existingData[this.range].data);
        }
    }

    getDotY(d, i){
        const r = d.value * this.radius;
        const angle = i * this.pieAngle;
        return -r * Math.cos(angle);
    }

    getDotX(d, i){
        const r = d.value * this.radius;
        const angle = i * this.pieAngle;
        return r * Math.sin(angle);
    }

    getLabelY(index, nodes){
        let addHeight = 0;
        const labelHeight = nodes[index].getBBox().height;

        switch(index){
            case 1: 
                addHeight = labelHeight / 3;
                break;
            case 2:
                addHeight = labelHeight * 0.6;
                break;
            case 3:
                addHeight = labelHeight * 0.6;
                break;
            case 4:
                addHeight = labelHeight / 3;
                break;
            default:
                addHeight = 0;  
                break;                 
        }

        const angle = index * this.pieAngle;
        return -this.radius * Math.cos(angle) * 1.05 + addHeight;
    }

    getLabelX(index, nodes){
        let addWidth = 0;
        const labelWidth = nodes[index].getBBox().width;

        switch(index){
            case 0:
                addWidth = -labelWidth / 2;
                break;
            case 1:
                addWidth = labelWidth / 11;
                break;
            case 3:
                addWidth = -labelWidth;
                break;
            case 4:
                addWidth = -labelWidth;
                break;
            default:
                addWidth = 0;   
                break;                
        }

        const angle = index * this.pieAngle;
        return this.radius * Math.sin(angle) * 1.05 + addWidth;
    }

    updateData(dataset){
        this.dataset = dataset;

        this.polygonDots
            .data(this.dataset)
            .transition()
            .duration(this.transitionDuration)
            .attr("cx", (d, i) => this.getDotX(d, i))
            .attr("cy", (d, i) => this.getDotY(d, i))

        const radarLine = d3.lineRadial()
            .radius((d, i) => d.value * this.radius)
            .angle((d, i) => i * this.pieAngle)
            .curve(d3.curveLinearClosed);

        this.polygon
            .data([this.dataset])
            .transition()
            .duration(this.transitionDuration)
            .attr("d", radarLine)
    }

    reset(){
        this.polygonDots
            .data(this.startingDataset)
            .transition()
            .duration(this.transitionDuration)
            .attr("cx", (d, i) => this.getDotX(d, i))
            .attr("cy", (d, i) => this.getDotY(d, i))

        const radarLine = d3.lineRadial()
            .radius((d, i) => d.value * this.radius)
            .angle((d, i) => i * this.pieAngle)
            .curve(d3.curveLinearClosed);

        this.polygon
            .data([this.startingDataset])
            .transition()
            .duration(this.transitionDuration)
            .attr("d", radarLine)
    }

    async changeData(dataset, range){
        this.dataset = dataset[range];
        this.range = range;
        this.reset();

        if(this.existingData[this.range]?.counter){
            this.updateData(this.existingData[this.range].data)
        }
        else{
            this.selectorInstance.disable();
            document.dispatchEvent(new CustomEvent("radar:processing", {detail: {chartId: "moods"}}));
            await this.fetchTrackFeature();
            document.dispatchEvent(new CustomEvent("radar:done", {detail: {chartId: "moods", firstTime: false}}));
            this.selectorInstance.enable();
        }
    }
}