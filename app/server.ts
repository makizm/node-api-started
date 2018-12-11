import Debug from 'debug';
import Express from 'express';
import BodyParser from 'body-parser';
import { default as Https, ServerOptions } from 'https';
import jwt from 'express-jwt';
import { ENV } from './global';

// Import handlers
import { WelcomeHandler, SamlHandler } from './handlers';

// Create a new express application instance
const app: Express.Application = Express();

// The port the express app will listen on
const port = process.env.PORT || 3000;

// Setup debug using app namespace
const debug = Debug(ENV.appName + ':server');

const httpsOptions: ServerOptions = {
    key: ENV.expressRsaKey,
    cert: ENV.expressSslCert,
}

// parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(BodyParser.json());

app.use(jwt({ secret: ENV.sso.jwt.signPublicKey }).unless({
    // all pages will requre authentication token
    // except ones listed below
    path: [
        '/sso/saml',
        '/sso/saml/auth',
        '/sso/saml/logout',
        '/sso/saml/metadata'
    ]
}));

// Add handlers below that will use
// default error handler
app.use('/hello', WelcomeHandler);
app.use('/sso/saml', SamlHandler);

// default error handler
app.use((err: any, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const clientIp = req.headers['x-forwarded-for'];

    debug('Request failed from %s to path %s $o', clientIp, req.path, err);

    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err.inner);
    } else {
        next(err);
    }
})

// Add handlers below that will not use
// default error handler and leverage their own

// Start express web server using Https
// create https server instance
const httpsServer = Https.createServer(httpsOptions, app)

// start https server
httpsServer.listen(port, () => {
    debug('Express server listening on port %s', port);
})
