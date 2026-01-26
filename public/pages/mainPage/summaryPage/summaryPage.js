import { State } from "../../../index.js";
import { onSelectorChange} from "../../../components/header/selector/selector.js";
import { DonutChart } from "../../../components/donutChart/donutChart.js";

export function renderSummaryPage(parent){
    const fullDataset = State.getStateOverlayDate();
    let dataset = fullDataset["short_term"];
    parent.innerHTML = `<div id="summary-box-container">
                            <div class="outer-box" id="left-outer-box"></div>
                            <div class="outer-box" id="center-outer-box"></div>
                            <div class="outer-box" id="right-outer-box"></div>
                        </div>`;

    const left = parent.querySelector("#left-outer-box");
    const center = parent.querySelector("#center-outer-box");
    const right = parent.querySelector("#right-outer-box");   

    onSelectorChange((event) => {
        dataset = fullDataset[event.target.value];

        renderLeftOuterBox(left, {
            "popularity": dataset.avgTrackPopularity,
        });

        if(dataset.mostListenedCountry.name){
            console.log("hello")

            updateCountryBox(left, {      
                "countryName": dataset.mostListenedCountry.name,
                "countrySvg": dataset.mostListenedCountry.svg    
            });   
        }

        renderCenterOuterBox(center, {
            "artistName": dataset.mostListenedArtist.name,
            "img": dataset.mostListenedArtist.image,
            "genre": dataset.mostListenedGenre
        });

        renderRightOuterBox(right, {
            "img": dataset.mostListenedTrack.image,
            "songName": dataset.mostListenedTrack.name,
            "decade": dataset.mostListenedDecade
        });
    });

    document.addEventListener("map:done-state-updated", () => {
        updateCountryBox(left, {      
            "countryName": dataset.mostListenedCountry.name,
            "countrySvg": dataset.mostListenedCountry.svg    
        });   
    });

    renderLeftOuterBox(left, {
        "popularity": dataset.avgTrackPopularity,
    });

    renderCenterOuterBox(center, {
        "artistName": dataset.mostListenedArtist.name,
        "img": dataset.mostListenedArtist.image,
        "genre": dataset.mostListenedGenre
    });

    renderRightOuterBox(right, {
        "img": dataset.mostListenedTrack.image,
        "songName": dataset.mostListenedTrack.name,
        "decade": dataset.mostListenedDecade
    });
}

function renderLeftOuterBox(parent, data){
    parent.innerHTML = "";
    parent.innerHTML = `<div id="top-container">
                            <div id="devloper-logout-container">
                                <div id="developer-box" class="box">
                                    <h3>Developer</h3>
                                    <img alt="developer icon" id="developer" src="../../../media/icons/developer.svg">
                                </div>
                                <div id="logout-box" class="box">
                                    <h3>Logout</h3>
                                    <img alt="logout icon" id="logout" src="../../../media/icons/logout-black.svg">
                                </div>
                            </div>
                            <div id="avg-song-pop-box" class="box">
                                <h3>Avg Song Popularity</h3>
                                <div id="avg-song-graph"></div>
                            </div>
                        </div>
                        <div id="most-listened-country" class="box">
                            <h3>Most Listened to Country</h3>
                            <div id="most-listened-country-svg"></div>
                            <h1></h1>
                        </div>`;

    const graphParent = parent.querySelector("#avg-song-graph");
    const popularity = Math.round(data.popularity);

    const dataset = [
        {label: "filled", value: popularity},
        {label: "empty", value: 100 - popularity}
    ];

    new DonutChart(
        graphParent, 
        dataset, 
        ["var(--main-purple-color)", "var(--darkest-grey)"],
        "80",
        "80"
    );
}

function updateCountryBox(parent, data){
    const svgParent = parent.querySelector("#most-listened-country-svg"); 
    const countryHeader = parent.querySelector("#most-listened-country h1");
    svgParent.innerHTML = "";

    countryHeader.textContent = data.countryName;
    const country = simplifyFeature(data.countrySvg);

    const svg = d3.select(svgParent)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${400} ${300}`)

    const projection = d3.geoMercator()
        .fitSize([400, 300], country);

    const pathGenerator = d3.geoPath().projection(projection);

    svg.append("path")
        .datum(country)
        .attr("d", pathGenerator)
        .attr("fill", "var(--main-purple-color)")
        .attr("stroke", "#000")
        .attr("stroke-width", 1);

        
    function simplifyFeature(feature) {
        if (feature.geometry.type !== "MultiPolygon") {
            return feature;
        }

        const polygons = feature.geometry.coordinates.map(coords => ({
            type: "Feature",
            properties: feature.properties,
            geometry: {
            type: "Polygon",
            coordinates: coords
            }
        }));

        const largestPolygon = polygons.reduce((a, b) =>
            d3.geoArea(a) > d3.geoArea(b) ? a : b
        );

        return largestPolygon;
    }
}

function renderCenterOuterBox(parent, data){
    parent.innerHTML = "";
    parent.innerHTML = `<div class="text-box box">
                            <h3>Most Listened to Artist</h3>
                            <h1>${data.artistName}</h1>
                        </div>
                        <img alt="artist spotify image" class="album-cover" src=${data.img}>
                        <div class="text-box text-box-underline box">
                            <h3>Most Listened to Genre</h3>
                            <h1>${data.genre}</h1>
                        </div>`;
}

function renderRightOuterBox(parent, data){
    parent.innerHTML = "";
    parent.innerHTML = `<img alt="artist spotify image" class="album-cover" src=${data.img}>
                        <div class="text-box box">
                            <h3>Most Listened to Song</h3>
                            <h1>${data.songName}</h1>
                        </div>
                        <div class="text-box text-box-underline box">
                            <h3>Most Listened to Genre</h3>
                            <h1>${data.decade}</h1>
                        </div>`;
}