import { getMapData } from "../../../logic/utils.js";
import { apiCom } from "../../../apiCom/apiCom.js";
import { Selector } from "../../../components/header/selector/selector.js";
import { State } from "../../../index.js";
import { findArray } from "../../../logic/utils.js";

export function renderMapPage(parent){
    const dataset = getMapData();
    const diagramContainer = document.createElement("div");
    const songContainer = document.createElement("div");
    diagramContainer.className = "diagram-container";
    songContainer.className = "song-container";
    parent.appendChild(diagramContainer);
    parent.appendChild(songContainer);

    const selectorInstance = Selector.getSelectorByPageId(parent.id);
    const map = new Map(diagramContainer, dataset, "short_term", selectorInstance);

    selectorInstance.event((event) => {
        map.changeData(dataset, event.target.value);
        unMarkArtistDivs();
    }); 

    document.addEventListener("map:done-send-data", function renderArtistsDivs(event){
        const dataset = event.detail.artists;
        const range = event.detail.range;

        dataset.forEach((item) => {
            const foundElement = findArray(songContainer.childNodes, (element) => element.className.includes(item.country));

            if(foundElement){
                foundElement.classList.add("box-" + item.country + "-" + range);
            }
            else{
                renderArtistsDiv(songContainer, item, range);
            }
        });
    });
}

function renderArtistsDiv(parent, item, range){
    const artistParent = document.createElement("div");
    artistParent.classList.add("artist-container");
    artistParent.classList.add("box-" + item.country + "-" + range);
    parent.appendChild(artistParent);

    artistParent.innerHTML = `<img src="${item.image}">
                              <div class="artist-title-name">
                                   <h3 class="artist-title">Top Artist</h3> 
                                   <h3 class="artist-name">${item.name}</h3>
                              </div>`; 
}

function unMarkArtistDivs(){
    const artistContainer = document.querySelectorAll("#music-map-page .song-container .artist-container")
    artistContainer.forEach((elem) => {
        elem.classList.remove("show");
    });
}

class Map{
    constructor(parent, dataset, range, selectorInstance){
        this.selectorInstance = selectorInstance;
        this.parent = d3.select(parent);
        this.range = range;
        this.dataset = dataset[range];

        this.existingData = {
            "short_term": [],
            "medium_term": [],
            "long_term": []
        } 

        this.hSvg = 800;
        this.wSvg = 1500;
        this.marginBottom = 40;
        this.colors = [
            "#E3CCFF",
            "#c89ffdff",
            "#AD74F6",
            "#9745FF"
        ]

        this.init();
    }

    async init(){
        this.svg = this.parent.append("svg")
            .attr("width", "100%")
            .attr("height", "95%")
            .attr("viewBox", `0 0 ${this.wSvg} ${this.hSvg}`)
            .classed("map-graph", true)
     
            
            
        await this.prepCountryData();
        this.prepScales();
        this.render();
        this.selectorInstance.disable();
        await this.getExistingDataFromServer();
        await this.fetchAndSetColors();
        this.done();
        this.bindListeners();
    }

    async getExistingDataFromServer(){
        const existingServerData = await apiCom("server:get-country-data", this.dataset);
        this.existingServerData = existingServerData;
    } 

    async prepCountryData(){
        const data = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
        this.countries = data.features.filter(country => country.properties.name !== "Antarctica");

        this.world = { type: "FeatureCollection", features: this.countries };
    }

    prepScales(){
        this.projection = d3.geoMercator().fitSize([this.wSvg, this.hSvg - this.marginBottom], this.world);
        this.path = d3.geoPath().projection(this.projection);
        this.customInterpolator = (t) => {
            return d3.interpolateRgbBasis(this.colors)(t);
        }
    }

    render(){
        this.svg.append("g").classed("graph", true).selectAll("path")
            .data(this.countries)
            .enter()
            .append("path")
                .attr("d", this.path)
                .attr("id", d => this.formatCountryName(d.properties.name))
                .classed("country", true)
                .attr('fill', '#383141')
                .attr("stroke", "black")
    }

    async fetchAndSetColors(){
        for(const artist of this.dataset){
            const artistObj = this.existingServerData.find(item => item.id === artist.id);

            if(artistObj !== undefined){
                if(artistObj.country !== null){
                    this.formatArtistCountryItem(artistObj.country, artist);
                }
                continue;
            }

            const data = await apiCom("song:get-country", {spotifyId: artist.id, artistName: artist.name});
            if(data.ok && data.resource){
                if(data.resource.result){
                    apiCom("server:set-country-data", {id: artist.id, country: data.resource.result});
                    this.formatArtistCountryItem(data.resource.result, artist);
                }
            }
        }
    }

    formatArtistCountryItem(countryName, artist){
        const country = this.formatCountryName(countryName);
        const exists = this.existingData[this.range].find(item => item.country === country);
        let newCountry = null;

        if(exists){
            exists.value++;
            newCountry = exists;
        }
        else{
            newCountry = {
                "image": artist.image,
                "country": this.formatCountryName(country),
                "name": artist.name,
                "value": 1
            }
            this.existingData[this.range].push(newCountry);
        }

        this.updateCountryColor(newCountry);
    }


    updateCountryColor(countryObj){
        const max = d3.max(this.existingData[this.range].map(item => item.value))
        const min = d3.min(this.existingData[this.range].map(item => item.value))
        const countryName = countryObj.country;
        const countryValue = countryObj.value;

        const color = d3.scaleSequential()
            .domain([min, max])
            .interpolator(this.customInterpolator);

        this.svg.select(`#${countryName}`)
            .classed('done', true)
            .transition()
            .duration(300)
            .attr("fill", d => color(countryValue))
    }


    formatCountryName(country){
        let formatted = country;

        if(country === "United States"){
            formatted = "USA";
        }

        else if (country === "United Kingdom"){
            formatted = "England";
        }

        else if(country.includes(" ")){
            formatted = country.replaceAll(" ", "-");
        } 
        return formatted.toLowerCase();
    }

    setColorsFromMemory(){
        for(const item of this.existingData[this.range]){
            this.updateCountryColor(item);
        }    
    }

    bindListeners() {
        const formatCountryName = this.formatCountryName;
        this.svg.selectAll(".country").on("click", (event, d) => {
            const range = this.range;

            unMarkArtistDivs();
            d3.select(event.currentTarget).classed("pressed", true);

            const className = `.box-${formatCountryName(d.properties.name)}-${range}`;
            d3.select(className).classed("show", true);
        });
    }

    async changeData(dataset, range){
        this.dataset = dataset[range];
        this.range = range;

        this.svg.selectAll("path")
            .attr('fill', '#383141')
            .attr("stroke", "black")
            .classed("done", false)
        
        if(this.existingData[this.range].length !== 0){
            this.setColorsFromMemory();
        }
        else{
            this.selectorInstance.disable();
            //document.dispatchEvent(new CustomEvent("map:processing", {detail: {chartId: "map"}}));
            await this.getExistingDataFromServer();
            await this.fetchAndSetColors();
        }
        this.done();
    }
    
    done(){
        //document.dispatchEvent(new CustomEvent("map:done", {detail: {chartId: "map"}}));
        const detail = {detail : 
            {
                "range": this.range,
                "artists": this.existingData[this.range]
            }
        }
        
        document.dispatchEvent(new CustomEvent("map:done-send-data", detail));
        this.selectorInstance.enable();

        const mostListenedCountry = this.existingData[this.range].sort((a, b) => b.value - a.value)[0].country;
        const mostListenedCountryCords = this.countries.find(country => this.formatCountryName(country.properties.name) === this.formatCountryName(mostListenedCountry));

        State.setStateOverlayData("mostListenedCountry", this.range, {
            "svg": mostListenedCountryCords,
            "name": mostListenedCountry
        });
    }
}