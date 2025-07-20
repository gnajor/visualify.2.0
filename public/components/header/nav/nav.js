import { State } from "../../../index.js";
import { Selector } from "../selector/selector.js";

export function renderNav(parent){
    parent.innerHTML = `<div id="nav-items">
                            <div class="nav-item">Most Played</div>
                            <div class="nav-item">Decades</div>
                            <div class="nav-item">Genres</div>
                            <div class="nav-item">Habits</div>
                            <div class="nav-item">Map</div>
                        </div>
                        <div id="dashboard-nav-item">
                            <img src="../../../media/icons/dashboard.svg">
                        </div>
                        <div id="marker"></div>`;
    
    const menu = parent.querySelector("#nav-items");
    const navItems = parent.querySelectorAll(".nav-item");
    const marker = parent.querySelector("#marker");

    updateMarker(navItems[0], menu, marker);
    navItems.forEach((element, i) => {
        element.id = i;
        element.addEventListener("click", () => {
            navItems.forEach(element => element.classList.remove("marked"));
            updateMarker(element, menu, marker);
            
            State.setCurrentPage(i);
            const instance = Selector.getCurrentSelectorbyId(i);
            console.log(instance)

            Selector.updateSelector(instance);
        })
    });
}

function updateMarker(element, menu, marker){
    const rect = element.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = rect.left - menuRect.left;

    marker.style.width = rect.width + "px";
    marker.style.height = rect.height + "px";
    marker.style.transform = `translate(${left}px)`;

    element.classList.add("marked");
}