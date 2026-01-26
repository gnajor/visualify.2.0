import { getMapData } from "../../../logic/utils.js";
import { apiCom } from "../../../apiCom/apiCom.js";
import { onSelectorChange } from "../../../components/header/selector/selector.js";
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

    function renderArtistsDiv(item, range) {
        const artistParent = document.createElement("div");
        artistParent.classList.add("artist-container");
        artistParent.classList.add("box-" + item.country + "-" + range);
        songContainer.appendChild(artistParent);

        artistParent.innerHTML = `<img src="${item.image}">
                                  <div class="artist-title-name">
                                       <h3 class="artist-title">Top Artist</h3> 
                                       <h3 class="artist-name">${item.name}</h3>
                                  </div>`;
    }

    function unMarkArtistDivs(){
        const artistContainer = document.querySelectorAll("#music-map-page .song-container .artist-container");
        artistContainer.forEach((elem) => {
            elem.classList.remove("show");
        });
    }

    document.addEventListener("map:done-send-data", function renderArtistsDivs(event) {
        const dataset = event.detail.artists;
        const range = event.detail.range;

        dataset.forEach((item) => {
            const foundElement = findArray(songContainer.childNodes, (element) => element.className.includes(item.country));

            if (foundElement) {
                foundElement.classList.add("box-" + item.country + "-" + range);
            } else {
                renderArtistsDiv(item, range);
            }
        });
    });

    // Initialize map
    createMap(diagramContainer, dataset, "short_term", unMarkArtistDivs);
}

function createMap(parent, dataset, initialRange, unMarkArtistDivs){
    const state = {
        parent: d3.select(parent),
        range: initialRange,
        dataset: dataset[initialRange],
        existingData: {
            "short_term": [],
            "medium_term": [],
            "long_term": []
        },
        existingServerData: null,
        svg: null,
        countries: null,
        world: null,
        projection: null,
        path: null,
        currentFetchId: 0,
        customInterpolator: null,
        hSvg: 800,
        wSvg: 1500,
        marginBottom: 40,
        colors: [
            "#E3CCFF",
            "#c89ffdff",
            "#AD74F6",
            "#9745FF"
        ]
    };

    function formatCountryName(country){
        let formatted = country;

        if (country === "United States"){
            formatted = "USA";
        } 
        else if (country === "United Kingdom"){
            formatted = "England";
        } 
        else if (country.includes(" ")) {
            formatted = country.replaceAll(" ", "-");
        }
        return formatted.toLowerCase();
    }

    function updateCountryColor(countryObj){
        const max = d3.max(state.existingData[state.range].map(item => item.value));
        const min = d3.min(state.existingData[state.range].map(item => item.value));
        const countryName = countryObj.country;
        const countryValue = countryObj.value;

        const color = d3.scaleSequential()
            .domain([min, max])
            .interpolator(state.customInterpolator);

        state.svg.select(`#${countryName}`)
            .classed('done', true)
            .transition()
            .duration(300)
            .attr("fill", d => color(countryValue));
    }

    function formatArtistCountryItem(countryName, artist){
        const country = formatCountryName(countryName);
        const exists = state.existingData[state.range].find(item => item.country === country);
        let newCountry = null;

        if (exists) {
            exists.value++;
            newCountry = exists;
        } else {
            newCountry = {
                "image": artist.image,
                "country": formatCountryName(country),
                "name": artist.name,
                "value": 1
            };
            state.existingData[state.range].push(newCountry);
        }

        updateCountryColor(newCountry);
    }

    async function fetchAndSetColors(){
        for (const artist of state.dataset){
            const artistObj = state.existingServerData.find(item => item.id === artist.id);

            if (artistObj !== undefined) {
                if (artistObj.country !== null) {
                    formatArtistCountryItem(artistObj.country, artist);
                }
                continue;
            }

            const data = await apiCom("song:get-country", { spotifyId: artist.id, artistName: artist.name });
            if (data.ok && data.resource){
                if (data.resource.result){
                    apiCom("server:set-country-data", { id: artist.id, country: data.resource.result });
                    formatArtistCountryItem(data.resource.result, artist);
                }
            }
        }
    }

    async function getExistingDataFromServer(){
        const existingServerData = await apiCom("server:get-country-data", state.dataset);
        state.existingServerData = existingServerData;
    }

    async function prepCountryData(){
        const data = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
        state.countries = data.features.filter(country => country.properties.name !== "Antarctica");
        state.world = { type: "FeatureCollection", features: state.countries };
    }

    function prepScales(){
        state.projection = d3.geoMercator().fitSize([state.wSvg, state.hSvg - state.marginBottom], state.world);
        state.path = d3.geoPath().projection(state.projection);
        state.customInterpolator = (t) => {
            return d3.interpolateRgbBasis(state.colors)(t);
        };
    }

    function renderMap(){
        state.svg.append("g").classed("graph", true).selectAll("path")
            .data(state.countries)
            .enter()
            .append("path")
            .attr("d", state.path)
            .attr("id", d => formatCountryName(d.properties.name))
            .classed("country", true)
            .attr('fill', '#383141')
            .attr("stroke", "black");
    }

    function setColorsFromMemory(){
        for (const item of state.existingData[state.range]) {
            updateCountryColor(item);
        }
    }

    function bindListeners(){
        state.svg.selectAll(".country").on("click", (event, d) => {
            const range = state.range;

            unMarkArtistDivs();
            d3.select(event.currentTarget).classed("pressed", true);

            const className = `.box-${formatCountryName(d.properties.name)}-${range}`;
            d3.select(className).classed("show", true);
        });
    }

    function done(){
        document.dispatchEvent(new CustomEvent("map:done", { detail: { chartId: "map" } }));
        const detail = {
            detail: {
                "range": state.range,
                "artists": state.existingData[state.range]
            }
        };

        document.dispatchEvent(new CustomEvent("map:done-send-data", detail));
        
        const mostListenedCountry = state.existingData[state.range].sort((a, b) => b.value - a.value)[0].country;
        const mostListenedCountryCords = state.countries.find(country => formatCountryName(country.properties.name) === formatCountryName(mostListenedCountry));
        
        State.setStateOverlayData("mostListenedCountry", state.range, {
            "svg": mostListenedCountryCords,
            "name": mostListenedCountry
        });

        document.dispatchEvent(new CustomEvent("map:done-state-updated"));
    }

    async function changeData(newRange){
        const fetchId = ++state.currentFetchId;
        state.dataset = dataset[newRange];
        state.range = newRange;
        

        state.svg.selectAll("path")
            .attr('fill', '#383141')
            .attr("stroke", "black")
            .classed("done", false);

        if(state.existingData[state.range].length !== 0) {
            setColorsFromMemory();
        } 
        else{
            await getExistingDataFromServer();

            if(fetchId !== state.currentFetchId){
                return;
            }

            await fetchAndSetColors(fetchId);
        }
        done();
    }

    async function init(){
        state.svg = state.parent.append("svg")
            .attr("width", "100%")
            .attr("height", "95%")
            .attr("viewBox", `0 0 ${state.wSvg} ${state.hSvg}`)
            .classed("map-graph", true);

        await prepCountryData();
        prepScales();
        renderMap();
        await getExistingDataFromServer();
        await fetchAndSetColors();
        done();
        bindListeners();
    }

    onSelectorChange((event) => {
        changeData(event.target.value);
        unMarkArtistDivs();
    });

    init();
}