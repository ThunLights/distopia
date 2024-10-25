import express from "express";

import { handler } from "./build/handler";

import type { Express } from "express";

class MAIN {
    app: Express;

    constructor() {
        this.app = express();

        this.start()
    }
    start() {
        this.loadPage()
        this.app.listen(3095)
    }
    loadPage() {
        this.app.use(handler)
    }
}
new MAIN()
