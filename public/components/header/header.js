import { Logo } from "../logo/logo.js";
import { renderNav } from "./nav/nav.js";
import { Selector } from "./selector/selector.js";

export function renderHeader(parent, pageDoms, specPage){
    parent.innerHTML = `<div id="logo"></div>
                        <nav></nav>
                        <div id="selector-container"></div>`;

    const logoParent = parent.querySelector("#logo");
    const navContainer = parent.querySelector("nav");
    const selectContainer = parent.querySelector("#selector-container");

    const width = "10rem";
    const height = "100%";
    const logo = new Logo(logoParent, width, height);
    renderNav(navContainer);

    selectContainer.style.width = width;
    selectContainer.style.height = height;    

    pageDoms.forEach((page, i) => {
        const selector = new Selector(selectContainer, page.id, i);
        if(i === 0) selector.element.classList.add("current");

        if(page.id === specPage){
            selector.renderItemsShortRange();
        }
        else{
            selector.renderItemsLongRange();
        }
    });
}
