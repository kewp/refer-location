import { Application, route, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import {
    IP2Location,
    IPTools,
} from "https://deno.land/x/ip2location@8.2.0/mod.ts";

const app = new Application();
const router = new Router();
const ip2location = new IP2Location();

ip2location.open("./IP2LOCATION-LITE-DB3.BIN");

let _log:string[] = [];

function log(message: string) {
    _log.push(message);
    console.log(message);
}

async function readRow(file: Deno.FsFile, readBytes: number, position: number) {
    const cursorPosition = await file.seek(position-1, Deno.SeekMode.Start);
    log(`cursorPosition: ${cursorPosition}`);
    const buf = new Uint8Array(readBytes);
    const bytesRead = file.readSync(buf);
    log(`bytesRead: ${bytesRead}`);
    return buf;
}

function read32Row(position: number, buffer: Uint8Array) {
    const dataView = new DataView(buffer.buffer);

    const var1 = dataView.getUint32(position, true);
    log(`var1: ${var1}`);
    return var1;
}

router.get("/test", async (ctx) => {

    _log = [];

    const fd = await Deno.open("./IP2LOCATION-LITE-DB3.BIN", { read: true });
    const len = 64; // 64-byte header
    const row = await readRow(fd, len, 1);
    const dbCount = read32Row(5, row);
    log(`dbCount: ${dbCount}`);
    const indexBaseAddress = read32Row(21, row);
    log(`indexBaseAddress: ${indexBaseAddress}`);
    const row2 = await readRow(fd, 524288, indexBaseAddress);
    log(
        `read32Row result for position 524284 is ${read32Row(524284, row2)}`,
    );

    ctx.response.body = _log.join("\n");
});

router.get("/", (ctx) => {
    const ip = ctx.request.ip;
    const geo = ip2location.getAll(ip);

    ctx.response.body = {
        ip,
        country: geo.country_long,
        city: geo.city,
        region: geo.region,
    };
});

app.use(oakCors());
app.use(router.routes());

app.listen({ port: 8000 });
