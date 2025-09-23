import { Logo } from "../logo/logo.js";

class Loading{
    constructor(parent){
        this.parent = parent;

        this.bars = {
            height: 200,
            width: 200,
            viewHeight: 200,
            viewWidth: 200
        }
    }

    init(){
        this.renderStructure();
        this.renderBars();

    }

    render(){
        const loadingContainer = document.createElement("div");
        loadingContainer.className = "loading-container";
        parent.appendChild(loadingContainer);

        const loadingBars = document.createElement("div");
        const loadingTitle = document.createElement("div");
        loadingBars.className = "loading-bars";
        loadingTitle.className = "loading-title";
        parent.appendChild(loadingBars);
        parent.appendChild(loadingTitle);

        this.element = loadingContainer; 
    }

    renderBars(){
        const logo = new Logo(this.bars.width, this.bars.height, this.bars.viewHeight, this.viewWidth);
        logo.initRects();
        logo.initAnimation();

        this.loadingBars = logo;
    }

    stop(){
        this.loadingBars.stopAnimation();
    }

    start(){
        this.loadingBars.initAnimation();
    }
}
