/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CALENDAR_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
    interface Window {
      gapi: {
        load: (api: string, callback: () => void) => void;
        auth2: {
          getAuthInstance: () => {
            isSignedIn: {
              listen: (callback: (isSignedIn: boolean) => void) => void;
              get: () => boolean;
            };
            signIn: () => Promise<void>;
            signOut: () => Promise<void>;
          };
        };
        client: {
          init: (config: {
            apiKey: string;
            clientId: string;
            scope: string;
            discoveryDocs: string[];
          }) => Promise<void>;
          calendar: {
            events: {
              list: (params: any) => Promise<any>;
              insert: (params: any) => Promise<any>;
            };
          };
        };
      };
    }
  }
  
  export {};