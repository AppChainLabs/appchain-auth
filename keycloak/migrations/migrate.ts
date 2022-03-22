import KeycloakAdminClient from 'keycloak-admin';
import _ from 'lodash';
import * as fs from 'fs';

const batchSize = 50;
const sleepSec = 3;

const users = require('./users.json');
const credential = require('./credential.json');

const {
    AUTH_URL,
    AUTH_REALM_NAME,
    AUTH_ADMIN_CLIENT,
    AUTH_ADMIN_SECRET,
} = credential;

const authClient = new KeycloakAdminClient({
    baseUrl: AUTH_URL,
    realmName: AUTH_REALM_NAME,
});

const batchRequest = async (functionsMap: Array<() => {}>) => {
    console.log({functionsMap});
    return Promise.all(
        functionsMap.map(async func => func())
    );
}

export const sleep = (sec: number) => {
    console.log(`Sleeping ${sec}(s) before continue`);

    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    })
}

const startMigration = async () => {
    await authClient.auth({
        clientId: AUTH_ADMIN_CLIENT, // probably admin-cli
        clientSecret: AUTH_ADMIN_SECRET,
        grantType: 'client_credentials',
    });


    const requests = users.slice().map(existingUser => {
        return () => new Promise( async resolve => {
            console.log(`Start importing user: ${existingUser.email}`);

            const user = {
                realm: AUTH_REALM_NAME,
                credentials: [
                    {
                        algorithm: 'bcrypt',
                        hashedSaltedValue: existingUser.passwordHash, // the bcrypt-hashed password
                        hashIterations: 10,
                        type: 'password',
                    },
                ],
                email: existingUser.email,
                username: existingUser.username,
                emailVerified: existingUser.email_verified,
                enabled: true,
                requiredActions: []
            };
            try {
                await authClient.users.create(user);
                fs.appendFileSync('./Successful.txt', `${JSON.stringify(user)}\n`);
            } catch (e) {
                console.log(`Error when creating ${user.email}, but allowed to be failed`);
                fs.appendFileSync('./Error.txt', `${JSON.stringify(user)}\n`);
                console.log(e);
            }

            resolve(null);
        });
    })
    const chunkedRequests = _.chunk(requests, batchSize);

    for(let i = 0; i <= chunkedRequests.length - 1; i++) {
        console.log(`\n==== Processing batch at index ${i} ====\n`);

        await batchRequest(chunkedRequests[i]);
        await sleep(sleepSec);
    }
};


startMigration().then(() => {
    console.log('done');
});