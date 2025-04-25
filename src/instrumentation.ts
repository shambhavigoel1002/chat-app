import { setupMonocle } from 'monocle2ai';

export function register() {
    console.log("Registering instrumentation")
    setupMonocle(
        "openai.app"
    )
}
