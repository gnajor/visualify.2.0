import { renderHeader } from "../../components/header/header.js";
import { getMostPlayedData } from "../../logic/utils.js";
import { renderDecadePage } from "../mainPage/decades/decades.js";

export function renderStructure(parent){
    parent.innerHTML = `<header></header>
                        <main>
                            <section id="most-played-page"></section>
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
}

