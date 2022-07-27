import { Router } from 'itty-router';

/*
Function to set the common and necessary headers in order to handle CORS.
*/
const setCommonHeaders = async (resp, origin) => {
    try {
        /*
        In order for Set-Cookie to work, the 'Access-Control-Allow-Credentials' must be set.
        */
        resp.headers.set('Access-Control-Allow-Credentials', true);
        resp.headers.append(
            'Access-Control-Allow-Headers',
            'Set-Cookie, Content-Type'
        );
        resp.headers.set('Access-Control-Allow-Origin', origin || ORIGIN);
        resp.headers.set('Access-Control-Allow-Methods', 'OPTIONS, POST');
        /*
           CORS requires a max age in order to set credentials.
           */
        resp.headers.set('Access-Control-Max-Age', 3600);
    } catch (error) {
        throw error;
    }
};

const handler = async req => {
    try {
        const { method } = req || {};

        const { origin } = Object.fromEntries(req.headers) || {};

        let response = await fetch(req, { withCredentials: true });

        if (response && response.ok) {
            const newResponse = await doToken(response.clone(), origin, method);

            // ADD logic here to be done before returning the response.
            // await setCommonHeaders(newResponse, origin);

            return newResponse;
        }

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Create a new router
const router = Router();

/*
Our index route, a simple hello world.
*/
router.get('/', () => {
    return new Response(
        'Hello, world! This is the root page of your Worker template.'
    );
});

/*
Okta makes an OPTIONS and POST call for /token that both need to be captured so using router.all().
*/
router.all('*', async (req, res) => {
    return await handler(req);
});

/*
This snippet ties our worker to the router we defined above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', e => {
    e.respondWith(router.handle(e.request));
});
