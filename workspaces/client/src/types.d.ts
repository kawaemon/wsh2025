declare module '*.png' {
  const value: string;
  export = value;
}

declare module '*?raw' {
  const value: string;
  export = value;
}
declare module '*?url' {
  const value: string;
  export = value;
}

declare module '*?arraybuffer' {
  const value: ArrayBuffer;
  export = value;
}

declare module 'virtual:uno.css' {}
