import { serveDir} from "jsr:@std/http/file-server";

export function serverRequests(request: Request){
    const pathname = new URL(request.url).pathname;

    return serveDir(request, {
        fsRoot: "public",
        urlRoot: ""
    });
}

Deno.serve(serverRequests);