import { renderHeader } from "../../components/header/header.js";
import { renderDecadePage } from "../mainPage/decadesPage/decadesPage.js";
import { renderMostPlayedPage } from "./mostPlayedPage/mostPlayedPage.js";
import { Selector } from "../../components/header/selector/selector.js";
import { Switch } from "../../components/header/switch/switch.js";
import { renderGenresPage } from "./genresPage/genresPage.js";
import { renderMapPage } from "./mapPage/mapPage.js";

export function renderStructure(parent){
    parent.innerHTML = `<header></header>
                        <main>
                            <section id="most-played-page" class="switch-button-needed"></section>
                            <section id="decades-page"></section>
                            <section id="genre-page"></section>
                            <section id="habits-page"></section>
                            <section id="music-map-page"></section>
                            <section id="summary-page"></section>
                        </main>
                        <div id="side-buttons"></div>`;

    const mostPlayedPage = parent.querySelector("#most-played-page");
    const genrePage = parent.querySelector("#genre-page");
    const decadePage = parent.querySelector("#decades-page");
    const habitsPage = parent.querySelector("#habits-page");
    const musicMapPage = parent.querySelector("#music-map-page");
    const summaryPage = parent.querySelector("#summary-page");
    const header = parent.querySelector("header");
    
    const pageDoms = parent.querySelectorAll("section");
    renderHeader(header, pageDoms, habitsPage.id);
    renderDecadePage(decadePage);
    renderMostPlayedPage(mostPlayedPage);
    renderGenresPage(genrePage);
    renderMapPage(musicMapPage);

    
}

export function updateCurrentMainPage(pageValue, pageIndex){
    const main = document.querySelector("main");
    main.style.transform = `translate(${pageValue}, 0)`;

    const selectorInstance = Selector.getCurrentSelectorById(pageIndex);
    const switchInstance = Switch.getCurrentSwitchById(pageIndex);
    
    if(selectorInstance)Selector.updateSelector(selectorInstance);
    if(switchInstance)Switch.updateSwitch(switchInstance);
}

