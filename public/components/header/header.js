import { Logo } from "../logo/logo.js";
import { renderNav } from "./nav/nav.js";
import { Selector } from "./selector/selector.js";
import { Switch } from "./switch/switch.js";

export function renderHeader(parent, pageDoms){
    parent.innerHTML = `<div id="logo"></div>
                        <nav></nav>
                        <div id="properties-container">
                            <div id="switch-container"></div>
                            <div id="selector-container"></div>
                        </div>`;

    const logoParent = parent.querySelector("#logo");
    const navContainer = parent.querySelector("nav");
    const selectContainer = parent.querySelector("#selector-container");
    const switchContainer = parent.querySelector("#switch-container");
    const propertiesContainer = parent.querySelector("#properties-container");

    const width = "10rem";
    const height = "100%";
    const logo = new Logo(logoParent, width, height, 80, 350);
    logo.initLogo();
    renderNav(navContainer);

    propertiesContainer.style.width = width;
    propertiesContainer.style.height = height;

    pageDoms.forEach((page, i) => {
        const selector = new Selector(selectContainer, page.id, i);
        let switchCounter = 0;
        
        if(page.className === "switch-button-needed"){
            const switchInstance = new Switch(switchContainer, page.id, i);  
            
            if(switchCounter === 0){
                switchCounter++;
                switchInstance.element.classList.add("current");
            }
        } 

        if(i === 0){
            selector.element.classList.add("current");
        }

        selector.renderItemsLongRange();
    });
}
