import { updateCurrentMainPage, updateSummaryPagePos } from "../../../pages/mainPage/structure.js";

export function renderNav(parent){
    parent.innerHTML = `<div id="nav-items">
                            <div class="nav-item">Most Played</div>
                            <div class="nav-item">Decades</div>
                            <div class="nav-item">Genres</div>
                            <div class="nav-item">Moods</div>
                            <div class="nav-item">Map</div>
                        </div>
                        <div id="dashboard-nav-item">
                            <img id="white" src="../../../media/icons/dashboard.svg">
                            <img class="invisible" id="black" src="../../../media/icons/dashboard_black.svg">
                        </div>
                        <div id="marker"></div>`;
    
    const navItems = parent.querySelectorAll(".nav-item");
    const dashboardItem = parent.querySelector("#dashboard-nav-item"); 
    const marker = document.querySelector("header nav #marker");

    let currentPageId = 0;

    navItems[0].classList.add("marked");
    updateNavMarker();
    navItems.forEach((element, i) => {
        element.id = i;
        element.addEventListener("click", () => {
            currentPageId = i;
            navItems.forEach(element => element.classList.remove("marked"));
            element.classList.add("marked");
            updateNavMarker();
            updateCurrentMainPage(`${- currentPageId * 100}vw`, 0, currentPageId);
            dashboardIconChange("remove");
            updateSummaryPagePos(`${currentPageId * 100}vw`);
            marker.classList.remove("invisible");
        })
    });

    dashboardItem.addEventListener("click", () => {
        dashboardIconChange("add");
        updateCurrentMainPage(`${-currentPageId * 100}vw`, 0, currentPageId);

        if(document.querySelector("header nav .nav-item.marked")){
            updateCurrentMainPage(`${-currentPageId * 100}vw`, "100vh", currentPageId);
            document.querySelector("header nav .nav-item.marked").classList.remove("marked");

            const marker = document.querySelector("header nav #marker");
            marker.classList.add("invisible"); 
        }
    });

    function dashboardIconChange(type){
        const blackIcon = dashboardItem.querySelector("img#black");
        const whiteIcon = dashboardItem.querySelector("img#white");

        if(type === "remove"){
            blackIcon.classList.add("invisible");
            whiteIcon.classList.remove("invisible");
            dashboardItem.classList.remove("marked");
            
        }
        else{
            blackIcon.classList.remove("invisible");
            whiteIcon.classList.add("invisible");
            dashboardItem.classList.add("marked");
        }
    }
}

export function updateNavMarker(){
    const markedElement = document.querySelector("header nav .nav-item.marked");
    const menu = document.querySelector("header nav #nav-items");
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