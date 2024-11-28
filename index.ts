import express from "express";

import { handler } from "./build/handler.js";

import type { Express } from "express";

class MAIN {
    app: Express;

    constructor() {
        this.app = express();

        this.start()
    }
    start() {
        this.loadPage()
        this.app.listen(3095, "0.0.0.0")
    }
    loadPage() {
        this.app.use(handler)
    }
}
new MAIN()
