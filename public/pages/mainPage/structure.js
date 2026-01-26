import { renderHeader } from "../../components/header/header.js";
import { renderDecadePage } from "../mainPage/decadesPage/decadesPage.js";
import { renderMostPlayedPage } from "./mostPlayedPage/mostPlayedPage.js";
import { Switch } from "../../components/header/switch/switch.js";
import { renderGenresPage } from "./genresPage/genresPage.js";
import { renderMapPage } from "./mapPage/mapPage.js";
import { renderMoodsPage } from "./moodsPage/moodsPage.js";
import { renderSideButtons } from "../../components/sideButtons/sideButtons.js";
import { renderSummaryPage } from "./summaryPage/summaryPage.js";

export function renderStructure(parent){
    parent.innerHTML = `<header></header>
                        <main>
                            <section id="summary-page"></section>
                            <section id="most-played-page" class="switch-button-needed"></section>
                            <section id="decades-page"></section>
                            <section id="genre-page"></section>
                            <section id="moods-page"></section>
                            <section id="music-map-page"></section>
                        </main>
                        <div id="side-buttons"></div>`;

    const mostPlayedPage = parent.querySelector("#most-played-page");
    const genrePage = parent.querySelector("#genre-page");
    const decadePage = parent.querySelector("#decades-page");
    const moodsPage = parent.querySelector("#moods-page");
    const musicMapPage = parent.querySelector("#music-map-page");
    const summaryPage = parent.querySelector("#summary-page");
    const sideButtons = parent.querySelector("#side-buttons");
    const header = parent.querySelector("header");
    
    const pageDoms = parent.querySelectorAll("section");
    renderHeader(header, pageDoms);
    renderDecadePage(decadePage);
    renderMostPlayedPage(mostPlayedPage);
    renderGenresPage(genrePage);
    renderMapPage(musicMapPage);
    renderMoodsPage(moodsPage);
    renderSideButtons(sideButtons);
    renderSummaryPage(summaryPage);
}

export function updateCurrentMainPage(width, height, pageIndex){
    const main = document.querySelector("main");
    main.style.transform = `translate(${width}, ${height})`;

    const switchInstance = Switch.getCurrentSwitchById(pageIndex);
    
    if(switchInstance)Switch.updateSwitch(switchInstance);
}

export function updateSummaryPagePos(value){
    const summaryPage = document.querySelector("#summary-page");
    summaryPage.style.left = value;
}

