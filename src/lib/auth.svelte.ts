import { structChecker } from "./struct";
import { _ResponseZod } from "$lib/types/auth/index";

export async function token2data() {
    try {
        const token = sessionStorage.getItem("token");
        if (token) {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    Authorization: token,
                }
            })
            if (response.ok) {
                const json = structChecker(await response.json(), _ResponseZod);
                if (json && json.content) {
                    if (typeof json.content === "string") {
                        console.log(`Error: ${json.content}`);
                    } else {
                        return json.content;
                    }
                }
            }
        }
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}
