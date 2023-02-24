import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { COGNITO_USER_POOL_ID, COGNITO_REGION } from '@server/config';
import { Logger } from '@server/lib/logger';

export class CognitoService {
  private tokenExpiration: number;
  private iss: string;
  private pems: { [key: string]: string };
  private logger;

  constructor() {
    this.tokenExpiration = 3600000;
    this.iss = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
    this.pems = {};
    this.logger = Logger;
  }

  private async init() {
    try {
      const response: any = await axios.get(`${this.iss}/.well-known/jwks.json`);
      const data = await response.data;
      const keys = data?.keys;
      if (keys) {
        keys.forEach((key: any) => {
          const keyId = key.kid;
          const modulus = key.n;
          const exponent = key.e;
          const keyType = key.kty;
          const jwk = {
            kty: keyType,
            n: modulus,
            e: exponent
          };
          const pem = jwkToPem(jwk);
          this.pems[keyId] = pem;
        });
        return true;
      }
    } catch (err: any) {
      this.logger.error('CognitoService::init error: %o', err);
      return null;
    }
  }

  public async validateAccessToken(token: string) {
    const isInitialized = await this.init();

    if (!isInitialized) {
      return null;
    }

    try {
      const decodedJwt: any = jwt.decode(token, {
        complete: true
      });

      if (!decodedJwt) throw new TypeError('Invalid JWT token');

      if (decodedJwt.payload.iss !== this.iss)
        throw new TypeError('Token is not from this user pool');

      if (decodedJwt.payload.token_use !== 'access') throw new TypeError('Not an access token');

      const kid = decodedJwt.header.kid;
      const pem = this.pems[kid];

      if (!pem) throw new TypeError('Invalid access token');

      const result = jwt.verify(token, pem, {
        issuer: this.iss,
        maxAge: this.tokenExpiration
      });
      return result;
    } catch (error: any) {
      this.logger.error(`CognitoService::validateAccessToken error: ${error.message}`);
      return null;
    }
  }
}
