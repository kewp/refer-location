#!/bin/bash

deno run -A --watch --unstable-kv --unstable-cron --lock=deno.lock --lock-write server.ts