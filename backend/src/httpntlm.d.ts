declare module 'httpntlm' {
  export function post(options: any, callback: (err: any, res: any) => void): void;
  export function get(options: any, callback: (err: any, res: any) => void): void;
  export function put(options: any, callback: (err: any, res: any) => void): void;
  export function patch(options: any, callback: (err: any, res: any) => void): void;
  export function method(method: string, options: any, callback: (err: any, res: any) => void): void;
}
