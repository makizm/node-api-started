import { Router, Request, Response } from 'express';

// Assign router to the express.Router() instance
const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    res.send('Hello, World!');
});

router.get('/:name', (req: Request, res: Response) => {
    // Extract the name from the request parameters
    let { name } = req.params;

    // Send respond back to the client
    res.send(`Hello, ${name}`);
});

export const WelcomeHandler: Router = router;
