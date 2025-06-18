import { Logo } from "../../components/logo/logo.js";

export function renderHomePage(parent){
    parent.innerHTML = `<div id="home-page">
                            <div id="circle-box">
                                <div id="circle-one" class="circle"></div>
                                <div id="circle-two" class="circle"></div>
                                <div id="circle-three" class="circle"></div>
                                <div id="circle-four" class="circle"></div>
                                <div id="circle-five" class="circle"></div>
                            </div>
                            <div id="logo"></div>
                            <button id="login">
                                <img src="media/icons/spotify-logo.svg" alt="spotify logo">
                                <span>Login with Spotify</span>    
                            </button>
                        </div>`;

    const loginButton = parent.querySelector("button#login");
    const logoContainer = parent.querySelector("#logo");
    const logo = new Logo(logoContainer, 500, 100);

    loginButton.addEventListener("click", () => {
        //redirect
    });
}