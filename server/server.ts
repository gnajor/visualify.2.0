import { serveDir} from "jsr:@std/http/file-server";
import { handleRequests } from "../api/handleRequests.ts";

export function serverRequests(request: Request){
    const pathname = new URL(request.url).pathname;

    console.log(pathname)

    if(pathname.startsWith("/api/")){
        return handleRequests(request);
    }

    return serveDir(request, {
        fsRoot: "public",
        urlRoot: ""
    });
}

Deno.serve({ port: 8888, hostname: "127.0.0.1" }, serverRequests);