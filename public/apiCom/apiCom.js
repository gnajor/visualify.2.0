export async function apiCom(action, data){
    const options = {};

    switch(action){
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

        case "song:get-features": {
            options.method = "POST";
            options.body = data;
            const resource = await fetcher("/api/song-features", options, true);
            return resource; 
        }

        case "token-name:authorization": {
    /*         options.method = "GET";
            const resource = await fetcher(`../../api/user/?token=${encrypt(data.token)}&name=${encrypt(data.name)}`, options);
            return resource; */
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