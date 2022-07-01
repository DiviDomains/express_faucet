import express, {Application, Request, Response} from 'express';
import * as superagent from "superagent";

const app: Application = express();
import cors from 'cors';

const API_URL = process.env.API_URL || 'http://127.0.0.1:51475';
const PORT = process.env.PORT || 3001;

const router = express.Router();

const allowedOrigins = ['http://localhost:3000', 'https://faucet.divi.domains']

const options: cors.CorsOptions = {
    origin: allowedOrigins
};

app.use(cors(options));

router.get('/', (req: Request, res: Response): void => {
    res.status(200).send({
        status: 'OK',
        time: Number(new Date()),
    });
});

router.get('/supply', (req: Request, res: Response): void => {
        superagent
            .post(`${API_URL}`)
            .set('Content-Type', 'application/json')
            .send({
                id: 'faucet',
                jsonrpc: '2.0',
                method: 'getwalletinfo',
                params: []
            })
            .end((err, reply) => {
                if (err) {
                    console.log(err)
                    res.status(500).send(err);
                } else {
                    const balance = [reply.body.result.balance]
                    res.status(200).send({balance});
                }
            });
    }
);

router.get('/blocks', (req: Request, res: Response): void => {
        superagent
            .post(`${API_URL}`)
            .set('Content-Type', 'application/json')
            .send({
                id: 'faucet',
                jsonrpc: '2.0',
                method: 'getblockcount',
                params: []
            })
            .end((err, reply) => {
                if (err) {
                    console.log(err)
                    res.status(500).send(err);
                } else {
                    const result = [reply.body.result]
                    res.status(200).send({result});
                }
            });
    }
);

router.get('/print', (req: Request, res: Response): void => {
        if (req.query.address && req.query.amount) {
            if (req.query.address.length === 0) {
                res.status(400).send({error: 'Please provide a valid address'});
            } else if (parseInt(req.query.amount as string) <= 0) {
                res.status(400).send({error: 'Please provide a valid amount'});
            } else if (parseInt(req.query.amount as string) > 100) {
                res.status(400).send({error: 'Please provide an amount under 100'});
            } else {
                const address = req.query.address
                const amount = req.query.amount
                superagent
                    .post(`${API_URL}`)
                    .set('Content-Type', 'application/json')
                    .send({
                        id: 'faucet',
                        jsonrpc: '2.0',
                        method: 'sendtoaddress',
                        params: [address, +amount],
                    })
                    .end((err, reply) => {
                        if (err) {
                            console.log(err)
                            res.status(500).send(err);
                        } else {
                            const result = [reply.body.result]
                            res.status(200).send({result});
                        }
                    });
            }
        }
    }
);

app.use(router)

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});