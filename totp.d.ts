import { FastifyPluginCallback, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    totp: totp.TOTP;
  }

  interface FastifyRequest {
    totpVerify(options?: totp.Options): void;
  }
}

type TotpPlugin = FastifyPluginCallback<totp.TOTP["options"]>;

declare namespace totp {
  export interface Options {
    /** Encoding - Default: 'ascii' */
    encoding?: string;
    /** Algorithm - Default: 'sha512' */
    algorithm?: string;
    /** Step - Default: 30 */
    step?: number;
    /** Label - Default: "Fastify" */
    label?: string;
    /** Window - Default: 1 */
    window?: number;
  }
  export interface TOTP {
    options: {
      /** The length of the generated secret. Default: 20 */
      secretLength?: number;
      /** The label to show in third-party authenticators. Usually the app name. Default: "Fastify" */
      totpLabel?: string;
      /** The allowable previous or future "time-windows" to check against of. Default: 1  */
      totpWindow?: number;
      /** The algorithm to use for hash generation. Default: "sha512"  */
      totpAlg?: string;
      /** Time step in seconds. Default: 30 */
      totpStep?: number;
    };

    /** Generate a new secret with the provided length (or use default one otherwise)    */
    generateSecret(length: number): string;
    /** Generate a TOTP token based on given options. **/
    generateToken(options: unknown): string;
    /** Generate an auth URL* that can be used to configure a third-party authenticator. */
    generateAuthURL(options: unknown): string;
    /** Genereate a data-URI of a QRCode to share the auth URL. */
    generateQRCode(options: unknown): Promise<string>;
    /** Verify a TOTP token with the original secret. */
    verify(options: unknown): boolean;
  }

  export const totpPlugin: TotpPlugin;
  export { totpPlugin as default };
}

declare function totpPlugin(
  ...params: Parameters<TotpPlugin>
): ReturnType<TotpPlugin>;
export = totpPlugin;
