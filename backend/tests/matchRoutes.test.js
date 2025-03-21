describe('Match Routes', () => {
    it('should match a volunteer to an event', async () => {
        const res = await request(app).post('/api/match/match').send({
            volunteerEmail: 'testuser@example.com',
            eventId: 1
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Volunteer matched successfully');
    });

    it('should retrieve all matches', async () => {
        const res = await request(app).get('/api/match');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
