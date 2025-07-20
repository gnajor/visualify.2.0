import { apiCom } from "./apiCom/apiCom.js";
import { handleRedirect } from "./logic/handleRedirect.js";
import { getAllTopUserDataAndSetState } from "./logic/utils.js";
import { renderHomePage } from "./pages/homePage/homePage.js";
import { renderStructure } from "./pages/mainPage/structure.js";


export const State = {
    clientId: "aa99b24e94d448eab167b514b89f2de2",
    redirectUri: "http://127.0.0.1:8888/",
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
    currentPage: 0, 

    setStateData(key, timeTerm, data){
        this.userData[key][timeTerm] = data;
    },

    setCurrentPage(pageNum){
        State.currentPage = pageNum;
    }
}

const app = {
    parent: document.querySelector("#wrapper"),

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
    }
}

app.start();