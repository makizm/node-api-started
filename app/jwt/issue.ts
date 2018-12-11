import jwt from 'jsonwebtoken';
import { ENV } from '../global';
import { FlowResult } from 'samlify/src/flow';
import { has, get, toArray } from 'lodash';

export interface JwtPayload {
    sub: string;
    aud: string;
    iss: string;
    first_name: string;
    last_name: string;
    user_disabled: boolean;
    user_groups: any[]
}

export default function() {
    return new JwtIssuer();
}

export class JwtIssuer {
    private options: jwt.SignOptions;
    private cert: string;

    constructor() {
        this.options = {
            algorithm: 'RS256',
            expiresIn: ENV.sso.jwt.expiresIn,
        }

        this.cert = ENV.sso.jwt.signPrivateKey
    }

    issue(result: FlowResult, callback?: (token: string, error: Error|null) => void) {
        if (callback) {
            try {
                const token = jwt.sign(this.createJwtPayload(result), this.cert, this.options);

                return callback(token, null);
            } catch (error) {
                return callback('', error);
            }
        } else {
            return jwt.sign(this.createJwtPayload(result), this.cert, this.options);
        }
    }

    private createJwtPayload(result: FlowResult): JwtPayload {
        const extract = result.extract;

        if(extract === '') {
            throw new Error('INVALID_SAML_RESULT_NULL_EXTRACT');
        }

        // define required key names
        const requiredKeys = [
            'statusCode',
            'audience',
            'issuer',
            'nameID',
            'attributes.first_name',
            'attributes.last_name',
            'attributes.user_disabled',
            'attributes.user_groups',
        ]

        // validate result
        requiredKeys.forEach(key => {
            if (!has(extract, key)) {
                throw new Error('INVALID_SAML_RESULT')
            }
        })

        // statusCode must be success
        if (get(extract, 'statusCode') !== 'urn:oasis:names:tc:SAML:2.0:status:Success') {
            throw new Error('INVALID_SAML_RESULT_BAD_STATUS');
        }

        const disabled = get(extract, 'attributes.user_disabled');

        const groups = toArray(get(extract, 'attributes.user_groups'))

        return {
            sub: get(extract, 'nameID'),
            aud: get(extract, 'audience'),
            iss: get(extract, 'issuer'),
            first_name: get(extract, 'attributes.first_name'),
            last_name: get(extract, 'attributes.last_name'),
            user_disabled: (disabled === 'true' || disabled === true) ? true : false,
            user_groups: groups
        }
    }
}
