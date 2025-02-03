import express from "express";
import { registerUser, verifyOtp } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", async (req, res) => {
  await registerUser(req, res);
});

router.post("/verify-otp", async (req, res) => {
  await verifyOtp(req, res);
});

export default router;

// import express from "express";
// import { registerUser, verifyOtp } from "../controllers/auth.controller";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/verify-otp", verifyOtp);

// export default router;
