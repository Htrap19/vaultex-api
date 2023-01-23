const request = require('supertest');
const {File} = require("../../../models/file");

let server;
describe('/api/files', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        await server.close();
        await File.remove({}); // Remove all
    });

    describe('GET /', () => {
        it('should return the list of files', async () => {
            await File.collection.insertMany([
                { userId: "userid1", type: 'txt' },
                { userId: "userid2", type: 'txt' },
            ]);

            const res = await request(server)
                .get('/api/files');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            // expect(res.body.some(f => f.userId === 'userid1')).toBeTruthy();
            // expect(res.body.some(f => f.userId === 'userid2')).toBeTruthy();
            expect(res.body[0]).toHaveProperty('userId');
            expect(res.body[1]).toHaveProperty('userId');
        });
    });
});