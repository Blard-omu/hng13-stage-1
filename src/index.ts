import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// GET /me endpoint
app.get("/me", async (req: Request, res: Response) => {
  try {
    const catFactResponse = await axios.get("https://catfact.ninja/fact", {
      timeout: 5000,
    });

    const catFact =
      catFactResponse.data.fact ||
      "No cat fact available right now. Cats are mysterious!";

    // Generate current UTC timestamp in ISO 8601
    const timestamp = new Date().toISOString();

    const user = {
      email: "peteromu@gmail.com",
      name: "Peter Omu",
      stack: "Node.js/Express/TypeScript",
    };

    // Response structure
    const response = {
      status: "success",
      user,
      timestamp,
      fact: catFact,
    };

    res.set("Content-Type", "application/json");
    res.status(200).json(response);

    // console.log(`Request processed at ${timestamp} - Fact: ${catFact}`);
  } catch (error: any) {
    console.error("Error fetching cat fact:", error.message);

    // Graceful error handling
    res.status(503).json({
      status: "error",
      message:
        error.message || "Service unavailable - Could not fetch cat fact. Try again later.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
