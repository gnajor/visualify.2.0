export async function apiCom(action, data){
    const options = {};

    switch(action){
        case "server:get-country-data": {
            options.method = "POST";
            options.body = data;

            const resource = await fetcher("/api/get-country-data", options);
            return resource;
        }

        case "server:get-mood-data": {
            options.method = "POST";
            options.body = data;

            const resource = await fetcher("/api/get-mood-data", options);
            return resource;
        }

        case "server:set-country-data": {
            options.method = "POST";
            options.body = data;

            const resource = await fetcher("/api/set-country-data", options);
            return resource;
        }

        case "server:set-mood-data": {
            options.method = "POST";
            options.body = data;

            const resource = await fetcher("/api/set-mood-data", options);
            return resource;
        }

        case "server:set-data": {
            options.method = "POST";
            options.body = data;
            const resource = await fetcher("/api/set-server-data", options);
            return resource;
        }

        case "token:auth": {
            options.method = "GET";
            const resource = await fetcher("/api/check-token-auth", options, true);
            return resource;
        }

        case "data:get-top-user-data": {
            options.method = "GET";
            const query = new URLSearchParams({
                type: data.type,
                range: data.range,
                offset: data.offset
            });

            const resource = await fetcher(`/api/top-items?${query}`, options);
            return resource;
        }

        case "song:get-country": {
            options.method = "POST";
            options.body = data;
            const resource = await fetcher("/api/song-country", options, true);
            return resource; 
        }

        case "songs:get-features": {
            options.method = "POST";
            options.body = data;
            const resource = await fetcher("/api/songs-features", options, true);
            return resource; 
        }

        case "user:patch-new-image": {
   /*          options.method = "PATCH";
            options.body = {
                userId: encrypt(data.id),
                imgSrc: encrypt(data.img),
            }
            const resource = await fetcher(`../../api/user`, options);
            return resource */
        }

        case "user:logout": {
            options.method = "POST";
            options.body = {};
            const resource = await fetcher("/api/logout", options);
            return resource;
        }

        default: {
            console.warn("Unknown action: " + action);
            return null;
        }
    }
}

async function fetcher(url, options, status = null){
    try{
        const fetchOptions = {
            method: options.method,
            headers: {"content-type": "application/json"},
        };

        if(fetchOptions.method !== "GET" && options.body){
            fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);

        if(!response.ok){
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        };

        const resource = await response.json();
        
        if(status){
            return {
                resource,
                ok: response.ok
            }
        }
        return resource;
    }
    catch(error){
        console.error(error);
        return false;
    }
}