describe('Event Routes', () => {
    it('should create a new event', async () => {
        const res = await request(app).post('/api/events/create').send({
            eventName: 'Community Cleanup',
            description: 'Help clean the neighborhood park',
            location: 'City Park',
            skillsRequired: 'Cleaning, Teamwork',
            urgency: 3,
            eventDate: '2025-04-01'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Event created successfully');
    });

    it('should retrieve all events', async () => {
        const res = await request(app).get('/api/events');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
