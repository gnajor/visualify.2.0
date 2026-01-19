function renderSummaryPage(parent, dataset){
    parent.innerHTML = `<div id="summary-box-container">
                            <div class="outer-box" id="outer-box-left"></div>
                            <div class="outer-box" id="outer-box-center"></div>
                            <div class="outer-box" id="outer-box-right"></div>
                        </div>`;

    const outerBoxLeft = parent.querySelector("#outer-box-left");
    const outerBoxCenter = parent.querySelector("#outer-box-center");
    const outerBoxRight = parent.querySelector("#outer-box-right");   
}

function renderOuterBoxRight(parent){
    parent.innerHTML = `<div id="top-container">
                            <div id="devloper-logout-container">
                                <div id="developer-box"></div>
                                <div id="logout-box"></div>
                            </div>
                            <div id="avg-song-pop-box"></div>
                        </div>
                        <div id="most-listened-country"></div>`;
}

function renderOuterBoxCenter(parent){
    parent.innerHTML = `<div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>`;

}

function renderOuterBoxLeft(){

}