import { apiCom } from "../../../apiCom/apiCom.js";
import { onSelectorChange } from "../../../components/header/selector/selector.js";
import { getMoodsChartData} from "../../../logic/utils.js";

export function renderMoodsPage(parent){
    const dataset = getMoodsChartData();

    const diagramContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    parent.appendChild(diagramContainer);

/*     const wordCloud = new WordCloud(diagramContainer, dataset, "short_term"); */

    const controller = radarController(diagramContainer, dataset);
    controller.loadRange("short_term");

    onSelectorChange((event) => {
        controller.loadRange(event.target.value);
    }); 
}

function radarController(parent, fullDataset){
    const startingDataset = [
        {
            "title": "Energy",
            "value": 0,
        }, 
        {
            "title": "Intense",
            "value": 0,
        }, 
        {
            "title": "Sad",
            "value": 0,
        }, 
        {
            "title": "Happy",
            "value": 0,
        }, 
        {
            "title": "Calm",
            "value": 0,
        }
    ]; 

    const cache = {
        "short_term": null,
        "medium_term": null,
        "long_term": null
    } 

    const chart = radarChart(parent, startingDataset);

    async function loadRange(range){
        if(cache[range]){
            chart.update(cache[range]);
            return;
        }
        document.dispatchEvent(new CustomEvent("radar:processing"));

        const datasetToSetAndGet = [];
        const songsMood = await apiCom("server:get-mood-data", fullDataset[range]);
        let moodsData = [];

        for(const song of fullDataset[range]){
            const exists = songsMood.some(songWithMood => songWithMood.id === song.id);

            if(!exists){
                datasetToSetAndGet.push(song);   
            }
        }
        
        if(datasetToSetAndGet.length !== 0){
            const data = await apiCom("songs:get-features", datasetToSetAndGet); //gets the song features
            moodsData = data.resource; 
        }

        const formatted = formatTrackFeatures(moodsData.concat(songsMood));

        cache[range] = formatted;
        chart.update(formatted);
    }

    function formatTrackFeatures(tracks){
        const moods = startingDataset.map(d => ({
            title: d.title,
            value: 0
        }));

        for(const track of tracks){
            track.moods.forEach((mood) => {
                const exists = moods.find(moodsItem => moodsItem.title === mood);
                if(exists)exists.value++;
            });
        }

        moods.forEach(item => item.value /= tracks.length);
        return moods;
    }

    return { loadRange };
}

function radarChart(parentSelector, startingDataset){
    const parent = d3.select(parentSelector);

    const margin = {
        top: 50,
        right: 100,
        bottom: 50,
        left: 100
    }

    const wSvg =  850  
    const hSvg = 800; 
    const hViz = hSvg - margin.bottom - margin.top;
    const wViz = wSvg - margin.left - margin.right;
    const radius = d3.min([hViz, wViz]) / 2; 

    const gridLevels = [0.4, 1]; //where the circles are
    const pieAngle = (2 * Math.PI) / startingDataset.length;
    const transitionDuration = 700;

    let polygon;
    let polygonDots;


    const svg = parent.append("svg")
        .attr("width", "auto")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${wSvg} ${hSvg}`)
        .classed("radarChart", true)

    const graphGroup = svg.append("g")
        .classed("graphGroup", true)
        .attr("transform", `translate(${wSvg / 2},  ${hSvg/2})`)

    renderGrid();
    renderLabels();
    renderPolygonDots();
    renderPolygon();

    function renderGrid(){
        //circles
        graphGroup.append("g").classed("circleGridGroup", true)
            .selectAll("circle")
            .data(gridLevels)
            .enter()
            .append("circle")
                .classed("gridCircle", true)
                .attr("r", (d) => d * radius)
        
        //lines
        graphGroup.append("g").classed("lineGroup", true)
            .selectAll("line")
            .data(startingDataset)
            .enter()
            .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", (_d, i) => radius * Math.sin(i * pieAngle))
                .attr("y2", (_d, i) => -radius * Math.cos(i * pieAngle))
                .attr("stroke", "#ccc")
                .attr("stroke-dasharray", "9");
    }

    function renderLabels(){
        graphGroup.append("g").classed("labelGroup", true)
            .selectAll("text")
            .data(startingDataset)
            .enter()
            .append("text")
                .classed("radarChartLabel", true)
                .text((d) => d.title)
                .attr("x", (_d, i, nodes) => getLabelX(i, nodes))
                .attr("y", (_d, i, nodes) => getLabelY(i, nodes));
    }
    

    function renderPolygon(){
        polygon = graphGroup.append("g").classed("polygonGroup", true)
            .selectAll("path")
            .data([startingDataset])
            .enter()
            .append("path")
                .attr("class", "radarArea")
                .attr("d", radarLine());
    }

    function renderPolygonDots(){
        polygonDots = graphGroup.append("g").classed("dotsGroup", true)
            .selectAll("circle")
            .data(startingDataset)
            .enter()
            .append("circle")
                .classed("radarCircles", true)
                .attr("cx", (d, i) => getDotX(d, i))
                .attr("cy", (d, i) => getDotY(d, i))
                .attr("r", 5);
    }

    function update(data) {
        polygonDots
            .data(data)
            .transition()
            .duration(transitionDuration)
            .attr("cx", getDotX)
            .attr("cy", getDotY);

        polygon
            .data([data])
            .transition()
            .duration(transitionDuration)
            .attr("d", radarLine());
    }

    function reset() {
        update(startingDataset);
    }
    
    //---------------------------
    // HELPERS
    //---------------------------

    function radarLine(){
        return d3.lineRadial()
            .radius((d) => d.value * radius)
            .angle((_d, i) => i * pieAngle)
            .curve(d3.curveLinearClosed);
    }

    function getDotX(d, i){
        const r = d.value * radius;
        const angle = i * pieAngle;
        return r * Math.sin(angle);
    }

    function getDotY(d, i){
        const r = d.value * radius;
        const angle = i * pieAngle;
        return -r * Math.cos(angle);
    }

    function getLabelY(index, nodes){
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

        const angle = index * pieAngle;
        return -radius * Math.cos(angle) * 1.05 + addHeight;
    }

    function getLabelX(index, nodes){
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

        const angle = index * pieAngle;
        return radius * Math.sin(angle) * 1.05 + addWidth;
    }

    return {
        update,
        reset
    }
}

/* class WordCloud{
    constructor(parent, dataset, range){
        this.range = range;
        this.dataset = dataset[range];
        this.parent = d3.select(parent);

        this.existingData = {
            "short_term": [],
            "medium_term": [],
            "long_term": []
        } 

        this.hSvg = 800;
        this.wSvg = 1000;
        this.padding = 9;

        this.init();
    }

    async init(){
        this.svg = this.parent.append("svg")
            .attr("width", this.wSvg)
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .classed("word-cloud", true);

        await this.fetchTracksFeatures();
        this.prepScales();
    }

    async fetchTracksFeatures(){
        const data = await apiCom("songs:get-features", this.dataset);
        this.existingData[this.range] = this.formatDataset(data.resource);
    }

    formatDataset(data){
        const moods = [];

        for(const track of data){
            track.moods.forEach((mood) => {
                const exists = moods.find(moodsItem => moodsItem.text === mood);

                if(exists){
                    exists.size++;
                }
                else{
                    moods.push({
                        "text": mood,
                        "size": 1
                    });
                }
            });
        }

        return moods;
    }

        prepScales() {
              const words = this.existingData[this.range];

  // find min and max counts
  const extent = d3.extent(words, d => d.size);

            const fontSizeScale = d3.scaleLinear()
                .domain(extent)
                .range([20, 70]);

            this.layout = d3.layout.cloud()
                .size([this.wSvg, this.hSvg])
                .words(this.existingData[this.range])
                .padding(this.padding)
                .rotate(() => ~~(Math.random() * 2) * 90)
                .fontSize(d => fontSizeScale(d.size))
                .on("end", words => this.render(words));
            this.layout.start();
    }

    render(words) {
        console.log(this)

        this.svg.append("g")
            .attr("transform", `translate(${this.layout.size()[0] / 2}, ${this.layout.size()[1] / 2})`)
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .attr("font-size", d => d.size)
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
            .text(d => d.text); 
    }
} */
