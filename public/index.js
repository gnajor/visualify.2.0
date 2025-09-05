import { apiCom } from "./apiCom/apiCom.js";
import { updateNavMarker } from "./components/header/nav/nav.js";
import { Switch } from "./components/header/switch/switch.js";
import { handleRedirect } from "./logic/handleRedirect.js";
import { getAllTopUserDataAndSetState } from "./logic/utils.js";
import { renderHomePage } from "./pages/homePage/homePage.js";
import { updateArtistDivPosition } from "./pages/mainPage/decadesPage/decadesPage.js";
import { renderStructure } from "./pages/mainPage/structure.js";


export const State = {
    clientId: "aa99b24e94d448eab167b514b89f2de2",
    redirectUri: "https://visualify.deno.dev/",/* "http://127.0.0.1:8888/" */
    userData: {
        artists:{
            short_term: null,
            medium_term: null,
            long_term: null
        },
        tracks:{
            short_term: null,
            medium_term: null,
            long_term: null
        }
    },
    overlayData: {
        short_term: {
            avgTrackPopularity: null,
            avgArtistPopularity: null,
            mostListenedGenre: null,
            mostListenedDecade: null,
            mostListenedCountry: {
                svg: null,
                name: null,
            },
            mostListenedTrack: {
                image: null,
                name: null,
            },
            mostListenedArtist: {
                image: null,
                name: null,
            }
        },
        medium_term: {
            avgTrackPopularity: null,
            avgArtistPopularity: null,
            mostListenedGenre: null,
            mostListenedDecade: null,
            mostListenedCountry: {
                svg: null,
                name: null,
            },
            mostListenedTrack: {
                image: null,
                name: null,
            },
            mostListenedArtist: {
                image: null,
                name: null,
            }
        },
        long_term: {
            avgTrackPopularity: null,
            avgArtistPopularity: null,
            mostListenedGenre: null,
            mostListenedDecade: null,
            mostListenedCountry: {
                svg: null,
                name: null,
            },
            mostListenedTrack: {
                image: null,
                name: null,
            },
            mostListenedArtist: {
                image: null,
                name: null,
            }
        }
    },

    setStateData(key, timeTerm, data){
        this.userData[key][timeTerm] = data;
    },

    setStateOverlayData(key, timeTerm, data){
        this.overlayData[timeTerm][key] = data; 
    }
}

const app = {
    parent: document.querySelector("#wrapper"),
    resizeTimer: undefined,

    async start(){
        const isTokenCorrect = await apiCom("token:auth");

        if(!isTokenCorrect.ok){
            const handled = await handleRedirect();
            renderHomePage(this.parent);   
        }
        else{
            await getAllTopUserDataAndSetState();
            renderStructure(this.parent);
        }
    },

    onResizeWindow(){
        document.body.classList.add("no-transition");
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            document.body.classList.remove("no-transition");
        }, 200);

        Switch.updateSwitchMarker();
        updateNavMarker();
        updateArtistDivPosition();
    }
}

window.onresize = app.onResizeWindow;
app.start();