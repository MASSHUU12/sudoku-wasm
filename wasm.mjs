export class Wasm {
    moduleName;
    exports = null;
    memory = null;
    instance = null;
    static decoder = new TextDecoder("utf-8");
    constructor(moduleName) {
        this.moduleName = moduleName;
    }
    async init() {
        const response = await fetch(this.moduleName);
        const { instance } = await WebAssembly.instantiateStreaming(response, this.createImports());
        this.instance = instance;
        this.exports = this.instance.exports;
        this.memory = this.exports.memory;
    }
    createImports() {
        return {
            env: {
                console_log: (ptr, len) => this.log(ptr, len, "log"),
                console_info: (ptr, len) => this.log(ptr, len, "info"),
                console_error: (ptr, len) => this.log(ptr, len, "error"),
                console_warn: (ptr, len) => this.log(ptr, len, "warn"),
            },
        };
    }
    log(ptr, len, type) {
        const message = this.getString(ptr, len);
        if (message !== null) {
            console[type](message);
        }
        else {
            console[type]("Failed to decode string from WebAssembly memory");
        }
    }
    getString(ptr, len) {
        if (!this.memory) {
            console.error("Memory is not initialized");
            return null;
        }
        return Wasm.decoder.decode(new Uint8Array(this.memory.buffer, ptr, len));
    }
}
//# sourceMappingURL=wasm.mjs.map