import { State } from "../../../index.js";
import { updateCurrentMainPage } from "../../../pages/mainPage/structure.js";
import { Selector } from "../selector/selector.js";

export function renderNav(parent){
    parent.innerHTML = `<div id="nav-items">
                            <div class="nav-item">Most Played</div>
                            <div class="nav-item">Decades</div>
                            <div class="nav-item">Genres</div>
                            <div class="nav-item">Moods</div>
                            <div class="nav-item">Map</div>
                        </div>
                        <div id="dashboard-nav-item">
                            <img src="../../../media/icons/dashboard.svg">
                        </div>
                        <div id="marker"></div>`;
    
    const menu = parent.querySelector("#nav-items");
    const navItems = parent.querySelectorAll(".nav-item");
    const marker = parent.querySelector("#marker");

    navItems[0].classList.add("marked");
    updateNavMarker();
    navItems.forEach((element, i) => {
        element.id = i;
        element.addEventListener("click", () => {
            navItems.forEach(element => element.classList.remove("marked"));
            element.classList.add("marked");
            updateNavMarker();
            updateCurrentMainPage(`${- i * 100}vw` , i);
        })
    });
}

export function updateNavMarker(){
    const markedElement = document.querySelector("header nav .nav-item.marked");
    const menu = document.querySelector("header nav #nav-items");
    const marker = document.querySelector("header nav #marker");
    updateMarker(markedElement, menu, marker)
}

export function updateMarker(element, menu, marker){
    const rect = element.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = rect.left - menuRect.left;

    marker.style.width = rect.width + "px";
    marker.style.height = rect.height + "px";
    marker.style.transform = `translate(${left}px)`;
}