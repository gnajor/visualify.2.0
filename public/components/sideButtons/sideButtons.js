import {apiCom} from "../../apiCom/apiCom.js";

export function renderSideButtons(parent){
    parent.innerHTML = `<div id="info-icon-container" class="circle-box">
                            <img alt="information icon" src="../../media/icons/info.svg">
                        </div>
                        <div id="edit-icon-container" class="circle-box">
                            <img alt="edit icon" src="../../media/icons/edit.svg">
                        </div>
                        <div id="logout-icon-container" class="circle-box">
                            <img alt="loguout icon" src="../../media/icons/logout.svg">
                        </div>`;

    const infoIconContainer = parent.querySelector("#info-icon-container");
    const editIconContainer = parent.querySelector("#edit-icon-container");
    const logoutIconContainer = parent.querySelector("#logout-icon-container");

    infoIconContainer.addEventListener("click", () => {
        
    });

    editIconContainer.addEventListener("click", () => {

    });

    logoutIconContainer.addEventListener("click", async () => {
        await apiCom("user:logout", null);
        location.reload(); //fire an event
    });
}