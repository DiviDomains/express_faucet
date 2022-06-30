import express, { Application, Request, Response } from 'express';
import * as superagent from "superagent";

const app: Application = express();

const API_URL = process.env.API_URL || 'http://127.0.0.1:51475';
const PORT = process.env.PORT || 3001;

app.use('/', (req: Request, res: Response): void => {
    res.status(200).send({
        status: 'OK',
        time: Number(new Date()),
    });
});

app.use('/supply', (req: Request, res: Response): void => {
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
                    if (reply.ok) {
                        const balance = [reply.body.result.balance]
                        res.status(200).send({balance});
                    } else {
                        res.status(500).send(err);
                    }
                }
            );
    }
);

app.use('/blocks', (req: Request, res: Response): void => {
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
                    if (reply.ok) {
                        const result = [reply.body.result]
                        res.status(200).send({result});
                    } else {
                        res.status(500).send(err);
                    }
                }
            );
    }
);

app.use('/print', (req: Request, res: Response): void => {

    if (req.query.address && req.query.amount) {
        if (req.query.address.length === 0) {
            res.status(400).send({error: 'Please provide a valid address'});
        }else if (parseInt(req.query.amount as string) <= 0) {
            res.status(400).send({error: 'Please provide a valid amount'});
        }else if (parseInt(req.query.amount as string) > 100) {
            res.status(400).send({error: 'Please provide an amount under 100'});
        }else{
            const address = req.query.address
            const amount = req.query.amount
            superagent
                .post(`${API_URL}`)
                .set('Content-Type', 'application/json')
                .send({
                    id: 'faucet',
                    jsonrpc: '2.0',
                    method: 'sendtoaddress',
                    params: [address, amount],
                })
                .end((err, reply) => {
                        if (reply.ok) {
                            const result = [reply.body.result]
                            res.status(200).send({result});
                        } else {
                            res.status(500).send(err);
                        }
                    }
                );
        }
    }
    }
);

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});