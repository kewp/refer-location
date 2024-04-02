import { Application, route, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { IP2Location, IPTools } from "https://deno.land/x/ip2location@8.2.0/mod.ts";

const app = new Application();
const router = new Router();
const ip2location = new IP2Location();

ip2location.open("./IP2LOCATION-LITE-DB3.BIN");

router.get('/', ctx => {

    const ip = ctx.request.ip;
    const geo = ip2location.getAll(ip);

    ctx.response.body = {
        ip,
        country: geo.country_long,
        city: geo.city,
        region: geo.region
    };
})

app.use(oakCors());
app.use(router.routes());

app.listen({ port: 8000 });