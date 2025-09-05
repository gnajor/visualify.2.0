import { serveDir, serveFile} from "jsr:@std/http/file-server";
import { extname } from "jsr:@std/path/extname";
import { handleRequests } from "../api/handleRequests.ts";

export function serverRequests(request: Request){
    const pathname = new URL(request.url).pathname;

    if(pathname.startsWith("/api/")){
        return handleRequests(request);
    }

    if(pathname === "/" || !extname(pathname)){
        return serveFile(request, Deno.cwd() + "/public/index.html");
    }

    return serveDir(request, {
        fsRoot: "public",
        urlRoot: ""
    });
}

Deno.serve({ port: 8888 /* hostname: "127.0.0.1" */ }, serverRequests);