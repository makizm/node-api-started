import { readFileSync } from 'fs';

export const ENV = {
    // server running directory
    // use __dirname if not sure
    homeDir: __dirname,
    appName: 'node-api-starter',
    // ssl certificate and key for https
    // 
    expressSslCert: readFileSync(__dirname + '/static/express-ssl-cert.pem', 'utf8'),
    expressRsaKey: readFileSync(__dirname + '/static/express-rsa-key.pem', 'utf8'),
    // client app custom error page url
    // server will attach url query of ?error=number&message=string
    // ex: https://localhost:3000/#/error?error=404&message=Page+not+found
    clientErrorPageUrl: 'https://localhost:3000/#/error',
    // Single Sign-on configuration
    sso: {
        jwt: {
            expiresIn: '1h',
            signPrivateKey: readFileSync(__dirname + '/static/sso/jwt_sign_key.pem', 'utf8'),
            signPrivateKeyPass: '',
            signPublicKey: readFileSync(__dirname + '/static/sso/jwt_sign_key_pub.pem', 'utf8'),
        },
        saml: {
            appRedirectUrl: 'https://localhost:3000/#/login',
            spMetadataFile: readFileSync(__dirname + '/static/sso/saml_sp_metadata.xml', 'utf8'),
            spSignPrivateKey: readFileSync(__dirname + '/static/sso/saml_sp_sign_key.pem', 'utf8'),
            spSignPrivateKeyPass: '',
            idpMetadataFile: readFileSync(__dirname + '/static/sso/saml_idp_metadata.xml', 'utf8'),
        }
    }
}
