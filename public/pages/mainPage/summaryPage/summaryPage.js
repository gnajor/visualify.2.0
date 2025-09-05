function renderSummaryPage(parent, dataset){
    parent.innerHTML = `<div id="summary-box-container">
                            <div class="outer-box" id="outer-box-1"></div>
                            <div class="outer-box" id="outer-box-2"></div>
                            <div class="outer-box" id="outer-box-3"></div>
                        </div>`;

    const outerBoxOne = parent.querySelector("#outer-box-1");
    const outerBoxTwo = parent.querySelector("#outer-box-2");
    const outerBoxThree = parent.querySelector("#outer-box-3");   
}

function renderInnerBoxes(parent, data, type){
    parent.innerHTML = ``


    switch(type){
        case "svgImg": {
            break;
        }

        case "svgGraph": {
            break;
        }
    }
}