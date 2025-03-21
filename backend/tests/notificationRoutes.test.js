describe('Notification Routes', () => {
    it('should send a notification', async () => {
        const res = await request(app).post('/api/notifications/send').send({
            email: 'testuser@example.com',
            message: 'You have been matched to an event!'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Notification sent successfully');
    });

    it('should retrieve notifications for a user', async () => {
        const res = await request(app).get('/api/notifications/testuser@example.com');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
