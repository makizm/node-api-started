/**
 * IDP = Login provider
 * SP = This server
 * 
 * IDP Configuration 
 * 
 * 1. Must sign response
 * 2. Must include Assertion Signature in response
 * <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
 *   <ds:KeyInfo>
 *     <ds:X509Data>
 *       <ds:X509Certificate>
 *         MII..
 *       </ds:X509Certificate>
 *     </ds:X509Data>
 *   </ds:KeyInfo>
 * </ds:Signature>
 * 3. Set SP signing certificate for validating requests sinature
*/

import Debug from 'debug';
import { Router, Request, Response } from 'express';
import { IdentityProvider, ServiceProvider } from 'samlify';

import { ENV } from '../global';
import { JwtIssuer } from '../jwt';

// Setup debug
const debug = Debug(ENV.appName + ':handler:saml');

// Assign router to the express.Router() instance
const router = Router();

const jwt = JwtIssuer();

const sp = ServiceProvider({
    privateKey: ENV.sso.saml.spSignPrivateKey,
    metadata: ENV.sso.saml.spMetadataFile,
})

const idp = IdentityProvider({
    metadata: ENV.sso.saml.idpMetadataFile,
})

router.get('/metadata', (_, res) => {
    res.header('Content-Type','text/xml').send(sp.getMetadata());
})

// send saml authentication request to IDP
router.get('/auth', (_, res) => {
    const { id, context } = sp.createLoginRequest(idp, 'redirect');
    return res.redirect(context);
})

// Logout is not supported
router.post('/logout', (_, res) => {
    res.sendStatus(403);
})

// Process IDP response
router.post('/', (req: Request, res: Response) => {
    const url = ENV.sso.saml.appRedirectUrl;
    // remove trailing slash
    const sanitizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    sp.parseLoginResponse(idp, 'post', req)
        .then(result => {
            debug(result);

            jwt.issue(result, (token, error) => {
                if (error) {
                    debug('JWT Issue failed with $o', error);
                    const msg = error.message;
                    res.redirect(`${sanitizedUrl}?failed=${msg}`);
                } else {
                    res.redirect(`${sanitizedUrl}?success=${token}`);
                }
            });
        })
        .catch(err => {
            debug('Auth failed %o', err);

            res.redirect(`${sanitizedUrl}?failed=1`);
        })
})

export const SamlHandler: Router = router;
