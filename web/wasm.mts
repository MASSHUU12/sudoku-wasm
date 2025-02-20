export class Wasm<T extends WebAssembly.Exports> {
  public exports: T | null = null;
  public memory: WebAssembly.Memory | null = null;

  private instance: WebAssembly.Instance | null = null;
  private static readonly decoder = new TextDecoder("utf-8");

  constructor(private readonly moduleName: string) {}

  public async init(): Promise<void> {
    const response = await fetch(this.moduleName);
    const { instance } = await WebAssembly.instantiateStreaming(
      response,
      this.createImports(),
    );

    this.instance = instance;
    this.exports = this.instance.exports as T;
    this.memory = this.exports.memory as WebAssembly.Memory;
  }

  private createImports(): WebAssembly.Imports {
    return {
      env: {
        console_log: (ptr: number, len: number): void =>
          this.log(ptr, len, "log"),
        console_info: (ptr: number, len: number): void =>
          this.log(ptr, len, "info"),
        console_error: (ptr: number, len: number): void =>
          this.log(ptr, len, "error"),
        console_warn: (ptr: number, len: number): void =>
          this.log(ptr, len, "warn"),
      },
    };
  }

  private log(
    ptr: number,
    len: number,
    type: "log" | "info" | "error" | "warn",
  ): void {
    const message = this.getString(ptr, len);
    if (message !== null) {
      console[type](message);
    } else {
      console[type]("Failed to decode string from WebAssembly memory");
    }
  }

  private getString(ptr: number, len: number): string | null {
    if (!this.memory) {
      console.error("Memory is not initialized");
      return null;
    }

    return Wasm.decoder.decode(new Uint8Array(this.memory.buffer, ptr, len));
  }
}
