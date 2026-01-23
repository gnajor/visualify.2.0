import { State } from "../../../index.js";

export function renderSummaryPage(parent){
    const dataset = State.getStateOverlayDate();
    console.log()


    parent.innerHTML = `<div id="summary-box-container">
                            <div class="outer-box" id="left-outer-box"></div>
                            <div class="outer-box" id="center-outer-box"></div>
                            <div class="outer-box" id="right-outer-box"></div>
                        </div>`;

    const left = parent.querySelector("#left-outer-box");
    const center = parent.querySelector("#center-outer-box");
    const right = parent.querySelector("#right-outer-box");   
}

/* function renderLeftOuterBox(parent, data){
    parent.innerHTML = `<div id="top-container">
                            <div id="devloper-logout-container">
                                <div id="developer-box" class="box">
                                    <h3>Developer</h3>
                                    <img alt="developer icon" src="../../../media/icons/devloper.svg">
                                </div>
                                <div id="logout-box" class="box">
                                    <h3>Logout</h3>
                                    <img alt="logout icon" src="../../../media/icons/logout.svg">
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
                            <h2>${}</h2>
                        </div>`;

    const graphParent = parent.querySelector("#avg-song-graph");
}

function renderCenterOuterBox(parent, data){
    parent.innerHTML = `<div class="text-box box">
                            <h3>Most Listened to Artist</h3>
                            <h2>${}</h2>
                        </div>
                        <img alt="artist spotify image" src=${}>
                        <div class="text-box text-box-underline box">
                            <h3>Most Listened to Genre</h3>
                            <h2>${}</h2>
                        </div>`;
}

function renderRightOuterBox(parent){
    parent.innerHTML = `<img alt="artist spotify image" src=${}>
                        <div class="text-box box">
                            <h3>Most Listened to Artist</h3>
                            <h2>${}</h2>
                        </div>
                        <div class="text-box text-box-underline box">
                            <h3>Most Listened to Genre</h3>
                            <h2>${}</h2>
                        </div>`;
} */