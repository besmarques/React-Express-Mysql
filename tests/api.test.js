const request = require("supertest");
require('dotenv').config();
const PORT = process.env.APP_PORT || 8080; // Define PORT

describe("API Endpoints", () => {
    const server = `http://localhost:${PORT}`;

    console.log(server)

    it("should return 401 Unauthorized if no authentication is provided", async () => {
        const res = await request(server).get("/api/env");
    
        console.log(res.body); // Log the response body
    
        expect(res.statusCode).toEqual(401);
    });

    it("should return 401 Unauthorized if no authentication is provided", async () => {
        const res = await request(server).get("/api/");
    
        console.log(res.body); // Log the response body
    
        expect(res.statusCode).toEqual(401);
    });

    it("should return 200 Unauthorized if no authentication is provided", async () => {
        const res = await request(server).get("/api/login");
    
        console.log(res.body); // Log the response body
    
        expect(res.statusCode).toEqual(200);
    });

    // Add more tests as needed
});
